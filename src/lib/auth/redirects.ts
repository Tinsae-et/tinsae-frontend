import type { AuthUser } from "./types";

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
 *
 * This deliberately takes the whole user rather than a role string. An earlier
 * version accepted either, and every call site passed `user.role` — which
 * silently took the role-only branch and sent owners who already had a shop
 * back into the funnel. Requiring the object makes that a type error.
 */
export function homeFor(user: Pick<AuthUser, "role" | "shops">): string {
  if (user.role !== "owner") return "/";
  return user.shops?.length ? "/dashboard" : "/shop/onboarding";
}
