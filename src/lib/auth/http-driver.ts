// The Django auth surface, split into what exists and what does not.
//
// Live today (users/urls.py):
//   POST /auth/register/   POST /auth/token/   POST /auth/token/refresh/
//   POST /auth/logout/     GET  /auth/me/
//
// Written to the handoff's contract but NOT yet routed on the backend:
//   POST /auth/otp/request   POST /auth/otp/verify   POST /auth/telegram
// These return 404 against a real server. `register` is the path that works,
// and it is what /signup uses whenever AUTH_DRIVER=http; the OTP and Telegram
// flows stay reachable under the mock driver so the designed UX keeps running
// until the backend lands them. If the backend ships a different shape, this
// is the only file that changes.
import { headers } from "next/headers";

import { SERVER_API_URL } from "@/lib/config";
import {
  AuthApiError,
  type AuthDriver,
  type AuthMode,
  type AuthTokens,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
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
const AUTH = `${SERVER_API_URL}/api/v1/auth`;

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

async function getForwardedHeaders(): Promise<Record<string, string>> {
  try {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for") ?? h.get("x-real-ip");
    if (forwardedFor) {
      return { "X-Forwarded-For": forwardedFor };
    }
  } catch {
    // Outside a Next.js server request context
  }
  return {};
}

async function post<T>(path: string, body: unknown, forwardedFor?: string): Promise<T> {
  const forwarded = forwardedFor
    ? { "X-Forwarded-For": forwardedFor }
    : await getForwardedHeaders();
  const res = await fetch(`${AUTH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...forwarded },
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
    // Posts `identifier`, not `username`: MultiIdentifierTokenObtainPairSerializer
    // routes the value to the email, phone or username column by its shape.
    const tokens = await post<AuthTokens>("/token/", input);
    const user = await httpDriver.me(tokens.access);
    return { ...tokens, user };
  },

  register(input: RegisterInput): Promise<Session> {
    // Unlike `login`, this needs no follow-up /me/ call: the registration view
    // returns the token pair and the serialized user together.
    return post<Session>("/register/", input);
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

  refresh(refreshToken: string, forwardedFor?: string): Promise<RefreshResult> {
    // The response carries a *new* refresh token as well as the access token:
    // ROTATE_REFRESH_TOKENS is on, and BLACKLIST_AFTER_ROTATION blacklists the
    // one we just spent. Whoever calls this has to store both.
    return post<RefreshResult>("/token/refresh/", { refresh: refreshToken }, forwardedFor);
  },

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    // Authenticated *and* carrying the token to revoke: the view checks that
    // the refresh token belongs to the caller before blacklisting it.
    const forwarded = await getForwardedHeaders();
    const res = await fetch(`${AUTH}/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...forwarded,
      },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return unwrapEmpty(res);
  },

  async me(accessToken: string): Promise<AuthUser> {
    const forwarded = await getForwardedHeaders();
    const res = await fetch(`${AUTH}/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...forwarded,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return unwrap<AuthUser>(res);
  },

  async updateProfile(accessToken: string, data: FormData | Partial<AuthUser>): Promise<AuthUser> {
    const forwarded = await getForwardedHeaders();
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      ...forwarded,
    };
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${AUTH}/me/`, {
      method: "PATCH",
      headers,
      body: isFormData ? data : JSON.stringify(data),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return unwrap<AuthUser>(res);
  },

  async createShop(accessToken: string, input: { name: string; city: string; phone: string; description?: string; telegram_chat_id?: string }) {
    const forwarded = await getForwardedHeaders();
    const res = await fetch(`${SERVER_API_URL}/api/v1/shops/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...forwarded,
      },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return unwrap(res);
  },
};
