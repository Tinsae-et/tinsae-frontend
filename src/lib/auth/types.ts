// The auth contract.
//
// Shaped to the design handoff's Data section: Telegram-first, phone/OTP
// second, no password anywhere. Endpoints are POST /auth/otp/request,
// /auth/otp/verify and /auth/telegram.
//
// Field names are snake_case because that is what crosses the wire to Django.
// Renaming here would mean a translation layer to keep in sync on the day the
// real endpoints land.

/** Only meaningful on sign-up; it decides where the user lands afterwards. */
export type Role = "buyer" | "owner";

export type AuthMode = "signin" | "signup";

export type AuthTokens = {
  access: string;
  refresh: string;
};

/** Shop as it appears nested in the /me/ payload (shops/serializers.py). */
export type AuthShop = {
  id: string;
  name: string;
  slug: string;
  city: string;
  phone: string;
  is_verified: boolean;
};

export type AuthUser = {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  phone: string;
  phone_verified?: boolean;
  preferred_area?: string;
  telegram_username?: string;
  telegram_chat_id?: string;
  avatar?: string | null;
  date_joined?: string;
  /**
   * Optional, because the backend does not send it: `users.UserSerializer`
   * returns id/username/email/phone/shops and `User` has no role column.
   *
   * Use the helpers in ./roles rather than reading this directly — owning a
   * shop is the merchant test that works against the real API today. This
   * field is still meaningful under the mock driver, whose OTP/Telegram
   * sign-up can create an owner before they have a shop; a real role column
   * only becomes necessary if buyer accounts become a real product.
   */
  role?: Role;
  shops: AuthShop[];
};

/**
 * POST /api/v1/auth/token/ — the password fallback for sign-in.
 *
 * Telegram is the primary path (every shop owner needs it for the freshness
 * bot anyway) and OTP verifies the number once at sign-up; this exists so an
 * owner whose Telegram is unavailable still has a way in that costs no SMS.
 */
export type LoginInput = {
  /**
   * Username, email or phone — the backend decides which by shape.
   *
   * Named `identifier` because that is the field simplejwt's serializer is
   * configured to read (`username_field = "identifier"`). It accepts a
   * `username` alias too, but only as a migration aid for this client, and its
   * own comment says the alias goes once the form posts the real name.
   */
  identifier: string;
  password: string;
};

/**
 * What `/auth/register/` accepts (users.ShopOwnerRegistrationSerializer).
 *
 * Registration creates the merchant *and* their first shop in one transaction,
 * which is why the shop fields live here rather than behind a second step: the
 * backend has no notion of an owner without a shop, and splitting it would mean
 * a half-made account if the second call failed.
 *
 * `email` is optional on purpose — a large share of merchants have none they
 * read, and requiring it yields `a@a.com` typed twice.
 */
export type RegisterInput = {
  username?: string;
  full_name?: string;
  password: string;
  phone: string;
  role?: Role;
  shop_name?: string;
  city?: string;
  email?: string;
};

export type OtpRequest = {
  /** E.164, e.g. +251912345678. */
  phone: string;
  mode: AuthMode;
};

export type OtpRequestResult = {
  /** Seconds until the code stops being accepted. */
  expires_in: number;
  /** Seconds until another code may be requested — drives the resend timer. */
  resend_in: number;
  /**
   * Mock driver only: the code that would have been sent by SMS, so the flow
   * is testable without an SMS provider. The real API must never return this.
   */
  dev_code?: string;
};

export type OtpVerify = {
  phone: string;
  code: string;
  mode: AuthMode;
  /** Sent on sign-up only. The server ignores it otherwise. */
  role?: Role;
  full_name?: string;
  shop_name?: string;
  city?: string;
};

export type Session = AuthTokens & { user: AuthUser };

/**
 * What a refresh hands back.
 *
 * `refresh` is present whenever the backend rotates — SIMPLE_JWT sets
 * ROTATE_REFRESH_TOKENS and BLACKLIST_AFTER_ROTATION, so the token we sent is
 * blacklisted the moment it is spent and this replacement is the only way to
 * refresh again. Dropping it silently ends the session at the next refresh.
 * Optional because the mock driver does not rotate.
 */
export type RefreshResult = {
  access: string;
  refresh?: string;
};

/** DRF's validation-error shape: { field: ["message", ...] }. */
export type FieldErrors = Record<string, string[]>;

/**
 * Any non-2xx from the auth API, normalised.
 *
 * `fieldErrors` is what inline validation renders; `detail` is the non-field
 * message (bad code, throttling, unknown number).
 */
export class AuthApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;
  readonly detail?: string;
  /** Machine-readable reason, so the UI can branch without matching strings. */
  readonly code?: string;

  constructor(status: number, body: Record<string, unknown>) {
    const detail = typeof body.detail === "string" ? body.detail : undefined;
    const code = typeof body.code === "string" ? body.code : undefined;

    // DRF mixes shapes in one object: `detail`/`code` for non-field problems,
    // arrays keyed by field name for validation. Normalise stray single
    // strings into arrays so the form renders one way only.
    const fieldErrors: FieldErrors = {};
    for (const [key, value] of Object.entries(body)) {
      if (key === "detail" || key === "code") continue;
      if (Array.isArray(value)) fieldErrors[key] = value.map(String);
      else if (typeof value === "string") fieldErrors[key] = [value];
    }

    super(detail ?? "Request failed");
    this.name = "AuthApiError";
    this.status = status;
    this.detail = detail;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Reasons the UI branches on, rather than matching message strings. */
export const AuthErrorCode = {
  /** Signing in with a number that has no account. */
  NoAccount: "no_account",
  /** Wrong six digits. */
  BadCode: "bad_code",
  /** The code aged out; the user needs a new one. */
  ExpiredCode: "expired_code",
  /** Too many wrong attempts — this phone is locked out for a while. */
  LockedOut: "locked_out",
  /** The user closed the Telegram popup, or it failed. */
  TelegramCancelled: "telegram_cancelled",
  /** The account exists but has never set a password (OTP/Telegram sign-up). */
  NoPassword: "no_password",
} as const;

/** What both drivers implement. */
export type AuthDriver = {
  login(input: LoginInput): Promise<Session>;
  /**
   * Creates a merchant account and its first shop, and signs them in.
   *
   * Answers with tokens as well as the user: the backend puts them in the 201
   * precisely so the client does not have to replay the credentials it just
   * sent against /auth/token/.
   */
  register(input: RegisterInput): Promise<Session>;
  requestOtp(input: OtpRequest): Promise<OtpRequestResult>;
  verifyOtp(input: OtpVerify): Promise<Session>;
  /**
   * Exchanges a Telegram Login Widget payload for a session.
   *
   * The mock fabricates the payload; the real widget hands back a signed
   * object the backend must verify against the bot token.
   */
  telegram(payload: Record<string, string>, mode: AuthMode, role?: Role): Promise<Session>;
  refresh(refreshToken: string): Promise<RefreshResult>;
  /**
   * Blacklists one refresh token — the session this client is holding.
   *
   * The access token is unaffected and stays valid until it expires; that is
   * inherent to stateless JWTs, not an oversight on either side.
   */
  logout(accessToken: string, refreshToken: string): Promise<void>;
  me(accessToken: string): Promise<AuthUser>;
  updateProfile(accessToken: string, data: FormData | Partial<AuthUser>): Promise<AuthUser>;
  createShop(
    accessToken: string,
    shop: { name: string; city: string; phone: string; description?: string; telegram_chat_id?: string },
  ): Promise<AuthShop>;
};
