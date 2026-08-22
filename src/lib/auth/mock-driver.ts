// In-memory stand-in for the phone/OTP auth API.
//
// It lies convincingly on purpose: real expiry windows, a real resend cooldown,
// a real attempt limit, and the same error shapes the UI branches on. If the
// mock always accepts the code, every failure state in the design goes
// untested and integration day finds out for us.
//
// The code that "was sent by SMS" comes back as `dev_code` so the flow is
// usable without an SMS provider. The real endpoint must never do that.
import { formatPhone } from "./phone";
import {
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
  readMockToken,
  signMockToken,
} from "./tokens";
import {
  AuthApiError,
  AuthErrorCode,
  type AuthDriver,
  type AuthUser,
  type OtpRequest,
  type OtpRequestResult,
  type OtpVerify,
  type Role,
  type Session,
} from "./types";

const CODE_TTL_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 28; // the design's "Resend in 0:28"
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15 * 60;

type MockUser = AuthUser;

type Pending = {
  code: string;
  expiresAt: number;
  resendAt: number;
  attempts: number;
  lockedUntil: number;
};

/**
 * Pinned to globalThis, not module scope.
 *
 * Route handlers and Server Components compile into separate module graphs, so
 * a plain Map gives each of them its own copy: you'd verify a code in the route
 * handler and the dashboard wouldn't find the user it just created. The real
 * driver keeps state in Postgres and never has this problem — this is the mock
 * paying for pretending.
 */
const store = globalThis as typeof globalThis & {
  __tinsaeMockUsers?: Map<string, MockUser>;
  __tinsaeMockPending?: Map<string, Pending>;
  __tinsaeMockPasswords?: Map<string, string>;
};

const users = (store.__tinsaeMockUsers ??= new Map<string, MockUser>());
const pending = (store.__tinsaeMockPending ??= new Map<string, Pending>());

/**
 * Passwords by username, kept apart from the user records.
 *
 * Only accounts that have set one appear here. Sign-up never collects a
 * password — it comes later, during shop onboarding — so an account created
 * through OTP or Telegram legitimately has none, and the fallback has to say so
 * rather than pretend the credentials were wrong.
 */
const passwords = (store.__tinsaeMockPasswords ??= new Map<string, string>());

/** One known account, so signing in works without registering first. */
function seed() {
  if (users.size > 0) return;
  const phone = "+251912345678";
  users.set(phone, {
    id: "8f14e45f-ceea-467a-9c3e-1b0d2f8a1c11",
    username: "bolephones",
    email: "sales@bolephones.et",
    phone,
    role: "owner",
    shops: [
      {
        id: "3c59dc04-8e88-4f56-9b12-7a1c4d5e6f70",
        name: "Bole Phones",
        slug: "bole-phones",
        city: "Addis Ababa",
        phone,
        is_verified: true,
      },
    ],
  });
  passwords.set("bolephones", "tinsae-demo-2026");
}

/** The API is far away and the user is on mobile data. Act like it. */
function latency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 240 + Math.random() * 220));
}

