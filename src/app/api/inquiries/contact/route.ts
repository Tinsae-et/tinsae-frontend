import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { SERVER_API_URL } from "@/lib/config";
import { authedFetch } from "@/lib/auth/authed-fetch";
import { rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { setAccessCookie, setRefreshCookie } from "@/lib/auth/session";

/**
 * Forwards tracked contact intent requests to Django.
 *
 * Captures buyer intent (deep-linking to Telegram or revealing/calling a phone
 * number) for conversion analytics while enforcing anti-scraping protections:
 * - Phone numbers require an authenticated user account (enforced backend-side).
 * - Honeypot and automated user-agent blocks filter scraping bots.
 * - Same-origin guard prevents CSRF.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Malformed request body." },
      { status: 400 },
    );
  }

  const reqHeaders = await headers();
  const forwardedFor =
    reqHeaders.get("x-forwarded-for") ?? reqHeaders.get("x-real-ip");
  const userAgent = reqHeaders.get("user-agent");

  const forwardHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (forwardedFor) forwardHeaders["X-Forwarded-For"] = forwardedFor;
  if (userAgent) forwardHeaders["User-Agent"] = userAgent;

  const target = `${SERVER_API_URL}/api/v1/inquiries/contact/`;

  // Try authedFetch first to carry signed-in credentials
  const authed = await authedFetch(target, {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify(body),
  });

  let upstream: Response;
  let rotated: { access: string; refresh?: string } | undefined;

  if (authed.ok) {
    upstream = authed.response;
    rotated = authed.rotated;
  } else {
    // Anonymous user (no session or expired session)
    try {
      upstream = await fetch(target, {
        method: "POST",
        headers: forwardHeaders,
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      console.error("[api] Django unreachable for contact intent", err);
      return NextResponse.json(
        { detail: "Tinsae is having trouble right now. Try again shortly." },
        { status: 502 },
      );
    }
  }

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

  if (rotated) {
    setAccessCookie(res, rotated.access);
    if (rotated.refresh) setRefreshCookie(res, rotated.refresh);
  }

  return res;
}
