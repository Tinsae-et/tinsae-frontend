import { NextResponse, type NextRequest } from "next/server";

import { authDriver } from "@/lib/auth/driver";
import { refreshOnce } from "@/lib/auth/refresh-lock";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  setAccessCookie,
  setRefreshCookie,
} from "@/lib/auth/session";
import { AuthApiError } from "@/lib/auth/types";

const SIGNIN = "/signin";

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/shop/dashboard") ||
    pathname === "/shop/onboarding" ||
    pathname.startsWith("/account")
  );
}

/**
 * Guards protected pages, and keeps access tokens transparently fresh
 * across both protected and public surfaces.
 *
 * When an access token expires (15 minutes), any request bearing a valid
 * refresh cookie is refreshed on the fly. Downstream Server Components
 * (like SiteHeader in the common layout) see a valid user immediately,
 * preventing logged-in merchants from appearing logged-out on public pages.
 */
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasRefresh = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  const hasAccess = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);
  const protectedRoute = isProtectedRoute(pathname);

  // /signin and /signup are deliberately not special-cased here. Redirecting
  // them to the dashboard on cookie *presence* looped whenever the cookies were
  // stale: the dashboard bounced back to /signin, which bounced forward again.
  // The pages themselves redirect once /me/ confirms the session is live.

  // Unauthenticated user trying to hit a protected dashboard route
  if (protectedRoute && !hasRefresh) {
    return redirectToLogin(request, pathname + search);
  }

  // Token is still fresh, or anonymous visitor on a public route
  if (!hasRefresh || hasAccess) {
    return NextResponse.next();
  }

  // Access token expired, but refresh cookie is present: refresh it silently.
  //
  // In-process, not by fetching our own /api/auth/refresh over HTTP. That
  // hairpin reached Django from this server's address, so every user's
  // refresh shared one per-IP throttle bucket (60/min) — busy enough, and
  // signed-in merchants start getting logged out. The browser's address is
  // passed through instead, and the round trip through the load balancer goes.
  const refresh = request.cookies.get(REFRESH_COOKIE)!.value;
  const forwardedFor =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;

  let renewed: { access: string; refresh?: string };
  try {
    renewed = await refreshOnce(refresh, () => authDriver.refresh(refresh, forwardedFor));
  } catch (error) {
    // A rejected token ends the session. Anything else — Django down, a
    // timeout, a 429 — is transient: keep the cookies and try again on the
    // next navigation rather than signing the merchant out.
    const rejected =
      error instanceof AuthApiError && [400, 401, 403].includes(error.status);
    if (protectedRoute) return redirectToLogin(request, pathname + search, rejected);
    const res = NextResponse.next();
    if (rejected) clearSessionCookies(res);
    return res;
  }

  // Downstream Server Components read cookies from the *request*, so the new
  // tokens go there as well as onto the response for the browser.
  let cookieHeader = withCookie(request.headers.get("cookie"), ACCESS_COOKIE, renewed.access);
  if (renewed.refresh) cookieHeader = withCookie(cookieHeader, REFRESH_COOKIE, renewed.refresh);

  const headers = new Headers(request.headers);
  headers.set("cookie", cookieHeader);

  const res = NextResponse.next({ request: { headers } });
  setAccessCookie(res, renewed.access);
  // Rotation blacklists the token we just spent; without the replacement the
  // next refresh would fail and end the session.
  if (renewed.refresh) setRefreshCookie(res, renewed.refresh);
  return res;
}

/** Replaces (or adds) one cookie in a request's Cookie header. */
function withCookie(header: string | null, name: string, value: string): string {
  const others = (header ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith(`${name}=`));
  return [...others, `${name}=${value}`].join("; ");
}

function redirectToLogin(request: NextRequest, from: string, clear = true) {
  const url = new URL(SIGNIN, request.url);
  if (from && from !== "/") url.searchParams.set("next", from);
  const res = NextResponse.redirect(url);
  // Not res.cookies.delete(): that omits `Secure`, and browsers ignore a
  // __Host- cookie set without it — so in production the stale cookies
  // survived every "delete". Clear with the attributes they were set with.
  if (clear) clearSessionCookies(res);
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - static files (_next/static/*, _next/image/*, favicon.ico, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
