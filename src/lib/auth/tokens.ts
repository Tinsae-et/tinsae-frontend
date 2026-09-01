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

/** Returns null for anything malformed or past its `exp`. */
export function readMockToken(token: string): Payload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as Payload;
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
