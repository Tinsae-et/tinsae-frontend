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
 *
 * Two opt-ins, both off by default:
 *  - `anonymous`: an endpoint Django also serves to signed-out visitors (the
 *    contact-intent log). Without a usable session the call goes out without a
 *    token instead of answering 401; a session that just expired still has its
 *    cookies cleared.
 *  - `forwardClient`: pass the browser's address and user agent on, for
 *    endpoints that throttle or filter bots by them. Same trust model as the
 *    auth driver: the edge proxy owns X-Forwarded-For (see CLAUDE.md,
 *    "Client IP").
 */
export async function proxyToDjango(
  request: Request,
  path: string,
  {
    search,
    revalidateCatalog = true,
    anonymous = false,
    forwardClient = false,
  }: {
    search?: URLSearchParams;
    revalidateCatalog?: boolean;
    anonymous?: boolean;
    forwardClient?: boolean;
  } = {},
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
  if (forwardClient) {
    init.headers = { ...(init.headers as Record<string, string> | undefined), ...clientHeaders(request) };
  }

  const qs = search?.toString();
  const target = `${SERVER_API_URL}/api/v1/${path}${qs ? `?${qs}` : ""}`;

  let result: Awaited<ReturnType<typeof authedFetch>>;
  let expired = false;
  try {
    result = await authedFetch(target, init);
    if (!result.ok && anonymous) {
      expired = result.reason === "expired";
      result = {
        ok: true,
        response: await fetch(target, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(ANONYMOUS_TIMEOUT_MS),
        }),
      };
    }
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
  if (expired) clearSessionCookies(res);

  // Public pages serve cached catalogue reads (lib/api/public). A merchant who
  // just edited a listing or their profile should see it there immediately,
  // not a minute later, so any successful write expires the cache outright.
  // Writes that can't touch the catalogue (marking a notification read) opt
  // out, or every click would wipe it.
  if (revalidateCatalog && method !== "GET" && method !== "HEAD" && upstream.ok) {
    revalidateTag(CATALOG_TAG, { expire: 0 });
  }

  return res;
}

/** Matches authedFetch's ceiling, so both paths fail at the same point. */
const ANONYMOUS_TIMEOUT_MS = 10_000;

/** The browser's address and user agent, for `forwardClient`. */
function clientHeaders(request: Request): Record<string, string> {
  const out: Record<string, string> = {};
  const forwardedFor =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");
  if (forwardedFor) out["X-Forwarded-For"] = forwardedFor;
  if (userAgent) out["User-Agent"] = userAgent;
  return out;
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

/**
 * The same request with a body the route has already checked, for routes that
 * validate before proxying. Only the headers proxyToDjango reads are carried
 * over (the session itself travels in cookies, read via next/headers), so the
 * original's Content-Length can't disagree with the new body.
 */
export function withVettedBody(request: Request, body: unknown): Request {
  const headers = new Headers({ "content-type": "application/json" });
  for (const name of ["origin", "host", "x-forwarded-for", "x-real-ip", "user-agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Request(request.url, { method: request.method, headers, body: JSON.stringify(body) });
}

/** Encodes each segment of a path built from route params. */
export function djangoPath(...segments: string[]): string {
  return `${segments.map(encodeURIComponent).join("/")}/`;
}
