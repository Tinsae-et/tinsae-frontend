import "server-only";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { CATALOG_TAG } from "@/lib/api/public";
import { SERVER_API_URL } from "@/lib/config";
import { authedFetch } from "./authed-fetch";
import { rejectCrossOrigin } from "./route-helpers";
import { clearSessionCookies, setAccessCookie, setRefreshCookie } from "./session";

/**
 * Forwards a browser request to Django as the signed-in user.
 *
 * Every /api/shop route is this and nothing else: the browser calls a
 * same-origin URL with only an httpOnly cookie it cannot read, and the
 * Authorization header is attached here (see ./authed-fetch). It used to be
 * copy-pasted into each route, and the copies drifted — some checked Origin or
 * guarded malformed bodies and some did not. One implementation means one set
 * of rules:
 *
 *  - state-changing methods get the same Origin check as the auth routes;
 *  - a malformed JSON body is a 400, not an unhandled 500;
 *  - a finished session is a 401 and its cookies are cleared, so the next
 *    navigation lands on /signin instead of retrying a dead refresh token;
 *  - rotated tokens are written back, or the browser keeps a revoked one;
 *  - a non-JSON upstream error (a proxy's HTML 502 page) never reaches the
 *    client dressed up as JSON.
 *
 * Django still decides whether this user may touch `path`.
 */
export async function proxyToDjango(
  request: Request,
  path: string,
  { search }: { search?: URLSearchParams } = {},
): Promise<NextResponse> {
  const method = request.method.toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    const blocked = rejectCrossOrigin(request);
    if (blocked) return blocked;
  }

  let init: RequestInit;
  try {
    init = await forwardBody(request, method);
  } catch {
    return NextResponse.json({ detail: "Malformed request body." }, { status: 400 });
  }

  const qs = search?.toString();
  const target = `${SERVER_API_URL}/api/v1/${path}${qs ? `?${qs}` : ""}`;

  let result: Awaited<ReturnType<typeof authedFetch>>;
  try {
    result = await authedFetch(target, init);
  } catch (error) {
    console.error("[api] Django unreachable", method, path, error);
    return NextResponse.json(
      { detail: "Tinsae is having trouble right now. Try again shortly." },
      { status: 502 },
    );
  }

  if (!result.ok) {
    const res = NextResponse.json(
      { detail: "Your session has ended. Sign in again." },
      { status: 401 },
    );
    if (result.reason === "expired") clearSessionCookies(res);
    return res;
  }

  const upstream = result.response;
  const text = await upstream.text();
  const isJson = (upstream.headers.get("content-type") ?? "").includes("json");

  const res =
    text && !isJson
      ? NextResponse.json(
          { detail: "Tinsae is having trouble right now. Try again shortly." },
          { status: upstream.ok ? 502 : upstream.status },
        )
      : new NextResponse(text || null, {
          status: upstream.status,
          headers: text ? { "content-type": "application/json" } : undefined,
        });

  if (result.rotated) {
    setAccessCookie(res, result.rotated.access);
    if (result.rotated.refresh) setRefreshCookie(res, result.rotated.refresh);
  }

  // Public pages serve cached catalogue reads (lib/api/public). A merchant who
  // just edited a listing or their profile should see it there immediately,
  // not a minute later, so any successful write expires the cache outright.
  if (method !== "GET" && method !== "HEAD" && upstream.ok) {
    revalidateTag(CATALOG_TAG, { expire: 0 });
  }

  return res;
}

/** The body to send upstream, re-encoded; throws on malformed JSON. */
async function forwardBody(request: Request, method: string): Promise<RequestInit> {
  if (method === "GET" || method === "HEAD" || method === "DELETE") return { method };

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    return { method, body: await request.formData() };
  }

  const raw = await request.text();
  if (!raw) return { method };

  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(JSON.parse(raw)),
  };
}

/** Encodes each segment of a path built from route params. */
export function djangoPath(...segments: string[]): string {
  return `${segments.map(encodeURIComponent).join("/")}/`;
}
