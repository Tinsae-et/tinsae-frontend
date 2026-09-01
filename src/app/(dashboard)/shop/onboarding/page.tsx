import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ShopOnboarding } from "@/components/shop/shop-onboarding";
import { authDriver } from "@/lib/auth/driver";
import { hasShop } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

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
  const { access } = await readSession();
  if (!access) redirect("/signin?next=/shop/onboarding");

  // Only the fetch goes in the try: redirect() works by throwing, so catching
  // around it would swallow the redirect and send everyone to /signin.
  let user: AuthUser;
  try {
    user = await authDriver.me(access);
  } catch {
    redirect("/signin?next=/shop/onboarding");
  }

  if (hasShop(user)) redirect("/dashboard");

  return <ShopOnboarding userId={user.id} />;
}
