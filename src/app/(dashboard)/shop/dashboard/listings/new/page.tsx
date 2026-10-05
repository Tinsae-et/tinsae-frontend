import type { Metadata } from "next";

import { Form } from "@/components/shop/dashboard/new-listing/product-forms";
import { requireMerchant } from "@/lib/auth/merchant";
import { getShop } from "@/lib/api/public";

export const metadata: Metadata = { title: "New listing — Tinsae" };

export default async function NewListingPage() {
  const { shop } = await requireMerchant();
  const fullShop = await getShop(shop.slug, { cache: "no-store" }).catch(
    () => null,
  );
  return (
    <section>
      <Form
        shopSlug={shop.slug}
        action="new"
        initialProduct={null}
        initialImages={[]}
        allowedCategorySlugs={fullShop?.categories ?? []}
      />
    </section>
  );
}
