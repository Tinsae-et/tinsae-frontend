/**
 * Where to send someone after they sign in.
 *
 * `next` arrives from the query string, so it is attacker-controlled: anything
 * that isn't a plain in-app path is discarded rather than sanitised. `//evil`
 * and `/\evil` are both protocol-relative URLs in a browser, which is why the
 * second character is checked too.
 */
export function safeNext(next: string | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

/**
 * Where a session lands when no `next` was carried in.
 *
 * Fork on state, not just role: owners without a registered shop land in the
 * onboarding funnel (/shop/onboarding); owners with a shop land on the
 * dashboard (/dashboard); buyers land on the home page (/).
 */
export function homeFor(
  userOrRole: { role: "buyer" | "owner"; shops?: unknown[] } | "buyer" | "owner",
): string {
  if (typeof userOrRole === "string") {
    return userOrRole === "owner" ? "/shop/onboarding" : "/";
  }
  if (userOrRole.role === "owner") {
    return userOrRole.shops && userOrRole.shops.length > 0 ? "/dashboard" : "/shop/onboarding";
  }
  return "/";
}
