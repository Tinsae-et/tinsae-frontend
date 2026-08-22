// Fake-but-shaped JWTs for the mock driver.
//
// Real header.payload.signature strings with a real `exp`, so everything
// downstream (cookie max-age, the middleware refresh, the 401 retry) exercises
// the same code paths it will against simplejwt. The signature is decorative —
// nothing verifies it, and nothing should: this module never runs in http mode.

/** simplejwt defaults, because config/settings/base.py sets no SIMPLE_JWT block. */
export const ACCESS_TTL_SECONDS = 5 * 60;
export const REFRESH_TTL_SECONDS = 24 * 60 * 60;

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
