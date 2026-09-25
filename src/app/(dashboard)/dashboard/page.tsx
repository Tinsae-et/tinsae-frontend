import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { hasShop } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Overview — Shop dashboard — Tinsae",
  robots: { index: false, follow: false },
};

/**
 * Universal dispatcher for /dashboard.
 *
 * Directs authenticated shop owners to their rich dashboard overview,
 * accounts without a shop to the onboarding funnel, and unauthenticated
 * visitors to sign in with return intent.
 */
export default async function DashboardPage() {
  const { user } = await requireSession("/shop/dashboard/overview");

  if (!hasShop(user)) {
    redirect("/shop/onboarding");
  }

  redirect("/shop/dashboard/overview");
}
