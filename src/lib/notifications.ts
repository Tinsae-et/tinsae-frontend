// Shape and pure helpers for the notifications feed (TIN-120).
//
// The type follows the design handoff's `NotificationEvent`
// (design_handoff_all/design_handoff_notifications/README.md). The API that
// serves it is TIN-115; until it lands, lib/api/notifications returns demo
// data in this same shape, so only that file changes when it ships.

import type { ProductKind } from "@/components/tinsae/prod-placeholder";

export type NotificationType = "drop" | "back" | "search" | "reply" | "sold" | "verify";

export type NotificationEvent = {
  id: string;
  type: NotificationType;
  unread: boolean;
  createdAt: string;
  title: string;
  body: string;
  /** A product photo when there is one, otherwise a device silhouette. */
  thumb?: { imageUrl?: string | null; kind?: ProductKind };
  price?: number;
  wasPrice?: number;
  chips?: string[];
  cta: { label: string; href: string };
};

export type NotificationFilter = "all" | "unread" | "price" | "stock" | "searches" | "replies";

export const NOTIFICATION_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "price", label: "Price drops" },
  { id: "stock", label: "Stock" },
  { id: "searches", label: "Saved searches" },
  { id: "replies", label: "Replies" },
];

export function isNotificationFilter(value: unknown): value is NotificationFilter {
  return NOTIFICATION_FILTERS.some((f) => f.id === value);
}

export function matchesFilter(event: NotificationEvent, filter: NotificationFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return event.unread;
    case "price":
      return event.type === "drop";
    // The handoff: "Stock" matches both back-in-stock and selling-fast.
    case "stock":
      return event.type === "back" || event.type === "sold";
    case "searches":
      return event.type === "search";
    case "replies":
      return event.type === "reply";
  }
}

export type NotificationGroup = "Today" | "Yesterday" | "This week" | "Earlier";

export const NOTIFICATION_GROUPS: NotificationGroup[] = ["Today", "Yesterday", "This week", "Earlier"];

/** Calendar buckets in the viewer's local time, not rolling 24-hour windows. */
export function groupFor(createdAt: string, now: number = Date.now()): NotificationGroup {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const day = 24 * 60 * 60 * 1000;
  const t = Date.parse(createdAt);
  if (t >= startOfToday.getTime()) return "Today";
  if (t >= startOfToday.getTime() - day) return "Yesterday";
  if (t >= startOfToday.getTime() - 6 * day) return "This week";
  return "Earlier";
}

/** "just now", "12m ago", "2h ago", "3d ago", "2w ago" — the feed's mono timestamp. */
export function timeAgo(createdAt: string, now: number = Date.now()): string {
  const minutes = Math.floor(Math.max(0, now - Date.parse(createdAt)) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/** Badge numbers for the filter tabs: totals per filter, unread for "Unread". */
export function filterCounts(events: NotificationEvent[]): Record<NotificationFilter, number> {
  const counts = {} as Record<NotificationFilter, number>;
  for (const { id } of NOTIFICATION_FILTERS) {
    counts[id] = events.filter((e) => matchesFilter(e, id)).length;
  }
  return counts;
}

export function unreadCount(events: NotificationEvent[]): number {
  return events.filter((e) => e.unread).length;
}
