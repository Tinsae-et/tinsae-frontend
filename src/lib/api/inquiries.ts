// Buyer ↔ shop conversations, from the browser.
//
// Every function calls a same-origin /api/inquiries route, which attaches the
// session server-side (lib/auth/django-proxy), the same as ./notifications.
// `role` picks the side of the conversation: "buyer" for the signed-in user's
// own inquiries, "shop" for the ones their shops received.
import type { InquiryRole } from "../inquiries";
import type { ContactChannel, ContactIntentResponse, Inquiry, Paginated } from "../types";
import { ApiError } from "./public";

function base(role: InquiryRole): string {
  return role === "shop" ? "/api/inquiries/shop" : "/api/inquiries/buyer";
}

/**
 * Shown for a 429. Django throttles inquiry creates and replies (20/min per
 * user); DRF's own text ("Request was throttled. Expected available in 42
 * seconds.") is accurate but reads like a server log.
 */
export const RATE_LIMITED_MESSAGE =
  "You're sending messages quickly. Wait a minute and try again.";

async function failure(res: Response, fallback: string): Promise<never> {
  let data: Record<string, unknown> | undefined;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {}
  if (res.status === 429) throw new ApiError(RATE_LIMITED_MESSAGE, 429, data);
  const detail = typeof data?.detail === "string" ? data.detail : undefined;
  throw new ApiError(detail || `${fallback} (${res.status})`, res.status, data);
}

/** Newest activity first. Django may answer with a page or a bare list. */
export async function listInquiries(role: InquiryRole): Promise<Inquiry[]> {
  const res = await fetch(base(role), { cache: "no-store" });
  if (!res.ok) return failure(res, "Couldn't load conversations");
  const data = (await res.json()) as Inquiry[] | Paginated<Inquiry>;
  return Array.isArray(data) ? data : (data.results ?? []);
}

/** One thread. Reading it clears the viewer's unread count server-side. */
export async function getInquiry(role: InquiryRole, id: number): Promise<Inquiry> {
  const res = await fetch(`${base(role)}/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return failure(res, "Couldn't load conversation");
  return (await res.json()) as Inquiry;
}

/** Answers with the whole updated thread. */
export async function replyToInquiry(role: InquiryRole, id: number, body: string): Promise<Inquiry> {
  const res = await fetch(`${base(role)}/${encodeURIComponent(id)}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) return failure(res, "Couldn't send message");
  return (await res.json()) as Inquiry;
}

export async function closeInquiry(role: InquiryRole, id: number): Promise<Inquiry> {
  const res = await fetch(`${base(role)}/${encodeURIComponent(id)}/close`, { method: "POST" });
  if (!res.ok) return failure(res, "Couldn't resolve conversation");
  return (await res.json()) as Inquiry;
}

export async function getUnreadInquiryCount(role: InquiryRole): Promise<number> {
  const res = await fetch(`${base(role)}/unreads`, { cache: "no-store" });
  if (!res.ok) return failure(res, "Couldn't load unread count");
  const data = (await res.json()) as { unread_count?: number };
  return data.unread_count ?? 0;
}

/** A buyer's first message to a shop; answers with the new conversation's id. */
export async function startInquiry(input: {
  shop: number | string;
  product?: number | string;
  body: string;
  honeypot?: string;
}): Promise<{ id?: number }> {
  const res = await fetch("/api/inquiries/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return failure(res, "Couldn't send message");
  return (await res.json()) as { id?: number };
}

/** Logs a phone or Telegram contact and answers with where to send the buyer. */
export async function recordContactIntent(input: {
  channel: ContactChannel;
  shop: number | string;
  product?: number | string;
  honeypot?: string;
}): Promise<ContactIntentResponse> {
  const res = await fetch("/api/inquiries/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return failure(res, "Couldn't reach the shop");
  return (await res.json()) as ContactIntentResponse;
}
