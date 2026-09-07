// Session storage: two httpOnly cookies, written only by route handlers and
// the middleware.
//
// Why cookies and not localStorage: the ticket pairs "stored securely" with
// "unauthenticated users hitting /dashboard are redirected". Middleware cannot
// read localStorage, so a client-stored token means rendering the dashboard and
// then bouncing — a flash of protected chrome and a redirect the user watches
// happen. httpOnly also keeps both tokens out of reach of any XSS on the page.
//
// The access cookie's max-age mirrors the token's own lifetime, so the cookie
// vanishing *is* the expiry signal. No clock comparison, no decoding a JWT in
// the middleware.
import { cache } from "react";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { authDriver } from "./driver";
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS } from "./tokens";
import type { AuthTokens, AuthUser } from "./types";

/**
 * Cookies are Secure — and therefore `__Host-` prefixed — wherever the app is
 * served over TLS.
 *
 * `__Host-` is the strongest binding a cookie can have: the browser refuses it
 * unless it is Secure, Path=/, and carries no Domain, which means a subdomain
 * (or anything that manages to control one) cannot overwrite the session. The
 * prefix has to follow the Secure flag exactly, since a `__Host-` cookie
 * without Secure is silently dropped.
 *
 * Caveat for local testing: over plain http on something other than localhost
 * — a LAN address, say — Secure cookies are not stored at all. Run over
 * localhost, or terminate TLS, when testing sign-in by hand.
 */
const SECURE_COOKIES = process.env.NODE_ENV === "production";
const PREFIX = SECURE_COOKIES ? "__Host-" : "";

export const ACCESS_COOKIE = `${PREFIX}tinsae_access`;
export const REFRESH_COOKIE = `${PREFIX}tinsae_refresh`;

function options(maxAge: number) {
  return {
    httpOnly: true,
    // Lax, not Strict: a link from a Telegram message into the dashboard should
    // arrive signed in. Lax still withholds the cookie from cross-site POSTs,
    // which is the shape CSRF takes.
    sameSite: "lax" as const,
    secure: SECURE_COOKIES,
    path: "/",
    maxAge,
  };
}

export function setSessionCookies(res: NextResponse, tokens: AuthTokens): void {
  res.cookies.set(ACCESS_COOKIE, tokens.access, options(ACCESS_TTL_SECONDS));
  res.cookies.set(REFRESH_COOKIE, tokens.refresh, options(REFRESH_TTL_SECONDS));
}

export function setAccessCookie(res: NextResponse, access: string): void {
  res.cookies.set(ACCESS_COOKIE, access, options(ACCESS_TTL_SECONDS));
}

/**
 * Stores a rotated refresh token.
 *
 * Separate from `setSessionCookies` because a refresh returns a new refresh
 * token but no new *session* — the user is the same and there is nothing else
 * to write. Skipping this is what silently ends a session: the backend has
 * already blacklisted the token still sitting in the browser.
 */
export function setRefreshCookie(res: NextResponse, refresh: string): void {
  res.cookies.set(REFRESH_COOKIE, refresh, options(REFRESH_TTL_SECONDS));
}

export function clearSessionCookies(res: NextResponse): void {
  // Dropping the cookies is only half of a logout: the refresh token stays
  // usable until it is blacklisted server-side. `/api/auth/logout` calls the
  // backend's POST /auth/logout/ to do that. This function is also used on
  // paths where there is nobody left to ask (an expired or rejected refresh),
  // which is why it stays a pure cookie operation.
  res.cookies.set(ACCESS_COOKIE, "", options(0));
  res.cookies.set(REFRESH_COOKIE, "", options(0));
}

/** Read the current session inside a Server Component. Read-only by design. */
export async function readSession(): Promise<{
  access?: string;
  refresh?: string;
}> {
  const jar = await cookies();
  return {
    access: jar.get(ACCESS_COOKIE)?.value,
    refresh: jar.get(REFRESH_COOKIE)?.value,
  };
}

/**
 * Deduplicated user session fetch for Server Components.
 * Wrapped in React cache() so concurrent layout/page renders share a single
 * round trip to authDriver.me() per request.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const { access } = await readSession();
  if (!access) return null;
  return authDriver.me(access).catch(() => null);
});
