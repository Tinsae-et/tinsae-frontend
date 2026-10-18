// The signed-in user's notifications, from the browser.
//
// TODO(TIN-115): these are backed by an in-memory demo feed until the
// notifications API lands. When it does, point each function at a same-origin
// /api/notifications route (the pattern in ./client) and delete
// lib/demo/notifications. The signatures are the contract the UI relies on.
import type { NotificationEvent } from "../notifications";
import { demoNotifications } from "../demo/notifications";

let demoFeed: NotificationEvent[] | null = null;
const latency = () => new Promise((resolve) => setTimeout(resolve, 350));

function feed(): NotificationEvent[] {
  demoFeed ??= demoNotifications();
  return demoFeed;
}

/** Newest first. */
export async function listNotifications(): Promise<NotificationEvent[]> {
  await latency();
  return feed().map((e) => ({ ...e }));
}

export async function markNotificationRead(id: string): Promise<void> {
  await latency();
  demoFeed = feed().map((e) => (e.id === id ? { ...e, unread: false } : e));
}

export async function markAllNotificationsRead(): Promise<void> {
  await latency();
  demoFeed = feed().map((e) => ({ ...e, unread: false }));
}
