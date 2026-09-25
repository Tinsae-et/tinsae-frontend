import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Form } from "@/components/shop/dashboard/new-listing/product-forms";
import { getProductImages, getShopProduct } from "@/lib/api/server";
import { requireMerchant } from "@/lib/auth/merchant";
import { normalizeImageUrl } from "@/lib/format";
import type { ShopProduct, ShopProductImage } from "@/lib/types";

export const metadata: Metadata = { title: "Edit listing — Tinsae" };

type RawListingImage = {
  id?: number;
  image?: string | File;
  url?: string;
  is_primary?: boolean;
  display_order?: number;
};

export default async function EditListingPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  if (!slug) notFound();

  const { shop } = await requireMerchant();

  let initialProduct: ShopProduct;
  let initialImages: ShopProductImage[];
  try {
    // Independent reads, so in parallel: one round trip instead of two.
    const [product, imgRes] = await Promise.all([
      getShopProduct(shop.slug, slug),
      getProductImages(shop.slug, slug).catch(() => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      })),
    ]);
    initialProduct = product;

    const rawImages: RawListingImage[] = imgRes.results?.length
      ? (imgRes.results as RawListingImage[])
      : ((product.images || []) as RawListingImage[]);

    initialImages = rawImages.map((img) => {
      const rawSrc =
        (typeof img.image === "string" ? img.image : "") ||
        (typeof img.url === "string" ? img.url : "") ||
        "";
      const normalizedSrc = normalizeImageUrl(rawSrc) || rawSrc;
      return {
        id: img.id,
        image: rawSrc,
        preview: normalizedSrc,
        url: typeof img.url === "string" ? normalizeImageUrl(img.url) || img.url : normalizedSrc,
        is_primary: Boolean(img.is_primary),
        display_order: img.display_order ?? 0,
      };
    });
  } catch {
    // Editing a product belonging to another shop 404s rather than rendering an empty form.
    notFound();
  }

  return (
    <section>
      <Form
        shopSlug={shop.slug}
        action="edit"
        initialProduct={initialProduct}
        initialImages={initialImages}
      />
    </section>
  );
}
