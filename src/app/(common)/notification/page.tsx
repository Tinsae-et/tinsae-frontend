"use client";

import { Icon } from "@/components/tinsae/icon";
import { useMemo, useState, type ReactNode } from "react";
import { NotificationCard, NotificationItem } from "@/components/notification/NotificationCard";
import Link from "next/link";

/* ----------------------------- Types ----------------------------- */


type Group = "Today" | "Yesterday" | "Earlier";
type TabId = "all" | "unread" | "price" | "stock" | "searches" | "replies";


interface Setting {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

/* ----------------------------- Data ------------------------------ */

const INITIAL_ITEMS: NotificationItem[] = [
  {
    id: "n1",
    kind: "price-drop",
    group: "Today",
    timeAgo: "2h ago",
    title: "iPhone 15 Pro dropped ETB 4,000",
    body: "Almeda Electronics now lists it at ETB 142,500 — the lowest across 5 shops.",
    unread: true,
    cta: "Contact shop",
    price: "ETB 142,500",
    oldPrice: "ETB 146,500",
    thumb: "phone",
  },
  {
    id: "n2",
    kind: "shop-replied",
    group: "Today",
    timeAgo: "4h ago",
    title: "Henok from Bole Tech replied",
    body: "“Yes, the Galaxy S24 Ultra is in stock — sealed, 256GB. You can come by today.”",
    unread: true,
    cta: "Open chat",
    thumb: "phone",
  },
  {
    id: "n3",
    kind: "saved-search",
    group: "Today",
    timeAgo: "6h ago",
    title: "3 new matches for “Sealed iPhone · under ETB 50,000”",
    body: "Your saved search picked up 3 listings confirmed in Bole within the last day.",
    unread: true,
    cta: "View matches",
    chips: ["iPhone SE", "iPhone 13 mini", "iPhone 12"],
  },
  {
    id: "n4",
    kind: "back-in-stock",
    group: "Yesterday",
    timeAgo: "1d ago",
    title: "iPad Air 13” is back in stock",
    body: "Saba Gadgets restocked the M2 · 256GB. 3 shops carry it again.",
    unread: false,
    cta: "Contact shop",
    price: "ETB 88,900",
    thumb: "tablet",
  },
  {
    id: "n5",
    kind: "selling-fast",
    group: "Yesterday",
    timeAgo: "1d ago",
    title: "AirPods Pro 2 are selling fast",
    body: "Only 2 of 9 shops still confirm stock today. Reach out before it turns over.",
    unread: false,
    cta: "View listing",
    price: "ETB 18,500",
    thumb: "logo",
  },
  {
    id: "n6",
    kind: "shop-verified",
    group: "Earlier",
    timeAgo: "3d ago",
    title: "Saba Gadgets is now a verified shop",
    body: "A shop you saved from completed verification — look for the badge on their listings.",
    unread: false,
    cta: "View shop",
  },
  {
    id: "n7",
    kind: "price-drop",
    group: "Earlier",
    timeAgo: "4d ago",
    title: "Sony WH-1000XM5 dropped ETB 1,500",
    body: "Now ETB 24,500 at 6 shops. Matches one of your saved searches.",
    unread: false,
    cta: "Contact shop",
    price: "ETB 24,500",
    oldPrice: "ETB 26,000",
    thumb: "logo",
  },
];

const INITIAL_SETTINGS: Setting[] = [
  { id: "price", label: "Price drops", description: "On items you’ve saved", enabled: true },
  { id: "stock", label: "Back in stock", description: "Sold-out saved items", enabled: true },
  { id: "search", label: "Saved-search matches", description: "New listings that fit", enabled: true },
  { id: "replies", label: "Shop replies", description: "When a seller messages back", enabled: true },
  { id: "tips", label: "Tinsae tips & updates", description: "Occasional product news", enabled: false },
];

const GROUPS: Group[] = ["Today", "Yesterday", "Earlier"];


const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "price", label: "Price drops" },
  { id: "stock", label: "Stock" },
  { id: "searches", label: "Saved searches" },
  { id: "replies", label: "Replies" },
];

function matchesTab(item: NotificationItem, tab: TabId): boolean {
  switch (tab) {
    case "all":
      return true;
    case "unread":
      return item.unread;
    case "price":
      return item.kind === "price-drop";
    case "stock":
      return item.kind === "back-in-stock" || item.kind === "selling-fast";
    case "searches":
      return item.kind === "saved-search";
    case "replies":
      return item.kind === "shop-replied";
  }
}

