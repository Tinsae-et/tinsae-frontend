import type { Metadata } from "next";
import { requireMerchant } from "@/lib/auth/merchant";
import { isInquiryId } from "@/lib/inquiries";
import ShopInquiriesClient from "@/components/shop/dashboard/inquiries/shop-inquiries-client";

export const metadata: Metadata = { title: "Inquiries & Leads — Tinsae" };

export default async function ShopInquiriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  // requireMerchant is the session check; the list itself loads client-side
  // and Django decides which inquiries this owner may see (across all shops).
  const [{ id } = {}] = await Promise.all([
    searchParams ?? Promise.resolve({} as { id?: string }),
    requireMerchant(),
  ]);

  return (
    <section className="w-full">
      <ShopInquiriesClient initialSelectedId={isInquiryId(id) ? Number(id) : null} />
    </section>
  );
}
