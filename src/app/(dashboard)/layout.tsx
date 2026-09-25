import type { Metadata } from "next";
import "@/app/globals.css";

/**
 * Group layout for the authenticated shop dashboard (the root layout is app/layout.tsx).
 *
 * Separate from the buyer site on purpose: no SiteHeader, no SiteFooter, and no
 * concept of browsing other shops (frontend guide §2.5). The real shell — nav,
 * "My Products", the confirm flow — belongs to the dashboard ticket.
 */
/** Private (merchant dashboard): keep out of search results. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-tn-paper">{children}</div>;
}
