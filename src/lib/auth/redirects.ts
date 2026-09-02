import { hasShop } from "./roles";
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
 * Fork on state, not on a role the backend does not send: a shop of their own
 * means the dashboard, and no shop yet means the onboarding funnel. See ./roles
 * for why there is no third branch — nothing distinguishes a merchant without a
 * shop from any other account, and today every account is a merchant.
 *
 * This deliberately takes the whole user rather than a role string. An earlier
 * version accepted either, and every call site passed `user.role` — which
 * silently took the role-only branch and sent owners who already had a shop
 * back into the funnel. Requiring the object makes that a type error.
 */
export function homeFor(user: Pick<AuthUser, "shops">): string {
  return hasShop(user) ? "/shop/dashboard/overview" : "/";
}