/* --------------------------- Component --------------------------- */

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_ITEMS);
  const [settings, setSettings] = useState<Setting[]>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const unreadCount = items.filter((i) => i.unread).length;

  const counts = useMemo(() => {
    const unread = (tab: TabId) =>
      items.filter((i) => i.unread && matchesTab(i, tab)).length;
    return {
      all: items.filter((i) => i.unread).length,
      unread: items.filter((i) => i.unread).length,
      price: unread("price"),
      stock: unread("stock"),
      searches: unread("searches"),
      replies: unread("replies"),
    } satisfies Record<TabId, number>;
  }, [items]);

  // Tab badges in the design show totals for category tabs, unread for "All"/"Unread".
  const badge = (tab: TabId): number => {
    if (tab === "all") return items.length;
    if (tab === "unread") return counts.unread;
    return items.filter((i) => matchesTab(i, tab)).length;
  };

  const visible = items.filter((i) => matchesTab(i, activeTab));

  const markAllRead = () =>
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));

  const markRead = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: false } : i)));

  const toggleSetting = (id: string) =>
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-white px-6 pb-16 pt-5 text-neutral-900">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[11px] text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">Home</Link>
        <span aria-hidden>›</span>
        <a href="/profile" className="hover:text-neutral-900">Hanna</a>
        <span aria-hidden>›</span>
        <span className="font-medium text-neutral-900">Notifications</span>
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-6xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-xs text-neutral-500">
            <span className="font-semibold text-red-600">{unreadCount}</span> unread · alerts from
            your saved items &amp; searches
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2 text-xs font-medium shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="check" />
          Mark all read
        </button>
      </header>

      {/* Tabs */}
      <div className="mt-5 flex items-center justify-between border-b border-neutral-200">
        <div role="tablist" aria-label="Notification filters" className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 whitespace-nowrap font-bold pb-3 pt-2 text-sm text-gray-300 transition ${
                  active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                    active ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {badge(tab.id)}
                </span>
                
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="More filters"
          className="pb-3 text-neutral-400 hover:text-neutral-700"
        >
          <ChevronsIcon />
        </button>
      </div>

      {/* Body */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Feed */}
        <section aria-label="Notification feed" className="space-y-6">
          {visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-500">
              Nothing here yet. New alerts for this filter will show up here.
            </div>
          )}

          {GROUPS.map((group) => {
            const groupItems = visible.filter((i) => i.group === group);
            if (groupItems.length === 0) return null;
            return (
              <div key={group}>
                <h2 className="mb-2 font-mono text-[12px] font-bold  uppercase tracking-[0.18em] text-gray-400">
                  {group}
                </h2>
                <ul className="space-y-3">
                  {groupItems.map((item) => (
                    <NotificationCard key={item.id} item={item} onOpen={() => markRead(item.id)} />
                  ))}
                </ul>
                
              </div>
            );
          })}
        </section>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-bold">How you get alerts</h2>
            <ul className="divide-y divide-neutral-100">
              <li className="flex items-center gap-3 pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-500">
                  <Icon name="tg"/>
                </span>
                <div>
                  <p className="text-sm font-medium">Telegram</p>
                  <p className="text-[10px] text-emerald-600">✓ Connected · @hanna</p>
                </div>
              </li>
              <li className="flex items-center gap-3 pt-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-500">
                  <Icon name="bell"/>
                </span>
                <div>
                  <p className="text-xs font-medium">SMS</p>
                  <p className="text-[10px] text-neutral-500">+251 ··· 4471</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold">Notify me about</h2>
            <ul className="space-y-3.5">
              {settings.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium">{s.label}</p>
                    {s.description && (
                      <p className="text-[10px] text-neutral-500">{s.description}</p>
                    )}
                  </div>
                  <Toggle
                    checked={s.enabled}
                    label={s.label}
                    onChange={() => toggleSetting(s.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}



function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
        checked ? "bg-emerald-700" : "bg-neutral-200"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ----------------------------- Icons ----------------------------- */

interface IconProps {
  className?: string;
}

function Svg({ className = "h-4 w-4", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}


function ChevronsIcon(p: IconProps) {
  return (
    <Svg className="h-4 w-4" {...p}>
      <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />
      
    </Svg>
  );
}
