import { NextResponse } from "next/server";

import { AuthApiError } from "./types";

/**
 * Rejects state-changing requests that a browser tells us came from elsewhere.
 *
 * SameSite=Lax already withholds the session cookies from cross-site POSTs, and
 * a JSON content-type forces a preflight these route handlers never answer — so
 * this is the third lock, not the first. It is checked only when `Origin` is
 * present: browsers always send it on fetch, while server-to-server callers
 * (the proxy's refresh hop, curl in tests) legitimately omit it and carry no
 * ambient cookies to abuse.
 */
export function rejectCrossOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const host = request.headers.get("host");
  try {
    if (new URL(origin).host === host) return null;
  } catch {
    // An unparseable Origin is not a same-origin one.
  }
  return NextResponse.json({ detail: "Request blocked." }, { status: 403 });
}

/**
 * Turns a driver error into the JSON body the forms know how to render.
 *
 * Anything that isn't an AuthApiError is a bug or an unreachable backend, so it
 * becomes a 502 rather than leaking a stack trace to the browser.
 */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { detail: "Invalid JSON in request body." },
      { status: 400 },
    );
  }
  if (error instanceof AuthApiError) {
    return NextResponse.json(
      { detail: error.detail, code: error.code, fieldErrors: error.fieldErrors },
      { status: error.status },
    );
  }
  console.error("[auth] unexpected driver error", error);
  return NextResponse.json(
    { detail: "Tinsae is having trouble right now. Try again shortly." },
    { status: 502 },
  );
}
