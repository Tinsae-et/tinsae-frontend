import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/session";

const SIGNIN = "/signin";
const AUTH_PAGES = new Set(["/signin", "/signup"]);
const DASHBOARD = "/dashboard";

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

  // Already signed in? The auth pages have nothing to offer.
  if (AUTH_PAGES.has(pathname)) {
    if (hasRefresh) {
      return NextResponse.redirect(new URL(DASHBOARD, request.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated user trying to hit a protected dashboard route
  if (protectedRoute && !hasRefresh) {
    return redirectToLogin(request, pathname + search);
  }

  // Token is still fresh, or anonymous visitor on a public route
  if (!hasRefresh || hasAccess) {
    return NextResponse.next();
  }

  // Access token expired, but refresh cookie is present: refresh it silently
  try {
    const refreshed = await fetch(new URL("/api/auth/refresh", request.url), {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (!refreshed.ok) {
      if (protectedRoute) return redirectToLogin(request, pathname + search);
      const res = NextResponse.next();
      res.cookies.delete(ACCESS_COOKIE);
      res.cookies.delete(REFRESH_COOKIE);
      return res;
    }

    const setCookies = refreshed.headers.getSetCookie();
    const access = readCookieValue(setCookies, ACCESS_COOKIE);
    if (!access) {
      if (protectedRoute) return redirectToLogin(request, pathname + search);
      const res = NextResponse.next();
      res.cookies.delete(ACCESS_COOKIE);
      res.cookies.delete(REFRESH_COOKIE);
      return res;
    }

    let cookieHeader = withCookie(request.headers.get("cookie"), ACCESS_COOKIE, access);
    const rotated = readCookieValue(setCookies, REFRESH_COOKIE);
    if (rotated) cookieHeader = withCookie(cookieHeader, REFRESH_COOKIE, rotated);

    const headers = new Headers(request.headers);
    headers.set("cookie", cookieHeader);

    const res = NextResponse.next({ request: { headers } });
    for (const cookie of setCookies) res.headers.append("set-cookie", cookie);
    return res;
  } catch {
    if (protectedRoute) return redirectToLogin(request, pathname + search);
    return NextResponse.next();
  }
}

/** Pulls one cookie's value out of a Set-Cookie header list. */
function readCookieValue(setCookies: string[], name: string): string | undefined {
  const header = setCookies.find((cookie) => cookie.startsWith(`${name}=`));
  const value = header?.slice(name.length + 1).split(";")[0];
  return value || undefined;
}

/** Replaces (or adds) one cookie in a request's Cookie header. */
function withCookie(header: string | null, name: string, value: string): string {
  const others = (header ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith(`${name}=`));
  return [...others, `${name}=${value}`].join("; ");
}

function redirectToLogin(request: NextRequest, from: string) {
  const url = new URL(SIGNIN, request.url);
  if (from && from !== "/") url.searchParams.set("next", from);
  const res = NextResponse.redirect(url);
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
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
