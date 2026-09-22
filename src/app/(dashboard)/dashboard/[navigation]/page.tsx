import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ListingsTable from "@/components/shop/dashboard/listings/listing-table";
import Overview from "@/components/shop/dashboard/overview/overview";
import { DashboardNoShop } from "@/components/shop/dashboard/overview/dashboard-empty-states";
import ShopProfile from "@/components/shop/dashboard/shop-profile/shop-profile";
import TelegramSetup from "@/components/shop/dashboard/telegram/telegram-setup";
import { getCurrentUser, readSession } from "@/lib/auth/session";
import { getShop } from "@/lib/api";

export const metadata: Metadata = {
  title: "Shop dashboard — Tinsae",
  robots: { index: false, follow: false },
};

export default async function DashboardSection({
  params,
  searchParams,
}: {
  params: Promise<{ navigation: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { navigation } = await params;
  const user = await getCurrentUser();
  const shop = user?.shops[0];
  if (!shop) return <DashboardNoShop />;

  if (navigation === "overview") {
    return <Overview slug={shop.slug} shopName={shop.name} basePath="/dashboard" />;
  }
  if (navigation === "listings") {
    const { tab } = await searchParams;
    return (
      <ListingsTable
        slug={shop.slug}
        initialTab={tab === "needs-attention" ? "needs-attention" : "all"}
      />
    );
  }
  if (navigation === "shop-settings") {
    const { access } = await readSession();
    const fullShop = await getShop(shop.slug).catch(() => null);
    if (!access) return <DashboardNoShop />;
    return <ShopProfile initialShop={fullShop} slug={shop.slug} access={access} />;
  }
  if (navigation === "telegram") {
    return <TelegramSetup shop={shop} />;
  }

  notFound();
}