import { describe, expect, it } from "vitest";

import {
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
  accessCookieMaxAge,
  refreshCookieMaxAge,
  signMockToken,
} from "./tokens";

describe("accessCookieMaxAge", () => {
  it("expires the cookie before the token it carries", () => {
    const token = signMockToken("user-1", "access", ACCESS_TTL_SECONDS);

    const maxAge = accessCookieMaxAge(token);

    // Strictly shorter, so the cookie is always dropped before the token dies
    // and the proxy's presence check never presents a token Django would reject.
    expect(maxAge).toBeGreaterThan(0);
    expect(maxAge).toBeLessThan(ACCESS_TTL_SECONDS);
  });

  it("tracks the token's own exp rather than the TTL constant", () => {
    // A backend issuing a shorter-lived access token than ACCESS_TTL_SECONDS:
    // the old flat max-age let the cookie outlive it by minutes.
    const token = signMockToken("user-1", "access", 120);

    const maxAge = accessCookieMaxAge(token);

    expect(maxAge).toBeGreaterThan(0);
    expect(maxAge).toBeLessThanOrEqual(120);
  });

  it("never returns a negative max-age for an already-expired token", () => {
    const token = signMockToken("user-1", "access", -60);

    expect(accessCookieMaxAge(token)).toBe(0);
  });

  it("falls back to the TTL constant for a token it cannot decode", () => {
    expect(accessCookieMaxAge("opaque-token")).toBe(ACCESS_TTL_SECONDS);
  });
});

describe("refreshCookieMaxAge", () => {
  it("expires the cookie before the token it carries", () => {
    const token = signMockToken("user-1", "refresh", REFRESH_TTL_SECONDS);

    const maxAge = refreshCookieMaxAge(token);

    expect(maxAge).toBeGreaterThan(0);
    expect(maxAge).toBeLessThan(REFRESH_TTL_SECONDS);
  });

  it("tracks a backend refresh lifetime shorter than the constant", () => {
    const token = signMockToken("user-1", "refresh", 3600);

    expect(refreshCookieMaxAge(token)).toBeLessThanOrEqual(3600);
  });

  it("falls back to the TTL constant for a token it cannot decode", () => {
    expect(refreshCookieMaxAge("opaque-token")).toBe(REFRESH_TTL_SECONDS);
  });
});
