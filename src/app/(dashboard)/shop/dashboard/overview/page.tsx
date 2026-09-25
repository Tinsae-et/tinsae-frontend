import type { Metadata } from "next";

import Overview from "@/components/shop/dashboard/overview/overview";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "Overview — Tinsae" };

export default async function OverviewPage() {
  const { shop } = await requireMerchant();
  return (
    <section>
      <Overview slug={shop.slug} shopName={shop.name} />
    </section>
  );
}
