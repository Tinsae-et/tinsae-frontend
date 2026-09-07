import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/session";

const SIGNIN = "/signin";
const AUTH_PAGES = new Set(["/signin", "/signup"]);
const DASHBOARD = "/dashboard";

/**
 * Guards the dashboard, and keeps the access token fresh on the way in.
 *
 * The access cookie expires with its token (fifteen minutes — see
 * lib/auth/tokens, which mirrors the backend's SIMPLE_JWT block), so
 * "cookie missing but refresh cookie present" means exactly one thing: the
 * token aged out and we should mint another before rendering. This file is the
 * only place that can happen: it is the last point in the request that can
 * still write a cookie the page will see. (Next 16 renamed the `middleware`
 * convention to `proxy`.)
 */
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasRefresh = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);

  // Already signed in? The auth pages have nothing to offer.
  if (AUTH_PAGES.has(pathname)) {
    if (hasRefresh) {
      return NextResponse.redirect(new URL(DASHBOARD, request.url));
    }
    return NextResponse.next();
  }

  if (!hasRefresh) return redirectToLogin(request, pathname + search);

  if (request.cookies.get(ACCESS_COOKIE)?.value) return NextResponse.next();

  const refreshed = await fetch(new URL("/api/auth/refresh", request.url), {
    method: "POST",
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  if (!refreshed.ok) return redirectToLogin(request, pathname + search);

  const setCookies = refreshed.headers.getSetCookie();
  const access = readCookieValue(setCookies, ACCESS_COOKIE);
  if (!access) return redirectToLogin(request, pathname + search);

  // Two separate jobs, and missing either one breaks the request:
  //  - the *request* headers going downstream need the new token, because the
  //    page reads cookies off the incoming request and a Set-Cookie it never
  //    sees would send it straight back to /login;
  //  - the *response* needs it too, so the browser holds the new token for the
  //    rest of its lifetime instead of repeating this on every navigation.
  let cookieHeader = withCookie(request.headers.get("cookie"), ACCESS_COOKIE, access);

  // The backend rotates refresh tokens, so this hop usually replaces that
  // cookie too, and the one the request arrived with is now blacklisted. Carry
  // the replacement downstream for the same reason as the access token: a
  // Server Component under this matcher reads cookies off the incoming request,
  // and handing it a token the backend has already revoked hands it a session
  // that dies on its next refresh.
  //
  // This does not reach the /api/auth routes — the matcher below covers pages
  // only, so nothing under /api/* ever passes through here.
  const rotated = readCookieValue(setCookies, REFRESH_COOKIE);
  if (rotated) cookieHeader = withCookie(cookieHeader, REFRESH_COOKIE, rotated);

  const headers = new Headers(request.headers);
  headers.set("cookie", cookieHeader);

  const res = NextResponse.next({ request: { headers } });
  for (const cookie of setCookies) res.headers.append("set-cookie", cookie);
  return res;
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
  // Send them back where they were aiming, not blindly to the dashboard root.
  if (from && from !== "/") url.searchParams.set("next", from);
  const res = NextResponse.redirect(url);
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/shop/:path*",
    "/account/:path*",
    "/signin",
    "/signup",
  ],
};
