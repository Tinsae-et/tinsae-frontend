import React from "react";
import { notFound, redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { authDriver } from "@/lib/auth/driver";
import { hasShop } from "@/lib/auth/roles";
import { Form } from "@/components/shop/dashboard/new-listing/product-forms";
import { getProductImages, getShopProduct } from "@/lib/api";
import { ShopProduct, ShopProductImage } from "@/lib/types";
import { normalizeImageUrl } from "@/lib/format";

type Props = {
  params: Promise<{ action: string; navigation: string }>;
  searchParams: Promise<{ slug?: string }>;
};

export default async function ProductActionPage(props: Props) {
  const { action, navigation } = await props.params;

  if (navigation !== "listings" || (action !== "new" && action !== "edit")) {
    notFound();
  }

  const { access } = await readSession();
  if (!access) redirect(`/signin?next=/shop/dashboard/${navigation}/${action}`);

  let user;
  try {
    user = await authDriver.me(access);
  } catch {
    redirect(`/signin?next=/shop/dashboard/${navigation}/${action}`);
  }

  if (!hasShop(user)) redirect("/shop/onboarding");
  const shop = user.shops[0];

  let initialProduct: ShopProduct | null = null;
  let initialImages: ShopProductImage[] = [];

  if (action === "edit") {
    const searchParams = await props.searchParams;
    const slug = searchParams?.slug;
    if (!slug) notFound();

    try {
      initialProduct = await getShopProduct(slug, shop.slug, access);
      const imgRes = await getProductImages(slug, shop.slug, access).catch(() => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));
      type RawListingImage = {
        id?: number;
        image?: string | File;
        url?: string;
        is_primary?: boolean;
        display_order?: number;
      };
      const rawImages: RawListingImage[] = imgRes.results?.length
        ? (imgRes.results as RawListingImage[])
        : ((initialProduct.images || []) as RawListingImage[]);

      initialImages = rawImages.map((img) => {
        const rawSrc =
          (typeof img.image === "string" ? img.image : "") ||
          (typeof img.url === "string" ? img.url : "") ||
          "";
        const normalizedSrc = (typeof rawSrc === "string" ? normalizeImageUrl(rawSrc) : "") || rawSrc;
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
  }

  return (
    <section>
      <Form
        shopSlug={shop.slug}
        action={action}
        initialProduct={initialProduct}
        initialImages={initialImages}
      />
    </section>
  );
}