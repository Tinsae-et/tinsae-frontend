import type { Metadata } from "next";

import ListingsTable from "@/components/shop/dashboard/listings/listing-table";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "Listings — Tinsae" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const [{ tab } = {}, { shop }] = await Promise.all([
    searchParams ?? Promise.resolve({} as { tab?: string }),
    requireMerchant(),
  ]);
  const initialTab = tab === "needs-attention" ? "needs-attention" : "all";
  return (
    <section>
      <ListingsTable slug={shop.slug} initialTab={initialTab} />
    </section>
  );
}
