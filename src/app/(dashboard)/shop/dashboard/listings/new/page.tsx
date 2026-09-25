import type { Metadata } from "next";

import { Form } from "@/components/shop/dashboard/new-listing/product-forms";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "New listing — Tinsae" };

export default async function NewListingPage() {
  const { shop } = await requireMerchant();
  return (
    <section>
      <Form shopSlug={shop.slug} action="new" initialProduct={null} initialImages={[]} />
    </section>
  );
}
