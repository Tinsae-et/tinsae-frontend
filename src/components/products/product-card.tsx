"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { formatETB, freshness, normalizeImageUrl, type FreshnessTone } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCompare } from "@/hooks/use-compare";
import { useSaved } from "@/hooks/use-saved";

// Matches the design's search-result card (design_handoff_search): radius 18,
// "In stock" (check) / "Aging" status tag, heart save button, "From ETB" price,
// freshness dot footer. Adapted to the backend model: the eyebrow shows the
// category (the API folds brand into title) and the footer shows the shop name
// + verified badge instead of "● N shops" (one shop per product in the API).

const TONE_DOT: Record<FreshnessTone, string> = {
  fresh: "bg-tn-green",
  stale: "bg-tn-stale",
  unconfirmed: "bg-tn-stale",
};

// Stale/unconfirmed read as quiet and factual rather than alarming — no red,
// no warning icon. Only "fresh" earns the green + check.
const TONE_BADGE: Record<FreshnessTone, string> = {
  fresh: "text-[#157049]",
  stale: "text-tn-ink2",
  unconfirmed: "text-tn-mute",
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
  const { isInCompare, toggleCompare } = useCompare();
  const inCompare = isInCompare(product.slug);

  const fresh = freshness(product.last_confirmed_at, product.confirmation_status);
  const tone = fresh.tone;
  const image = normalizeImageUrl(product.images?.[0]?.url) || null;

  const detailHref = `/products/${product.slug}`;

  return (
    <article className="border-tn-hair group relative flex flex-col overflow-hidden rounded-[18px] border bg-white transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
      {/* stretched link: the whole card navigates to the detail page */}
      <Link
        href={detailHref}
        aria-label={product.title}
        className="absolute inset-0 z-[1]"
      />

      <div className="bg-tn-paper relative aspect-square">
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

        <span
          className={cn(
            "absolute top-3 left-3 inline-flex h-[26px] items-center gap-1 rounded-full bg-white/95 px-2.5 text-[11.5px] font-semibold",
            TONE_BADGE[tone],
          )}
        >
          {tone === "fresh" && <Icon name="check" size={12} />}
          {fresh.badge}
        </span>

        {/* Top-right action buttons */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {/* Add to compare toggle */}
          <button
            type="button"
            aria-pressed={inCompare}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            title={inCompare ? "In compare (click to remove)" : "Add to compare"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleCompare(product.slug, product.title);
            }}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-[10px] shadow-[0_2px_8px_rgba(11,11,11,0.06)] transition-all",
              inCompare
                ? "bg-tn-ink text-white"
                : "bg-white/95 text-tn-ink2 hover:bg-white hover:text-tn-ink",
            )}
          >
            <Icon name="sliders" size={14} />
          </button>

          {/* Wishlist toggle */}
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? "Unsave" : "Save"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSave();
            }}
            className="bg-white/95 text-tn-ink2 hover:bg-white hover:text-tn-ink inline-flex size-8 items-center justify-center rounded-[10px] shadow-[0_2px_8px_rgba(11,11,11,0.06)] transition-colors"
          >
            <Icon name="heart" size={15} className={saved ? "text-tn-red" : ""} />
          </button>
        </div>
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

        {/* Stacked rather than side-by-side: "Confirmed 20d ago" is long enough
            that a single row truncated the shop name down to "B…". */}
        <div className="border-tn-hair2 text-tn-ink2 mt-3 flex flex-col gap-1.5 border-t pt-3 text-[11.5px]">
          <span className="flex min-w-0 items-center gap-1.5">
            {product.shop_verified && <VerifiedBadge size={11} />}
            <span className="truncate">{product.shop_name}</span>
          </span>
          <span className="font-tn-mono text-tn-mute flex min-w-0 items-center gap-1.5 text-[10.5px] sm:text-xs">
            <span className={cn("size-1.5 shrink-0 rounded-full", TONE_DOT[tone])} />
            <span className="truncate">{fresh.confirmed}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(product.slug);
  return <ProductCardInner product={product} saved={saved} onSave={() => toggleSaved(product.slug)} />;
}

// ── list view row ──────────────────────────────────────────
export function ProductRow({ product }: { product: Product }) {
  const { isInCompare, toggleCompare } = useCompare();
  const inCompare = isInCompare(product.slug);
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(product.slug);
  const fresh = freshness(product.last_confirmed_at, product.confirmation_status);
  const tone = fresh.tone;
  const image = normalizeImageUrl(product.images?.[0]?.url) || null;

  return (
    <div className="border-tn-hair group relative flex items-center gap-[18px] rounded-[18px] border bg-white p-3.5 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
      {/* stretched link: the whole row navigates to the detail page */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.title}
        className="absolute inset-0 z-[1]"
      />

      <div className="bg-tn-paper relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl">
        {image ? (
          <Image src={image} alt={product.title} fill sizes="92px" className="object-cover" />
        ) : (
          <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
        )}
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
          <button
            type="button"
            aria-pressed={inCompare}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            title={inCompare ? "In compare" : "Add to compare"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleCompare(product.slug, product.title);
            }}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-lg shadow-[0_2px_8px_rgba(11,11,11,0.06)] transition-all",
              inCompare
                ? "bg-tn-ink text-white"
                : "bg-white/95 text-tn-ink2 hover:bg-white",
            )}
          >
            <Icon name="sliders" size={13} />
          </button>

          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? "Unsave" : "Save"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleSaved(product.slug);
            }}
            className="bg-white/95 text-tn-ink2 hover:bg-white inline-flex size-7 items-center justify-center rounded-lg shadow-[0_2px_8px_rgba(11,11,11,0.06)]"
          >
            <Icon name="heart" size={14} className={saved ? "text-tn-red" : ""} />
          </button>
        </div>
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
          <span className={cn("size-1.5 rounded-full", TONE_DOT[tone])} />
          {fresh.confirmed}
        </p>
      </div>
    </div>
  );
}

// ── skeleton (design geometry) ─────────────────────────────
/**
 * Row-shaped placeholder for list view. Matches ProductRow's box exactly — a
 * 92px thumbnail inside p-3.5 and a 1px border — so swapping it for a real row
 * does not change the page height.
 */
export function ProductRowSkeleton() {
  return (
    <div className="border-tn-hair flex items-center gap-[18px] rounded-[18px] border bg-white p-3.5">
      <div className="bg-tn-hair2 h-[92px] w-[92px] shrink-0 animate-pulse rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="bg-tn-hair2 h-2.5 w-16 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-2.5 h-3.5 w-[60%] animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-3.5 h-4 w-[30%] animate-pulse rounded" />
      </div>
    </div>
  );
}

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
