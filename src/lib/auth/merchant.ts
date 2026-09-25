import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { hasShop } from "./roles";
import { requireSession } from "./session";
import type { AuthShop, AuthUser } from "./types";

/**
 * The signed-in merchant and their shop, for any /shop/dashboard route.
 *
 * Cached per request, so the dashboard layout and the page beneath it share
 * one /me/ call. Both must call it: layouts and pages render in parallel, so a
 * page cannot rely on its layout having checked the session first.
 *
 * Sends a rejected session to /signin and a shopless account to onboarding.
 * The sign-in return path is the overview rather than the exact page — a
 * layout cannot see the URL — but the proxy already redirects the common case
 * (no session at all) with the precise `next`.
 */
export const requireMerchant = cache(
  async (): Promise<{ user: AuthUser; shop: AuthShop }> => {
    const { user } = await requireSession("/shop/dashboard/overview");
    if (!hasShop(user)) redirect("/shop/onboarding");
    return { user, shop: user.shops[0] };
  },
);
