"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/* ----------------------------- Types ----------------------------- */

export interface DropdownNotification {
  id: string;
  label: string; // e.g. "Price drop"
  title: string;
  timeAgo: string;
  unread: boolean;
  href?: string;
}

/** Spread these onto your own bell <button> */
export interface TriggerButtonProps {
  ref: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  "aria-haspopup": "true";
  "aria-expanded": boolean;
}

interface NotificationDropdownProps {
  /** Render your existing bell button. Spread `buttonProps` onto it. */
  renderTrigger: (ctx: {
    buttonProps: TriggerButtonProps;
    unreadCount: number;
    open: boolean;
  }) => ReactNode;
  notifications: DropdownNotification[];
  /** Max rows shown in the dropdown */
  limit?: number;
  /** Link to the full notifications page */
  allHref?: string;
  onMarkAllRead?: () => void;
}

/* --------------------------- Component --------------------------- */

export default function NotificationDropdown({
  renderTrigger,
  notifications,
  limit = 4,
  allHref = "/notification",
  onMarkAllRead,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const recent = notifications.slice(0, limit);

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

  const buttonProps: TriggerButtonProps = {
    ref: buttonRef,
    onClick: () => setOpen((v) => !v),
    "aria-haspopup": "true",
    "aria-expanded": open,
  };

  return (
    <div ref={rootRef} className="relative">
      {renderTrigger({ buttonProps, unreadCount, open })}

      {open && (
        <div
          role="region"
          aria-label="Recent notifications"
          className="border-tn-hair absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-lg"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-tn-ink text-sm font-semibold">Notifications</h2>
            {unreadCount > 0 && onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-tn-ink2 hover:text-tn-ink cursor-pointer text-xs font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="border-tn-hair text-tn-ink2 border-t px-4 py-8 text-center text-xs">
              No alerts yet. Save an item or a search to get notified.
            </p>
          ) : (
            <ul className="border-tn-hair border-t">
              {recent.map((n) => (
                <li key={n.id} className="border-tn-hair border-b last:border-b-0">
                  <Link
                    href={n.href ?? allHref}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-black/3 focus-visible:bg-black/3 focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                        n.unread ? "bg-tn-red" : "bg-transparent"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="text-tn-ink2 block font-mono text-[10px] tracking-wide">
                        {n.label} · {n.timeAgo}
                      </span>
                      <span
                        className={`mt-0.5 line-clamp-2 block text-xs leading-snug ${
                          n.unread ? "text-tn-ink font-semibold" : "text-tn-ink2"
                        }`}
                      >
                        {n.title}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={allHref}
            onClick={() => setOpen(false)}
            className="border-tn-hair text-tn-ink block border-t px-4 py-3 text-center text-xs font-medium transition-colors hover:bg-black/[0.03]"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
