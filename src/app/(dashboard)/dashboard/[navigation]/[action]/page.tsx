import { notFound } from "next/navigation";

import { Form } from "@/components/shop/dashboard/new-listing/product-forms";
import { DashboardNoShop } from "@/components/shop/dashboard/overview/dashboard-empty-states";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "Add listing — Shop dashboard — Tinsae",
  robots: { index: false, follow: false },
};

export default async function DashboardListingAction({
  params,
}: {
  params: Promise<{ navigation: string; action: string }>;
}) {
  const { navigation, action } = await params;
  if (navigation !== "listings" || action !== "new") notFound();

  const shop = (await getCurrentUser())?.shops[0];
  if (!shop) return <DashboardNoShop />;

  return (
    <Form
      shopSlug={shop.slug}
      action="new"
      initialProduct={null}
      initialImages={[]}
    />
  );
}
