// The signed-in user's notifications, from the browser.
//
// Every function calls a same-origin /api/notifications route, which attaches
// the session server-side (lib/auth/django-proxy), the same as ./client. The
// signatures are the contract use-notifications relies on.
import { isNotificationType, type NotificationEvent } from "../notifications";
import type { Paginated } from "../types";
import { ApiError } from "./public";

/** One page is the whole feed for now: it's sparse and purged after 90 days. */
const PAGE_SIZE = 50;

/** An item as Django serialises it (TIN-115). */
export type ApiNotification = {
  id: number;
  kind: string;
  type: string;
  unread: boolean;
  created_at: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
};

/** Same-origin paths only: blocks javascript:, data:, //host and absolute URLs. */
function isSafeHref(href: unknown): href is string {
  return typeof href === "string" && href.startsWith("/") && !href.startsWith("//");
}

/**
 * Maps an API item to the UI's shape, or null when this build can't render it
 * safely: a type it doesn't know (the backend deploys separately, and the card
 * has no style for it) or a link that isn't a same-origin path.
 */
export function toEvent(n: ApiNotification): NotificationEvent | null {
  if (!isNotificationType(n.type) || !isSafeHref(n.cta?.href)) return null;
  return {
    id: String(n.id),
    type: n.type,
    unread: n.unread,
    createdAt: n.created_at,
    title: n.title,
    body: n.body,
    cta: { label: n.cta.label, href: n.cta.href },
  };
}

async function failure(res: Response, fallback: string): Promise<never> {
  let data: Record<string, unknown> | undefined;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {}
  const detail = typeof data?.detail === "string" ? data.detail : undefined;
  throw new ApiError(detail || `${fallback} (${res.status})`, res.status, data);
}

/** Newest first. */
export async function listNotifications(): Promise<NotificationEvent[]> {
  const res = await fetch(`/api/notifications?page_size=${PAGE_SIZE}`, { cache: "no-store" });
  if (!res.ok) return failure(res, "Couldn't load notifications");
  const page = (await res.json()) as Paginated<ApiNotification>;
  return page.results.map(toEvent).filter((e): e is NotificationEvent => e !== null);
}

export async function getUnreadCount(): Promise<number> {
  const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
  if (!res.ok) return failure(res, "Couldn't load unread count");
  const data = (await res.json()) as { unread_count: number };
  return data.unread_count;
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
  });
  if (!res.ok) return failure(res, "Couldn't mark notification read");
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch("/api/notifications/read-all", { method: "POST" });
  if (!res.ok) return failure(res, "Couldn't mark notifications read");
}
