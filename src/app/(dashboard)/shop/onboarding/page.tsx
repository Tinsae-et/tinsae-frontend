import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ShopOnboarding } from "@/components/shop/shop-onboarding";
import { hasShop } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/session";
import { getNavCategories } from "@/lib/nav-categories";

export const metadata: Metadata = { title: "List your shop — Tinsae" };

/**
 * Server guard in front of the funnel.
 *
 * The proxy only proves *a* session exists on /shop/:path*. It cannot tell an
 * owner who still needs a shop from one who already has one — that needs the
 * /me/ payload — so without this an owner could run the funnel a second time.
 *
 * There is no check for "is this account allowed a shop at all". The only field
 * that could answer it was `user.role`, which the backend does not send, so the
 * check rejected exactly the shopless accounts the funnel exists to serve. See
 * lib/auth/roles. Being signed in is the permission, which matches the backend:
 * perform_create sets owner=request.user.
 */
export default async function ShopOnboardingPage() {
  const { user } = await requireSession("/shop/onboarding");

  if (hasShop(user)) redirect("/shop/dashboard/overview");

  // Top-level categories only: a shop says what it sells broadly ("Electronics"),
  // its listings pick the subcategory.
  const categories = (await getNavCategories()).map((c) => c.label);

  return <ShopOnboarding userId={user.id} categories={categories} />;
}
