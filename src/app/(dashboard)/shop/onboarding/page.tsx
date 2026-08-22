import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ShopOnboarding } from "@/components/shop/shop-onboarding";
import { authDriver } from "@/lib/auth/driver";
import { readSession } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

export const metadata: Metadata = { title: "List your shop — Tinsae" };

/**
 * Server guard in front of the funnel.
 *
 * The proxy only proves *a* session exists on /shop/:path*. It can't tell a
 * buyer from an owner, and it can't tell an owner who still needs a shop from
 * one who already has one — both of those need the /me/ payload. Without this
 * a signed-in buyer could walk the funnel and POST a shop (the backend would
 * accept it: perform_create sets owner=request.user), and an owner could run it
 * a second time.
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

  if (user.role !== "owner") redirect("/");
  if (user.shops?.length) redirect("/dashboard");

  return <ShopOnboarding userId={user.id} />;
}
