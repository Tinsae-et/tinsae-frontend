"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { useNotifications } from "@/hooks/use-notifications";
import {
  NOTIFICATION_FILTERS,
  NOTIFICATION_GROUPS,
  filterCounts,
  groupFor,
  matchesFilter,
  type NotificationFilter,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { NotificationCard } from "./notification-card";

/** /notifications: hero with filter tabs, the grouped feed, and the alerts rail. */
export function NotificationsView({
  firstName,
  initialFilter,
  telegramHandle,
  maskedPhone,
}: {
  firstName: string;
  initialFilter: NotificationFilter;
  /** null when Telegram isn't connected; "" when connected without a public handle. */
  telegramHandle: string | null;
  maskedPhone: string | null;
}) {
  const { items, status, unreadCount, markRead, markAllRead, retry } = useNotifications();
  const [filter, setFilter] = useState(initialFilter);

  const counts = filterCounts(items);
  const visible = items.filter((e) => matchesFilter(e, filter));

  // The filter lives in the URL so it survives a refresh and can be shared,
  // without a navigation that would re-run the server page.
  const selectFilter = (next: NotificationFilter) => {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", next);
    window.history.replaceState(null, "", url);
  };

  return (
    <main className="bg-white">
      {/* Hero band */}
      <div className="border-tn-hair2 border-b bg-[radial-gradient(120%_100%_at_90%_-20%,var(--color-tn-red-soft)_0%,rgba(255,241,235,0)_50%),white]">
        <div className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-7 sm:pt-[26px]">
          <nav aria-label="Breadcrumb" className="text-tn-mute flex items-center gap-2 text-[13px]">
            <Link href="/" className="hover:text-tn-ink">
              Home
            </Link>
            <Icon name="chevron" size={11} />
            <Link href="/account/settings" className="hover:text-tn-ink">
              {firstName}
            </Link>
            <Icon name="chevron" size={11} />
            <span aria-current="page" className="text-tn-ink font-semibold">
              Notifications
            </span>
          </nav>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-tn-ink text-[34px] leading-none font-extrabold tracking-[-0.035em] sm:text-[46px]">
                Notifications
              </h1>
              <p className="text-tn-mute mt-2.5 text-[15px] font-medium">
                <b className="text-tn-red font-tn-mono font-semibold">
                  {status === "loading" ? "–" : unreadCount}
                </b>{" "}
                unread · alerts from your saved items &amp; searches
              </p>
            </div>
            <Pill
              kind="outline"
              size="md"
              icon="check"
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Pill>
          </div>

          <div
            role="tablist"
            aria-label="Filter notifications"
            className="-mx-4 mt-[22px] flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            {NOTIFICATION_FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectFilter(f.id)}
                  className={cn(
                    "-mb-px inline-flex cursor-pointer items-center gap-2 border-b-[2.5px] px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors",
                    active
                      ? "border-tn-red text-tn-ink"
                      : "text-tn-mute hover:text-tn-ink border-transparent",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "font-tn-mono inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold",
                      active ? "bg-tn-red-soft text-tn-red" : "bg-tn-paper text-tn-mute",
                    )}
                  >
                    {status === "loading" ? "·" : counts[f.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed + rail; the rail drops below the feed under lg */}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[26px] px-4 pt-[26px] pb-8 sm:px-7 lg:flex-row lg:items-start">
        <section aria-label="Notification feed" aria-busy={status === "loading"} className="min-w-0 flex-1">
          {status === "loading" ? (
            <FeedSkeleton />
          ) : status === "error" ? (
            <FeedMessage
              icon="bell"
              title="Couldn't load your notifications"
              body="Check your connection and try again."
              action={
                <Pill kind="dark" size="sm" onClick={() => void retry()}>
                  Try again
                </Pill>
              }
            />
          ) : items.length === 0 ? (
            <FeedMessage
              icon="bell"
              title="No alerts yet"
              body="Save an item or a search and we'll tell you here — and on Telegram — when the price drops or it comes back in stock."
              action={
                <Pill kind="dark" size="sm" href="/products" iconAfter="chevron">
                  Browse products
                </Pill>
              }
            />
          ) : visible.length === 0 ? (
            <FeedMessage
              icon="check"
              title="You're all caught up"
              body="Nothing here for this filter right now."
            />
          ) : (
            NOTIFICATION_GROUPS.map((group) => {
              const rows = visible.filter((e) => groupFor(e.createdAt) === group);
              if (rows.length === 0) return null;
              return (
                <div key={group} className="mb-[18px]">
                  <h2 className="text-tn-mute font-tn-mono px-1 pt-1 pb-2.5 text-[11px] font-bold tracking-[0.1em] uppercase">
                    {group}
                  </h2>
                  <ul className="flex flex-col gap-1.5">
                    {rows.map((event) => (
                      <NotificationCard key={event.id} event={event} onOpen={(id) => void markRead(id)} />
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </section>

        <AlertsRail telegramHandle={telegramHandle} maskedPhone={maskedPhone} />
      </div>
    </main>
  );
}

function FeedSkeleton() {
  return (
    <ul aria-label="Loading notifications" className="flex flex-col gap-1.5">
      {[1, 2, 3, 4].map((i) => (
        <li
          key={i}
          className="border-tn-hair flex animate-pulse gap-[15px] rounded-[15px] border bg-white px-5 py-[17px]"
        >
          <span className="bg-tn-paper size-[42px] shrink-0 rounded-xl" />
          <span className="flex-1 space-y-2.5">
            <span className="bg-tn-paper block h-2.5 w-28 rounded" />
            <span className="bg-tn-paper block h-4 w-3/5 rounded" />
            <span className="bg-tn-paper block h-3 w-4/5 rounded" />
            <span className="bg-tn-hair block h-10 w-32 rounded-full" />
          </span>
          <span className="bg-tn-paper hidden h-16 w-[54px] shrink-0 rounded-[11px] sm:block" />
        </li>
      ))}
    </ul>
  );
}

function FeedMessage({
  icon,
  title,
  body,
  action,
}: {
  icon: "bell" | "check";
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-tn-hair flex flex-col items-center rounded-[18px] border border-dashed px-5 py-14 text-center">
      <span className="bg-tn-paper text-tn-ink2 inline-flex size-12 items-center justify-center rounded-2xl">
        <Icon name={icon} size={22} />
      </span>
      <h2 className="text-tn-ink mt-4 text-lg font-extrabold tracking-[-0.02em]">{title}</h2>
      <p className="text-tn-mute mt-1.5 max-w-sm text-sm leading-normal">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// Delivery preferences. TODO(TIN-115): the toggles are local only until the
// API exposes alert preferences; persist optimistically once it does.
const PREFS = [
  { id: "priceDrop", label: "Price drops", sub: "On items you've saved", on: true },
  { id: "backInStock", label: "Back in stock", sub: "Sold-out saved items", on: true },
  { id: "searchMatch", label: "Saved-search matches", sub: "New listings that fit", on: true },
  { id: "shopReply", label: "Shop replies", sub: "When a seller messages back", on: true },
  { id: "productNews", label: "Tinsae tips & updates", sub: "Occasional product news", on: false },
] as const;

function AlertsRail({
  telegramHandle,
  maskedPhone,
}: {
  telegramHandle: string | null;
  maskedPhone: string | null;
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PREFS.map((p) => [p.id, p.on])),
  );

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-[90px] lg:w-[284px]">
      <div className="border-tn-hair rounded-[18px] border bg-white px-5 py-4">
        <h2 className="text-tn-ink text-sm font-extrabold">How you get alerts</h2>
        <ul className="divide-tn-hair2 mt-1 divide-y">
          <li className="flex items-center gap-3 py-3.5">
            <span className="text-tn-telegram inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#E7F4FB]">
              <Icon name="tg" size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-tn-ink text-[13px] font-bold">Telegram</p>
              {telegramHandle !== null ? (
                <p className="text-tn-green flex items-center gap-1 text-[11.5px] font-semibold">
                  <Icon name="check" size={12} />
                  Connected{telegramHandle && ` · @${telegramHandle}`}
                </p>
              ) : (
                <p className="text-tn-mute text-[11.5px]">Not connected</p>
              )}
            </div>
            {telegramHandle === null && <ConnectLink />}
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <span className="bg-tn-paper text-tn-ink2 border-tn-hair inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border">
              <Icon name="bell" size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-tn-ink text-[13px] font-bold">SMS</p>
              <p className="text-tn-mute font-tn-mono text-[11.5px]">{maskedPhone ?? "No number added"}</p>
            </div>
            {maskedPhone === null && <ConnectLink />}
          </li>
        </ul>
      </div>

      <div className="border-tn-hair rounded-[18px] border bg-white px-5 py-4">
        <h2 className="text-tn-ink text-sm font-extrabold">Notify me about</h2>
        <ul className="mt-3 flex flex-col gap-4">
          {PREFS.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-tn-ink text-[13px] font-bold">{p.label}</p>
                <p className="text-tn-mute text-[11.5px]">{p.sub}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[p.id]}
                aria-label={p.label}
                onClick={() => setPrefs((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                className={cn(
                  "focus-visible:outline-tn-green relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  prefs[p.id] ? "bg-tn-green" : "bg-tn-hair",
                )}
              >
                <span
                  className={cn(
                    "absolute top-[3px] left-[3px] size-4 rounded-full bg-white shadow transition-transform",
                    prefs[p.id] && "translate-x-4",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function ConnectLink() {
  return (
    <Link
      href="/account/settings"
      className="border-tn-hair text-tn-ink hover:border-tn-ink rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
    >
      Connect
    </Link>
  );
}
