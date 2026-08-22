import { NextResponse } from "next/server";

import { rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { cookies } from "next/headers";

import { authDriver } from "@/lib/auth/driver";
import {
  REFRESH_COOKIE,
  clearSessionCookies,
  setAccessCookie,
} from "@/lib/auth/session";
import { AuthApiError } from "@/lib/auth/types";

/**
 * Mints a new access token from the refresh cookie.
 *
 * The middleware calls this on its way to a protected route, which is the only
 * place a new cookie can actually be written before the page renders — Server
 * Components can read cookies but not set them.
 */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;

  if (!refresh) {
    return NextResponse.json({ detail: "No session" }, { status: 401 });
  }

  try {
    const { access } = await authDriver.refresh(refresh);
    const res = NextResponse.json({ ok: true });
    setAccessCookie(res, access);
    return res;
  } catch (error) {
    // The refresh token is spent or rejected: the session is over, so take the
    // stale cookies with us rather than leaving the browser to retry forever.
    const status = error instanceof AuthApiError ? error.status : 500;
    const res = NextResponse.json({ detail: "Session expired" }, { status });
    clearSessionCookies(res);
    return res;
  }
}
