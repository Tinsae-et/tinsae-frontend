"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { useNotifications } from "@/hooks/use-notifications";
import { timeAgo } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { TYPE_META } from "./notification-card";

const RECENT_LIMIT = 5;

/**
 * The bell for the site header and the shop dashboard: an unread badge that
 * refreshes with the shared feed (every 60s), and a short dropdown of recent
 * alerts with a link to /notifications. Render it only for signed-in users.
 */
export function NotificationBell({ className }: { className?: string }) {
  const { items, status, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const recent = items.slice(0, RECENT_LIMIT);
  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  // Close on outside click and Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="border-tn-hair text-tn-ink2 hover:text-tn-ink hover:border-tn-ink relative flex size-10 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors"
      >
        <Icon name="bell" size={18} />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="bg-tn-red font-tn-mono absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white px-1 text-[10px] leading-none font-bold text-white"
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Recent notifications"
          className="border-tn-hair absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-[0_18px_44px_rgba(11,11,11,0.12)]"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-tn-ink text-sm font-extrabold">Notifications</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-tn-ink2 hover:text-tn-ink cursor-pointer text-xs font-semibold transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {status === "loading" ? (
            <ul aria-busy="true" aria-label="Loading notifications" className="border-tn-hair border-t">
              {[1, 2, 3].map((i) => (
                <li key={i} className="border-tn-hair flex animate-pulse gap-3 border-b px-4 py-3 last:border-b-0">
                  <span className="bg-tn-paper size-8 shrink-0 rounded-lg" />
                  <span className="flex-1 space-y-1.5">
                    <span className="bg-tn-paper block h-2.5 w-24 rounded" />
                    <span className="bg-tn-paper block h-3 w-48 rounded" />
                  </span>
                </li>
              ))}
            </ul>
          ) : status === "error" ? (
            <p className="border-tn-hair text-tn-mute border-t px-4 py-8 text-center text-xs">
              Couldn&apos;t load notifications. We&apos;ll try again shortly.
            </p>
          ) : recent.length === 0 ? (
            <p className="border-tn-hair text-tn-mute border-t px-4 py-8 text-center text-xs">
              No alerts yet. Save an item or a search to get notified.
            </p>
          ) : (
            <ul className="border-tn-hair border-t">
              {recent.map((n) => {
                const meta = TYPE_META[n.type];
                return (
                  <li key={n.id} className="border-tn-hair border-b last:border-b-0">
                    <Link
                      href={n.cta.href}
                      onClick={() => {
                        void markRead(n.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "hover:bg-tn-paper focus-visible:bg-tn-paper relative flex gap-3 px-4 py-3 transition-colors focus-visible:outline-none",
                        !n.unread && "opacity-80",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                          meta.tile,
                          meta.accent,
                        )}
                      >
                        <Icon name={meta.icon} size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-tn-mute block text-[10px] tracking-wide">
                          <span className={cn("font-bold uppercase", meta.accent)}>{meta.label}</span>
                          <span className="font-tn-mono"> · {timeAgo(n.createdAt)}</span>
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 line-clamp-2 block text-xs leading-snug",
                            n.unread ? "text-tn-ink font-bold" : "text-tn-ink2",
                          )}
                        >
                          {n.title}
                        </span>
                      </span>
                      {n.unread && (
                        <span className="bg-tn-red mt-1.5 size-[7px] shrink-0 rounded-full">
                          <span className="sr-only">Unread</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="border-tn-hair text-tn-ink hover:bg-tn-paper block border-t px-4 py-3 text-center text-xs font-bold transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
