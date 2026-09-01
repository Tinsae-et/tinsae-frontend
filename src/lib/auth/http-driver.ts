// The real endpoints, per the handoff's Data section:
//   POST /auth/otp/request   POST /auth/otp/verify   POST /auth/telegram
//
// None of these exist on tinsae-backend yet — it ships username/password
// registration plus simplejwt's /auth/token/ pair. This file is written to the
// contract the design specifies so that integration is a flag flip; if the
// backend lands a different shape, this is the only file that changes.
import {
  AuthApiError,
  type AuthDriver,
  type AuthMode,
  type AuthTokens,
  type AuthUser,
  type LoginInput,
  type OtpRequest,
  type OtpRequestResult,
  type OtpVerify,
  type RefreshResult,
  type Role,
  type Session,
} from "./types";

// Server-side only: every auth call goes out from a route handler or the proxy,
// never the browser, so the internal host is the right default and CORS never
// enters into it.
const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

const AUTH = `${API_URL}/api/v1/auth`;

/**
 * Ceiling on a single call to Django.
 *
 * Node's fetch does eventually give up on its own, but on undici's defaults —
 * minutes, and not ours to rely on. `refresh` in particular is held under a
 * per-token lock, so a request that hangs holds every other caller for that
 * token behind it (see ./refresh-lock). Failing at ten seconds turns a stalled
 * session into one retryable error.
 */
const REQUEST_TIMEOUT_MS = 10_000;

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AUTH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return unwrap<T>(res);
}

async function unwrap<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T;

  // DRF answers with JSON for every error it raises itself; a proxy or a 500
  // page may not, so fall back to a synthetic detail rather than throwing a
  // parse error over the top of the real status.
  let body: Record<string, unknown>;
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = { detail: `Request failed with ${res.status}` };
  }
  throw new AuthApiError(res.status, body);
}

/**
 * For endpoints that answer without a body.
 *
 * `res.json()` on an empty response throws a parse error over the top of a
 * perfectly successful call. Logout answers 205 RESET_CONTENT (users/views.py),
 * which is the only bodiless response this driver makes today.
 *
 * Branching on `res.ok` rather than on 205 is what keeps that true as more
 * arrive: DRF's other bodiless answer is 204 on DELETE, and a guard written
 * against one of the two numbers throws on the other.
 */
async function unwrapEmpty(res: Response): Promise<void> {
  if (res.ok) return;
  let body: Record<string, unknown>;
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = { detail: `Request failed with ${res.status}` };
  }
  throw new AuthApiError(res.status, body);
}

export const httpDriver: AuthDriver = {
  async login(input: LoginInput): Promise<Session> {
    // simplejwt's TokenObtainPairView returns tokens only, so the user comes
    // from a second call. Two round trips, but the alternative is inventing a
    // response shape the backend doesn't send.
    const tokens = await post<AuthTokens>("/token/", input);
    const user = await httpDriver.me(tokens.access);
    return { ...tokens, user };
  },

  requestOtp(input: OtpRequest): Promise<OtpRequestResult> {
    return post<OtpRequestResult>("/otp/request/", input);
  },

  verifyOtp(input: OtpVerify): Promise<Session> {
    return post<Session>("/otp/verify/", input);
  },

  telegram(payload: Record<string, string>, mode: AuthMode, role?: Role): Promise<Session> {
    // The widget's payload is passed through whole: the backend has to verify
    // its hash against the bot token, and dropping fields would break that.
    return post<Session>("/telegram/", { ...payload, mode, role });
  },

  refresh(refreshToken: string): Promise<RefreshResult> {
    // The response carries a *new* refresh token as well as the access token:
    // ROTATE_REFRESH_TOKENS is on, and BLACKLIST_AFTER_ROTATION blacklists the
    // one we just spent. Whoever calls this has to store both.
    return post<RefreshResult>("/token/refresh/", { refresh: refreshToken });
  },

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    // Authenticated *and* carrying the token to revoke: the view checks that
    // the refresh token belongs to the caller before blacklisting it.
    const res = await fetch(`${AUTH}/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return unwrapEmpty(res);
  },

  async me(accessToken: string): Promise<AuthUser> {
    const res = await fetch(`${AUTH}/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return unwrap<AuthUser>(res);
  },

  async createShop(accessToken: string, input: { name: string; city: string; phone: string; description?: string; telegram_chat_id?: string }) {
    const res = await fetch(`${API_URL}/api/v1/shops/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return unwrap(res);
  },
};
