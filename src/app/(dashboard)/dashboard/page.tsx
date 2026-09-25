import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardNoShop } from "@/components/shop/dashboard/overview/dashboard-empty-states";
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
 * accounts without a shop to the empty state linking to onboarding,
 * and unauthenticated visitors to sign in with return intent.
 */
export default async function DashboardPage() {
  const { user } = await requireSession("/dashboard");

  if (!hasShop(user)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <DashboardNoShop />
      </main>
    );
  }

  redirect("/shop/dashboard/overview");
}
