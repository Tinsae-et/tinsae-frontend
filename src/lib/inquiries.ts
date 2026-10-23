// Pure helpers for buyer ↔ shop conversations ("inquiries").
//
// Shared by the route handlers (input checks) and both inboxes — /messages and
// the dashboard's Inquiries page — so the two count, filter and label a
// conversation the same way. They used to each carry their own copy, and the
// copies had already drifted (one confirmed before resolving, one did not; one
// kept a failed reply in the box, one threw it away).

import type { Inquiry } from "./types";

export type InquiryRole = "buyer" | "shop";

/** The longest message the composer and the route handlers accept. */
export const MESSAGE_MAX_LENGTH = 500;

// ── Input checks (route handlers) ─────────────────────────────────────────────

/** Django's inquiry ids are integers; anything else never reaches it. */
export function isInquiryId(value: unknown): value is string {
  return typeof value === "string" && /^\d{1,12}$/.test(value);
}

/**
 * The query the list routes forward to Django: `page`, `page_size` and
 * `status`, each only in a shape Django expects. Everything else the browser
 * sent is dropped rather than passed through.
 */
export function inquiryListParams(incoming: URLSearchParams): URLSearchParams {
  const out = new URLSearchParams();
  for (const key of ["page", "page_size"]) {
    const value = incoming.get(key);
    if (value && /^\d{1,3}$/.test(value)) out.set(key, value);
  }
  const status = incoming.get("status");
  if (status === "open" || status === "closed") out.set("status", status);
  return out;
}

/** A shop or product reference from the browser: a positive id or a slug. */
export function isIdOrSlug(value: unknown): value is string | number {
  if (typeof value === "number") return Number.isSafeInteger(value) && value > 0;
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,120}$/.test(value);
}

/** The trimmed message, or null when it is not text, empty, or too long. */
export function cleanMessageBody(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const body = value.trim();
  return body && body.length <= MESSAGE_MAX_LENGTH ? body : null;
}

// ── Links built from data ─────────────────────────────────────────────────────

/**
 * The contact-intent redirect target, but only in a shape we expect: a `tel:`
 * number or an https link on t.me. Django builds it from what a merchant typed,
 * so anything else (javascript:, data:, another host) is dropped, not followed.
 */
