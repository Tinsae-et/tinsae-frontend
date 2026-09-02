import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { authDriver } from "@/lib/auth/driver";
import { hasShop } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

export const metadata: Metadata = { title: "Dashboard — Tinsae" };

/**
 * Universal dispatcher for /dashboard.
 *
 * Directs authenticated shop owners to their rich dashboard overview,
 * accounts without a shop to the onboarding funnel, and unauthenticated
 * visitors to sign in with return intent.
 */
export default async function DashboardPage() {
  const { access } = await readSession();
  if (!access) redirect("/signin?next=/shop/dashboard/overview");

  let user: AuthUser;
  try {
    user = await authDriver.me(access);
  } catch {
    redirect("/signin?next=/shop/dashboard/overview");
  }

  if (!hasShop(user)) {
    redirect("/shop/onboarding");
  }

  redirect("/shop/dashboard/overview");
}
