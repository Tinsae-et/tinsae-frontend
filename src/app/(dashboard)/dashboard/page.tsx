import type { Metadata } from "next";

import Overview from "@/components/shop/dashboard/overview/overview";
import { DashboardNoShop } from "@/components/shop/dashboard/overview/dashboard-empty-states";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Overview — Shop dashboard — Tinsae",
  robots: { index: false, follow: false },
};

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const shop = user?.shops[0];
  if (!shop) return <DashboardNoShop />;
  return (
    <Overview slug={shop.slug} shopName={shop.name} basePath="/dashboard" />
  );
}
