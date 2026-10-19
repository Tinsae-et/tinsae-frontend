"use client";

import { useSyncExternalStore } from "react";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import type { NotificationEvent } from "@/lib/notifications";

// One feed shared by every bell, dropdown, and the /notifications page, so
// marking an item read in one place clears it everywhere. The store polls while
// anything is subscribed and the tab is visible, and stops when the last
// subscriber unmounts. A failed poll (including a 429 from the 120/min
// per-user throttle) keeps the last good state and tries again next tick.

export const POLL_INTERVAL_MS = 60_000;

type NotificationsState = {
  items: NotificationEvent[];
  /** From the server: the list is one page, so counting `items` would undercount. */
  unread: number;
  /** "loading" only until the first response; polls refresh silently. */
  status: "loading" | "ready" | "error";
};

const INITIAL: NotificationsState = { items: [], unread: 0, status: "loading" };

let state = INITIAL;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function setState(next: NotificationsState) {
  state = next;
  listeners.forEach((listener) => listener());
}

async function refresh() {
  try {
    const [items, unread] = await Promise.all([listNotifications(), getUnreadCount()]);
    setState({ items, unread, status: "ready" });
  } catch {
    // Keep showing what we have; only a feed that never loaded is an error.
    setState({ ...state, status: state.status === "loading" ? "error" : state.status });
  }
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") void refresh();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refresh();
    timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}

/** Optimistic: the dot and badge clear at once, and a failed write resyncs from the server. */
async function markRead(id: string) {
  if (!state.items.some((e) => e.id === id && e.unread)) return;
  setState({
    ...state,
    items: state.items.map((e) => (e.id === id ? { ...e, unread: false } : e)),
    unread: Math.max(0, state.unread - 1),
  });
  try {
    await markNotificationRead(id);
  } catch {
    void refresh();
  }
}

async function markAllRead() {
  setState({ ...state, items: state.items.map((e) => ({ ...e, unread: false })), unread: 0 });
  try {
    await markAllNotificationsRead();
  } catch {
    void refresh();
  }
}

export function useNotifications() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  return {
    items: snapshot.items,
    status: snapshot.status,
    unreadCount: snapshot.unread,
    markRead,
    markAllRead,
    retry: refresh,
  };
}