function sixDigits(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function tokensFor(userId: string) {
  return {
    access: signMockToken(userId, "access", ACCESS_TTL_SECONDS),
    refresh: signMockToken(userId, "refresh", REFRESH_TTL_SECONDS),
  };
}

function createUser(phone: string, role: Role): MockUser {
  const user: MockUser = {
    id: crypto.randomUUID(),
    // OTP sign-up collects nothing but a number, so there is no username to
    // store. The digits stand in until the shop onboarding funnel collects a
    // real identity.
    username: formatPhone(phone),
    email: "",
    phone,
    role,
    shops: [],
  };
  users.set(phone, user);
  return user;
}

export const mockDriver: AuthDriver = {
  async login({ username, password }): Promise<Session> {
    seed();
    await latency();

    const name = username.trim();
    const user = [...users.values()].find((candidate) => candidate.username === name);
    const stored = passwords.get(name);

    if (user && !stored) {
      throw new AuthApiError(400, {
        detail: "That account has no password yet — continue with Telegram.",
        code: AuthErrorCode.NoPassword,
      });
    }
    if (!user || stored !== password) {
      // simplejwt sends one generic message for unknown-user and wrong-password
      // alike, so the endpoint can't be used to enumerate accounts. Match it.
      throw new AuthApiError(401, {
        detail: "No active account found with the given credentials",
      });
    }

    return { ...tokensFor(user.id), user };
  },

  async requestOtp({ phone, mode }: OtpRequest): Promise<OtpRequestResult> {
    seed();
    await latency();

    const now = Date.now();
    const existing = pending.get(phone);

    if (existing && existing.lockedUntil > now) {
      throw new AuthApiError(429, {
        detail: "Too many attempts. Try again in a few minutes.",
        code: AuthErrorCode.LockedOut,
      });
    }
    if (existing && existing.resendAt > now) {
      const wait = Math.ceil((existing.resendAt - now) / 1000);
      throw new AuthApiError(429, {
        detail: `Wait ${wait} seconds before asking for another code.`,
      });
    }

    // Signing in with a number nobody has registered is a dead end, and the
    // honest place to say so is here — before an SMS is spent on it.
    if (mode === "signin" && !users.has(phone)) {
      throw new AuthApiError(404, {
        detail: "No account uses that number.",
        code: AuthErrorCode.NoAccount,
      });
    }

    const code = sixDigits();
    pending.set(phone, {
      code,
      expiresAt: now + CODE_TTL_SECONDS * 1000,
      resendAt: now + RESEND_COOLDOWN_SECONDS * 1000,
      attempts: 0,
      lockedUntil: 0,
    });

    console.info(`[mock auth] code for ${formatPhone(phone)} is ${code}`);

    return {
      expires_in: CODE_TTL_SECONDS,
      resend_in: RESEND_COOLDOWN_SECONDS,
      dev_code: code,
    };
  },

  async verifyOtp({ phone, code, mode, role }: OtpVerify): Promise<Session> {
    seed();
    await latency();

    const now = Date.now();
    const entry = pending.get(phone);

    if (!entry) {
      throw new AuthApiError(400, {
        detail: "Ask for a code first.",
        code: AuthErrorCode.ExpiredCode,
      });
    }
    if (entry.lockedUntil > now) {
      throw new AuthApiError(429, {
        detail: "Too many wrong codes. Try again in a few minutes.",
        code: AuthErrorCode.LockedOut,
      });
    }
    if (entry.expiresAt <= now) {
      pending.delete(phone);
      throw new AuthApiError(400, {
        detail: "That code has expired. Ask for a new one.",
        code: AuthErrorCode.ExpiredCode,
      });
    }

    if (entry.code !== code) {
      entry.attempts += 1;
      if (entry.attempts >= MAX_ATTEMPTS) {
        entry.lockedUntil = now + LOCKOUT_SECONDS * 1000;
        entry.attempts = 0;
        throw new AuthApiError(429, {
          detail: "Too many wrong codes. Try again in a few minutes.",
          code: AuthErrorCode.LockedOut,
        });
      }
      const left = MAX_ATTEMPTS - entry.attempts;
      throw new AuthApiError(400, {
        detail: `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.`,
        code: AuthErrorCode.BadCode,
      });
    }

    pending.delete(phone);

    // Sign-up on an existing number signs that account in rather than erroring
    // — the handoff asks for the collision to "recover gracefully".
    const user = users.get(phone) ?? createUser(phone, mode === "signup" ? (role ?? "buyer") : "buyer");

    return { ...tokensFor(user.id), user };
  },

  async telegram(payload, mode, role): Promise<Session> {
    seed();
    await latency();

    const telegramId = payload.id;
    if (!telegramId) {
      throw new AuthApiError(400, {
        detail: "Telegram sign-in was cancelled.",
        code: AuthErrorCode.TelegramCancelled,
      });
    }

    // Telegram accounts key on the Telegram id, not a phone. The mock parks
    // them under a synthetic key so both paths land in the same user table.
    const key = `tg:${telegramId}`;
    let user = users.get(key);
    if (!user) {
      if (mode === "signin") {
        throw new AuthApiError(404, {
          detail: "No Tinsae account is linked to that Telegram.",
          code: AuthErrorCode.NoAccount,
        });
      }
      user = createUser(key, role ?? "buyer");
      user.username = payload.username ?? `tg-${telegramId}`;
      user.phone = "";
    }

    return { ...tokensFor(user.id), user };
  },

  async refresh(refreshToken: string): Promise<{ access: string }> {
    await latency();
    const payload = readMockToken(refreshToken);
    const known = payload && [...users.values()].some((u) => u.id === payload.user_id);
    if (!payload || payload.token_type !== "refresh" || !known) {
      throw new AuthApiError(401, {
        detail: "Token is invalid or expired",
        code: "token_not_valid",
      });
    }
    // No rotation: simplejwt's ROTATE_REFRESH_TOKENS defaults to False, so the
    // refresh token the client holds stays valid for its full lifetime.
    return { access: signMockToken(payload.user_id, "access", ACCESS_TTL_SECONDS) };
  },

  async me(accessToken: string): Promise<AuthUser> {
    seed();
    const payload = readMockToken(accessToken);
    const user = payload
      ? [...users.values()].find((candidate) => candidate.id === payload.user_id)
      : undefined;
    if (!payload || payload.token_type !== "access" || !user) {
      throw new AuthApiError(401, {
        detail: "Given token not valid for any token type",
      });
    }
    return user;
  },

  async createShop(accessToken: string, input: { name: string; city: string; phone: string; description?: string; telegram_chat_id?: string }) {
    seed();
    await latency();
    const user = await mockDriver.me(accessToken);
    const shop = {
      id: crypto.randomUUID(),
      name: input.name,
      slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      city: input.city || "Bole, Addis Ababa",
      phone: input.phone || user.phone,
      is_verified: false,
    };
    user.shops = [...user.shops, shop];
    return shop;
  },
};
