import type { Metadata } from "next";
import "@/app/globals.css";

/**
 * Group layout for the auth gateway (the root layout is app/layout.tsx).
 *
 * Sits at the group root, not under /login, so /register (and anything else
 * added here) inherits it — a layout one level deeper would leave its siblings
 * with no <html> at all. No header or footer: the design is deliberately a
 * dead end apart from "Back to browsing".
 */
/** Private (auth screens): keep out of search results. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-white">{children}</div>;
}
