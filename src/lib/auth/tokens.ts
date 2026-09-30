// Token lifetimes, and fake-but-shaped JWTs for the mock driver.
//
// Two audiences, which is worth knowing before editing either half. The
// *signing* half is mock-only: real header.payload.signature strings with a
// real `exp`, so everything downstream exercises the same code paths it will
// against simplejwt. Its signature is decorative — nothing verifies it, and
// nothing should.
//
// The *constants* below are not mock-only. session.ts reads them for every
// cookie it writes, in http mode as much as mock, so they are the browser's
// copy of the backend's token lifetimes and have to track them.

/**
 * Mirrors the backend's SIMPLE_JWT block (config/settings/base.py).
 *
 * These are cookie max-ages as well as mock-token lifetimes, so they have to
 * track the real settings: a cookie that expires early logs a merchant out
 * while their token is still perfectly valid. They were 5 minutes and 24 hours
 * — simplejwt's library defaults, from back when the backend set no SIMPLE_JWT
 * block — which signed merchants out once a day against a 14-day token.
 */
export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 14 * 24 * 60 * 60;

type Payload = {
  token_type: "access" | "refresh";
  user_id: string;
  exp: number;
  iat: number;
  jti: string;
};

function b64url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function signMockToken(
  userId: string,
  type: Payload["token_type"],
  ttlSeconds: number,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    token_type: type,
    user_id: userId,
    exp: now + ttlSeconds,
    iat: now,
    jti: crypto.randomUUID().replace(/-/g, ""),
  };
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  return `${head}.${b64url(JSON.stringify(payload))}.mock-signature`;
}

/** Decodes a JWT's payload without verifying its signature. */
function decodePayload(token: string): Payload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Payload;
  } catch {
    return null;
  }
}

/** The `exp` (epoch seconds) of a JWT payload, or null if it cannot be read. */
function readTokenExp(token: string): number | null {
  const payload = decodePayload(token);
  return payload ? payload.exp : null;
}

/** Returns null for anything malformed or past its `exp`. */
export function readMockToken(token: string): Payload | null {
  const payload = decodePayload(token);
  if (!payload || payload.exp * 1000 <= Date.now()) return null;
  return payload;
}

/**
 * Cookies are dropped this many seconds before the token they carry expires,
 * so the browser never presents a token the backend has already rejected.
 */
const COOKIE_MARGIN_SECONDS = 30;

/**
 * Max-Age for a cookie that carries a JWT: the token's remaining life, less a
 * margin, or `fallback` when the payload cannot be read.
 *
 * A flat TTL is anchored to response time, not to the token's own `exp`. Next
 * writes the cookie *after* the token is minted, so the cookie outlived the
 * token by the round-trip latency — and by more whenever the backend's real
 * lifetime was shorter than the constant. On the access cookie that window was
 * the bug: the proxy read a present cookie as a live session and skipped the
 * refresh, /me answered 401, and a signed-in merchant rendered signed-out until
 * the cookie finally lapsed. Deriving from `exp` keeps the cookie the shorter
 * of the two, which is the signal the proxy relies on.
 */
function tokenCookieMaxAge(token: string, fallback: number): number {
  const exp = readTokenExp(token);
  if (exp === null) return fallback;
  const remaining = exp - Math.floor(Date.now() / 1000) - COOKIE_MARGIN_SECONDS;
  return Math.max(remaining, 0);
}

/** Max-Age for the access cookie. Falls back to ACCESS_TTL_SECONDS. */
export function accessCookieMaxAge(token: string): number {
  return tokenCookieMaxAge(token, ACCESS_TTL_SECONDS);
}

/**
 * Max-Age for the refresh cookie. Falls back to REFRESH_TTL_SECONDS.
 *
 * The same derivation, so a backend refresh lifetime shorter than fourteen days
 * drops the cookie when the token dies rather than leaving a dead session the
 * proxy keeps trying to refresh.
 */
export function refreshCookieMaxAge(token: string): number {
  return tokenCookieMaxAge(token, REFRESH_TTL_SECONDS);
}
