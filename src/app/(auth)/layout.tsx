import "@/app/globals.css";

/**
 * Root layout for the auth gateway.
 *
 * Sits at the group root, not under /login, so /register (and anything else
 * added here) inherits it — a layout one level deeper would leave its siblings
 * with no <html> at all. No header or footer: the design is deliberately a
 * dead end apart from "Back to browsing".
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-white">{children}</div>;
}
