import type { Metadata } from "next";
import { requireMerchant } from "@/lib/auth/merchant";
import ShopInquiriesClient from "@/components/shop/dashboard/inquiries/shop-inquiries-client";

export const metadata: Metadata = { title: "Inquiries & Leads — Tinsae" };

export default async function ShopInquiriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const [{ id } = {}, { shop }] = await Promise.all([
    searchParams ?? Promise.resolve({} as { id?: string }),
    requireMerchant(),
  ]);

  return (
    <section className="w-full">
      <ShopInquiriesClient shop={shop} initialSelectedId={id} />
    </section>
  );
}
