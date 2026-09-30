import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setAccessCookie,
  setRefreshCookie,
  setSessionCookies,
} from "./session";
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS, signMockToken } from "./tokens";

function maxAge(res: NextResponse, name: string): number | undefined {
  const header = res.headers.getSetCookie().find((c) => c.startsWith(`${name}=`));
  const match = header?.match(/Max-Age=(\d+)/);
  return match ? Number(match[1]) : undefined;
}

describe("cookie lifetimes", () => {
  it("sets the access cookie from its token exp, before the token dies", () => {
    const access = signMockToken("user-1", "access", ACCESS_TTL_SECONDS);
    const res = NextResponse.json({});

    setAccessCookie(res, access);

    const ttl = maxAge(res, ACCESS_COOKIE);
    expect(ttl).toBeDefined();
    expect(ttl!).toBeGreaterThan(0);
    expect(ttl!).toBeLessThan(ACCESS_TTL_SECONDS);
  });

  it("does the same for both cookies on the full sign-in flow", () => {
    const access = signMockToken("user-1", "access", ACCESS_TTL_SECONDS);
    const refresh = signMockToken("user-1", "refresh", REFRESH_TTL_SECONDS);
    const res = NextResponse.json({});

    setSessionCookies(res, { access, refresh });

    expect(maxAge(res, ACCESS_COOKIE)).toBeLessThan(ACCESS_TTL_SECONDS);
    expect(maxAge(res, REFRESH_COOKIE)).toBeLessThan(REFRESH_TTL_SECONDS);
  });

  it("derives the rotated refresh cookie from its token", () => {
    const refresh = signMockToken("user-1", "refresh", 3600);
    const res = NextResponse.json({});

    setRefreshCookie(res, refresh);

    expect(maxAge(res, REFRESH_COOKIE)).toBeLessThanOrEqual(3600);
  });
});
