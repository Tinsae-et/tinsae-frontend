// Demo feed for the notifications UI until TIN-115 serves the real one.
// Copy matches the design handoff; timestamps are relative to page load so the
// Today / Yesterday / This week buckets always have something in them.

import type { NotificationEvent } from "../notifications";

const ago = (hours: number) => new Date(Date.now() - hours * 36e5).toISOString();

export function demoNotifications(): NotificationEvent[] {
  return [
    {
      id: "n1",
      type: "drop",
      unread: true,
      createdAt: ago(2),
      title: "iPhone 15 Pro dropped ETB 4,000",
      body: "Almeda Electronics now lists it at ETB 142,500 — the lowest across 5 shops.",
      thumb: { kind: "phone" },
      price: 142500,
      wasPrice: 146500,
      cta: { label: "Contact shop", href: "/products" },
    },
    {
      id: "n2",
      type: "reply",
      unread: true,
      createdAt: ago(4),
      title: "Henok from Bole Tech replied",
      body: "“Yes, the Galaxy S24 Ultra is in stock — sealed, 256GB. You can come by today.”",
      thumb: { kind: "phone" },
      cta: { label: "Open chat", href: "/products" },
    },
    {
      id: "n3",
      type: "search",
      unread: true,
      createdAt: ago(6),
      title: "3 new matches for “Sealed iPhone · under ETB 50,000”",
      body: "Your saved search picked up 3 listings confirmed in Bole within the last day.",
      chips: ["iPhone SE", "iPhone 13 mini", "iPhone 12"],
      cta: { label: "View matches", href: "/products?q=iphone" },
    },
    {
      id: "n4",
      type: "back",
      unread: false,
      createdAt: ago(26),
      title: "iPad Air 13” is back in stock",
      body: "Saba Gadgets restocked the M2 · 256GB. 3 shops carry it again.",
      thumb: { kind: "tablet" },
      price: 88900,
      cta: { label: "Contact shop", href: "/products" },
    },
    {
      id: "n5",
      type: "sold",
      unread: false,
      createdAt: ago(28),
      title: "AirPods Pro 2 are selling fast",
      body: "Only 2 of 9 shops still confirm stock today. Reach out before it turns over.",
      thumb: { kind: "audio" },
      price: 18500,
      cta: { label: "View listing", href: "/products" },
    },
    {
      id: "n6",
      type: "verify",
      unread: false,
      createdAt: ago(72),
      title: "Saba Gadgets is now a verified shop",
      body: "A shop you saved from completed Tinsae verification — look for the badge on their listings.",
      cta: { label: "View shop", href: "/shops" },
    },
    {
      id: "n7",
      type: "drop",
      unread: false,
      createdAt: ago(24 * 9),
      title: "Sony WH-1000XM5 dropped ETB 1,500",
      body: "Now ETB 24,500 at 6 shops. Matches one of your saved searches.",
      thumb: { kind: "audio" },
      price: 24500,
      wasPrice: 26000,
      cta: { label: "Contact shop", href: "/products" },
    },
  ];
}
