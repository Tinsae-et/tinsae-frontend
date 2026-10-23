"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  closeInquiry,
  getInquiry,
  listInquiries,
  replyToInquiry,
} from "@/lib/api/inquiries";
import { ApiError } from "@/lib/api/public";
import { unreadFor, type InquiryRole } from "@/lib/inquiries";
import type { Inquiry, InquiryMessage } from "@/lib/types";

// One side of the signed-in user's conversations, for both inboxes (/messages
// and the dashboard's Inquiries page). Polls while the tab is visible, so a
// reply shows up without a reload, and keeps the open thread read: a message
// that arrives while it's on screen is marked read on the next tick. A failed
// poll keeps the last good list and tries again next time.
//
// `role` is fixed for the hook's lifetime; callers switching sides remount the
// inbox (key={role}) rather than reuse one list for both.

export const INQUIRY_POLL_MS = 30_000;

/** Fired after a thread is read, so unread badges elsewhere refetch at once. */
export const INQUIRIES_READ_EVENT = "tinsae:inquiries-read";

export type InquiriesStatus = "loading" | "ready" | "error" | "signed-out";

export type SendResult = { ok: true } | { ok: false; error?: string };

function withoutUnread(inquiry: Inquiry, role: InquiryRole): Inquiry {
  return role === "shop" ? { ...inquiry, shop_unread: 0 } : { ...inquiry, buyer_unread: 0 };
}

export function useInquiries(role: InquiryRole, selectedId: number | null) {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState<InquiriesStatus>("loading");

  // A poll landing mid-send would replace the list and drop the pending
  // bubble, so polls skip while a send is in flight.
  const sending = useRef(0);
  // Bumped by every local write (send, resolve). A list or thread fetched
  // before the bump is older than what's on screen, so it's dropped rather
  // than put back over a message that was just sent.
  const version = useRef(0);
  // A 401 means the session is gone; polling on would only collect more.
  const signedOut = useRef(false);
  const selected = useRef(selectedId);
  useEffect(() => {
    selected.current = selectedId;
  }, [selectedId]);

  const markRead = useCallback(
    async (id: number) => {
      const v = version.current;
      try {
        const thread = withoutUnread(await getInquiry(role, id), role);
        if (sending.current > 0 || v !== version.current) {
          // Stale copy of the thread: keep what's on screen, just clear the badge.
          setItems((prev) => prev.map((i) => (i.id === id ? withoutUnread(i, role) : i)));
        } else {
          // A thread opened from a link may be older than the list's first page.
          setItems((prev) =>
            prev.some((i) => i.id === thread.id)
              ? prev.map((i) => (i.id === thread.id ? thread : i))
              : [thread, ...prev],
          );
        }
        window.dispatchEvent(new Event(INQUIRIES_READ_EVENT));
      } catch {
        // The list still shows it; the next poll retries.
      }
    },
    [role],
  );

  const refresh = useCallback(async () => {
    if (sending.current > 0 || signedOut.current) return;
    const v = version.current;
    try {
      const list = await listInquiries(role);
      if (sending.current > 0 || v !== version.current) return;
      setItems(list);
      setStatus("ready");
      const open = list.find((i) => i.id === selected.current);
      if (open && unreadFor(open, role) > 0 && document.visibilityState === "visible") {
        void markRead(open.id);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signedOut.current = true;
        setStatus("signed-out");
      } else setStatus((s) => (s === "loading" ? "error" : s));
    }
  }, [role, markRead]);

  useEffect(() => {
    void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(onVisible, INQUIRY_POLL_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // Opening a thread reads it (and so clears its unread count) once.
  useEffect(() => {
    if (selectedId !== null) void markRead(selectedId);
  }, [selectedId, markRead]);

  /**
   * Shows the message at once, then swaps in the thread Django returns. On
   * failure the pending bubble is removed and `ok: false` tells the composer to
   * give the text back, so nothing the user typed is lost. `error` is set when
   * there's something more useful to say than "couldn't send" (a 429).
   */
  const send = useCallback(
    async (id: number, body: string): Promise<SendResult> => {
      const now = new Date().toISOString();
      const pending: InquiryMessage = {
        id: -Date.now(),
        inquiry: id,
        body,
        sent_via: "web",
        sender_role: role,
        created_at: now,
      };
      sending.current += 1;
      version.current += 1;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, last_message_at: now, last_sender_role: role, messages: [...i.messages, pending] }
            : i,
        ),
      );
      let result: SendResult = { ok: false };
      try {
        const updated = await replyToInquiry(role, id, body);
        version.current += 1;
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        result = { ok: true };
      } catch (error) {
        version.current += 1;
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, messages: i.messages.filter((m) => m.id !== pending.id) } : i,
          ),
        );
        if (error instanceof ApiError && error.status === 429) {
          result = { ok: false, error: error.message };
        }
      } finally {
        sending.current -= 1;
      }
      // The rollback can't restore the thread's timestamps; the server can.
      if (!result.ok) void refresh();
      return result;
    },
    [role, refresh],
  );

  const resolve = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const updated = await closeInquiry(role, id);
        version.current += 1;
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        return true;
      } catch {
        return false;
      }
    },
    [role],
  );

  return { items, status, send, resolve, retry: refresh };
}
