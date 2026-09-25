import type { Metadata } from "next";

import ListingsTable from "@/components/shop/dashboard/listings/listing-table";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "Listings — Tinsae" };

export default async function ListingsPage() {
  const { shop } = await requireMerchant();
  return (
    <section>
      <ListingsTable slug={shop.slug} />
    </section>
  );
}
