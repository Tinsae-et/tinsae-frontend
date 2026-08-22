import "@/app/globals.css";

import { fontVariables } from "@/lib/fonts";

/**
 * Root layout for the authenticated shop dashboard.
 *
 * Separate from the buyer site on purpose: no SiteHeader, no SiteFooter, and no
 * concept of browsing other shops (frontend guide §2.5). The real shell — nav,
 * "My Products", the confirm flow — belongs to the dashboard ticket.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="font-tn-sans text-tn-ink min-h-full bg-tn-paper">{children}</body>
    </html>
  );
}
