"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { extractBrand } from "@/lib/compare-helpers";
import { resolvePrimaryProductImage } from "@/lib/product-images";
import type { Product } from "@/lib/types";
import { formatSpecs } from "@/lib/specs/display";
import type { CategorySchema } from "@/lib/specs/schema";

export function CompareProductHeader({
  product,
  schema,
  onRemove,
}: {
  product: Product;
  schema: CategorySchema | null;
  onRemove: () => void;
}) {
  const brand = extractBrand(product);
  const image = resolvePrimaryProductImage(product.images?.[0]?.url);
  const specs = formatSpecs(schema, product.specs);
  const storage = specs.find((s) => s.key === "storage")?.value ?? "";
  const color = specs.find((s) => s.key === "color")?.value ?? "";
  const subtitle = [storage, color].filter(Boolean).join(" · ") || (product.category?.name ?? "Electronics");

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${product.title} from comparison`}
        className="bg-tn-paper hover:bg-tn-hair text-tn-mute hover:text-tn-ink absolute top-0 right-0 z-10 inline-flex size-7 items-center justify-center rounded-lg border border-tn-hair transition-colors"
      >
        <Icon name="close" size={13} />
      </button>

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.title}
        className="bg-tn-paper relative flex aspect-square w-full max-w-[140px] items-center justify-center overflow-hidden rounded-2xl p-3 transition-transform hover:scale-[1.02]"
      >
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="140px"
            className="object-contain p-2"
          />
        ) : (
          <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
        )}
      </Link>

      {/* Product Details */}
      <div className="mt-3.5 flex flex-col items-center">
        <p className="text-tn-mute text-[10.5px] font-extrabold tracking-[0.06em] uppercase">
          {brand}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="text-tn-ink hover:text-tn-red mt-1 line-clamp-2 min-h-[44px] text-[15.5px] font-extrabold leading-snug tracking-[-0.02em] transition-colors"
        >
          {product.title}
        </Link>
        <p className="text-tn-mute mt-0.5 text-xs font-semibold">
          {subtitle}
        </p>

        {/* View listing pill */}
        <Link
          href={`/products/${product.slug}`}
          className="bg-tn-ink hover:bg-black text-white mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold shadow-[0_4px_14px_rgba(11,11,11,0.15)] transition-all hover:-translate-y-px"
        >
          <span>View listing</span>
          <Icon name="chevron" size={12} />
        </Link>
      </div>
    </div>
  );
}
