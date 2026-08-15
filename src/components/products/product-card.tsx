"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { formatETB, freshness, type FreshnessTone } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// Matches the design's search-result card (design_handoff_search): radius 18,
// "In stock" (check) / "Aging" status tag, heart save button, "From ETB" price,
// freshness dot footer. Adapted to the backend model: the eyebrow shows the
// category (the API folds brand into title) and the footer shows the shop name
// + verified badge instead of "● N shops" (one shop per product in the API).

const TONE_DOT: Record<FreshnessTone, string> = {
  fresh: "bg-tn-green",
  aging: "bg-tn-warn",
  stale: "bg-tn-stale",
  unknown: "bg-tn-stale",
};

function ProductCardInner({
  product,
  saved,
  onSave,
}: {
  product: Product;
  saved: boolean;
  onSave: () => void;
}) {
  const fresh = freshness(product.last_confirmed_at);
  const statusTone = product.confirmation_status ? (product.confirmation_status as FreshnessTone) : fresh.tone;
  const image = product.image || null;
  const inStock = statusTone === "fresh";

  return (
    <article className="border-tn-hair flex flex-col overflow-hidden rounded-[18px] border bg-white transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
      <div className="bg-tn-paper relative aspect-square">
        <Link href={`/products/${product.id}/?category=${product.category?.name}&title=${product?.title}`}>
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />
          ) : (
            <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
          )}
        </Link>

        <span
          className={cn(
            "absolute top-3 left-3 inline-flex h-[26px] items-center gap-1 rounded-full bg-white/95 px-2.5 text-[11.5px] font-semibold",
            inStock ? "text-[#157049]" : "text-[#8a5512]",
          )}
        >
          {inStock && <Icon name="check" size={12} />}
          {inStock ? "In stock" : "Aging"}
        </span>

        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Unsave" : "Save"}
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="bg-white/95 text-tn-ink2 absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-[10px] shadow-[0_2px_8px_rgba(11,11,11,0.06)] transition-colors"
        >
          <Icon name="heart" size={15} className={saved ? "text-tn-red" : ""} />
        </button>
      </div>

      <div className="px-[18px] pt-4 pb-[18px]">
        <p className="text-tn-mute truncate text-[10.5px] font-bold tracking-[0.06em] uppercase">
          {product.category?.name ?? "Electronics"}
        </p>
        <h3 className="text-tn-ink mt-1 truncate text-[15.5px] leading-tight font-extrabold tracking-[-0.02em]">
          {product.title}
        </h3>

        <p className="mt-3 flex items-baseline gap-1.5">
          <span className="text-tn-mute text-[10.5px] font-semibold tracking-[0.04em] uppercase">
            From
          </span>
          <span className="font-tn-mono text-tn-red text-base font-semibold tracking-[-0.02em]">
            {formatETB(product.price)}
          </span>
        </p>

        <div className="border-tn-hair2 text-tn-ink2 mt-3 flex items-center justify-between gap-2 border-t pt-3 text-[11.5px]">
          <span className="flex min-w-0 items-center gap-1.5">
            {product.shop_verified && <VerifiedBadge size={11} />}
            <span className="truncate">{product.shop_name}</span>
          </span>
          <span className="font-tn-mono text-tn-mute flex shrink-0 items-center gap-1.5 text-xs">
            <span className={cn("size-1.5 rounded-full", TONE_DOT[statusTone])} />
            {fresh.age}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);
  return <ProductCardInner product={product} saved={saved} onSave={() => setSaved((s) => !s)} />;
}

// ── list view row ──────────────────────────────────────────
export function ProductRow({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);
  const fresh = freshness(product.last_confirmed_at);
  const statusTone = product.confirmation_status ? (product.confirmation_status as FreshnessTone) : fresh.tone;
  const image = product.image || null;

  return (
    <div className="border-tn-hair flex items-center gap-[18px] rounded-[18px] border bg-white p-3.5 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
      <div className="bg-tn-paper relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl">
        {image ? (
          <Image src={image} alt={product.title} fill sizes="92px" className="object-cover" />
        ) : (
          <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
        )}
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Unsave" : "Save"}
          onClick={() => setSaved((s) => !s)}
          className="bg-white/95 text-tn-ink2 absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-lg shadow-[0_2px_8px_rgba(11,11,11,0.06)]"
        >
          <Icon name="heart" size={14} className={saved ? "text-tn-red" : ""} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-tn-mute truncate text-[10.5px] font-bold tracking-[0.06em] uppercase">
          {product.category?.name ?? "Electronics"}
        </p>
        <h3 className="text-tn-ink truncate text-base font-extrabold tracking-[-0.02em]">
          {product.title}
        </h3>
        <p className="text-tn-ink2 mt-1 flex items-center gap-1.5 text-[12.5px]">
          {product.shop_verified && <VerifiedBadge size={11} />}
          <span className="truncate">{product.shop_name}</span>
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-tn-mono text-tn-red text-[17px] font-semibold tracking-[-0.02em]">
          {formatETB(product.price)}
        </p>
        <p className="font-tn-mono text-tn-mute mt-1 flex items-center justify-end gap-1.5 text-[11.5px]">
          <span className={cn("size-1.5 rounded-full", TONE_DOT[statusTone])} />
          {fresh.age}
        </p>
      </div>
    </div>
  );
}

// ── skeleton (design geometry) ─────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-tn-hair bg-white">
      <div className="bg-tn-hair2 aspect-square animate-pulse" />
      <div className="px-4 pt-3.5 pb-4">
        <div className="bg-tn-hair2 h-2.5 w-16 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-2.5 h-3.5 w-[85%] animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-3.5 h-4 w-[55%] animate-pulse rounded" />
      </div>
    </div>
  );
}