export function safeContactTarget(target: unknown): string | null {
  if (typeof target !== "string") return null;
  if (/^tel:\+?\d[\d -]{4,19}$/.test(target)) return target;
  try {
    const url = new URL(target);
    return url.protocol === "https:" && url.hostname === "t.me" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** https://t.me/<name> for a well-formed Telegram username, else null. */
export function telegramProfileUrl(username: string | null | undefined): string | null {
  const name = username?.trim().replace(/^@/, "");
  return name && /^[A-Za-z0-9_]{5,32}$/.test(name) ? `https://t.me/${name}` : null;
}

// ── Conversation state ────────────────────────────────────────────────────────

/** Unread messages waiting for the viewer in this conversation. */
export function unreadFor(inquiry: Inquiry, role: InquiryRole): number {
  return (role === "shop" ? inquiry.shop_unread : inquiry.buyer_unread) || 0;
}

/** The shop owes a reply: an open thread where the buyer spoke last or is unread. */
export function needsReply(inquiry: Inquiry): boolean {
  return (
    inquiry.status === "open" &&
    (inquiry.shop_unread > 0 || inquiry.last_sender_role === "buyer")
  );
}

/**
 * Who the viewer is talking to. A shop sees the buyer's name, or "Customer" —
 * never their internal user id, which used to show as "Customer #123".
 */
export function counterpartName(inquiry: Inquiry, role: InquiryRole): string {
  if (role === "shop") return inquiry.buyer_name?.trim() || "Customer";
  return inquiry.shop?.name || "Shop";
}

/** Up to two initials for an avatar tile. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

/**
 * "Seen" under the viewer's own last message, once the other side has read
 * it. Only meaningful for a delivered message, so callers skip pending ones.
 */
export function isSeen(inquiry: Inquiry, role: InquiryRole): boolean {
  const last = inquiry.messages.at(-1);
  if (!last || last.sender_role !== role) return false;
  return (role === "buyer" ? inquiry.shop_unread : inquiry.buyer_unread) === 0;
}

/** Messages added optimistically carry a negative id until Django answers. */
export function isPendingMessage(message: { id: number }): boolean {
  return message.id < 0;
}

export type InquiryFilter = "all" | "unread" | "open" | "closed";

export const INQUIRY_FILTERS: InquiryFilter[] = ["all", "unread", "open", "closed"];

/** The shop's "unread" tab is everything it owes a reply, read or not. */
export function inquiryFilterLabel(filter: InquiryFilter, role: InquiryRole): string {
  switch (filter) {
    case "all":
      return "All";
    case "unread":
      return role === "shop" ? "Needs reply" : "Unread";
    case "open":
      return "Active";
    case "closed":
      return "Resolved";
  }
}

export function matchesInquiryFilter(
  inquiry: Inquiry,
  filter: InquiryFilter,
  role: InquiryRole,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return role === "shop" ? needsReply(inquiry) : unreadFor(inquiry, role) > 0;
    case "open":
      return inquiry.status === "open";
    case "closed":
      return inquiry.status === "closed";
  }
}

/** Case-insensitive match on the shop, buyer, listing or any message. */
export function matchesInquirySearch(inquiry: Inquiry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    inquiry.shop?.name,
    inquiry.buyer_name,
    inquiry.product?.title,
    ...inquiry.messages.map((m) => m.body),
  ].some((text) => text?.toLowerCase().includes(q));
}

// ── Safety ────────────────────────────────────────────────────────────────────

const ADVANCE_PAYMENT =
  /\b(deposit|advance payment|pay(?:ment)? in advance|pre-?pay(?:ment)?|pay(?:ment)? (?:first|upfront|up front|before)|upfront|send (?:the |me )?money|transfer (?:the )?(?:money )?first)\b/i;

/**
 * A message asking the buyer to pay before seeing the item — the commonest
 * scam the Trust & Safety page warns about. A hint for a gentle in-thread
 * notice, not a filter: it errs towards showing the notice.
 */
export function asksForAdvancePayment(text: string): boolean {
  return ADVANCE_PAYMENT.test(text);
}

// ── Composer ──────────────────────────────────────────────────────────────────

export const QUICK_REPLIES: Record<InquiryRole, string[]> = {
  buyer: [
    "Is it still available?",
    "When can I visit the shop?",
    "Where exactly is the shop?",
    "Is the price negotiable?",
  ],
  shop: [
    "Yes, it's in stock.",
    "You're welcome to visit today.",
    "We can deliver in Addis.",
    "The listed price is our best price.",
  ],
};

// ── Dates (viewer's local time) ───────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Calendar distance in days: 0 today, 1 yesterday, null for a bad date. */
function daysAgo(iso: string | undefined, now: number): number | null {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return null;
  return Math.round((startOfDay(now) - startOfDay(t)) / DAY_MS);
}

/** "3:40 PM" — under each message. */
export function messageTime(iso: string | undefined): string {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** "Today" / "Yesterday" / "Mon, Oct 20" — the separator between days. */
export function dayLabel(iso: string | undefined, now: number = Date.now()): string {
  const days = daysAgo(iso, now);
  if (days === null) return "";
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Date(Date.parse(iso!)).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** The inbox row's timestamp: a time today, "Yesterday", else a short date. */
export function threadTime(iso: string | undefined, now: number = Date.now()): string {
  const days = daysAgo(iso, now);
  if (days === null) return "";
  if (days <= 0) return messageTime(iso);
  if (days === 1) return "Yesterday";
  return new Date(Date.parse(iso!)).toLocaleDateString([], { month: "short", day: "numeric" });
}
