"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { formatETB, freshness, normalizeImageUrl } from "@/lib/format";
import { formatSavedAgo } from "@/hooks/use-saved";
import type { Product } from "@/lib/types";

export type SavedItemData =
  | {
      isAvailable: true;
      product: Product;
      savedAt: number;
    }
  | {
      isAvailable: false;
      slug: string;
      savedAt: number;
    };

function Toggle({
  on,
  onChange,
  label,
  icon,
}: {
  on: boolean;
  onChange: () => void;
  label: string;
  icon: "tag" | "box";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="inline-flex items-center gap-2 cursor-pointer transition-colors"
    >
      <span
        className={`relative inline-flex h-[21px] w-[36px] shrink-0 rounded-full transition-colors ${
          on ? "bg-tn-green" : "bg-[#D8D6CE]"
        }`}
      >
        <span
          className={`absolute top-[2.5px] size-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-all ${
            on ? "left-[17.5px]" : "left-[2.5px]"
          }`}
        />
      </span>
      <span
        className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold ${
          on ? "text-tn-ink" : "text-tn-mute"
        }`}
      >
        <Icon name={icon} size={14} className={on ? "text-tn-ink2" : "text-tn-mute"} />
        {label}
      </span>
    </button>
  );
}

export function SavedListingRow({
  item,
  onRemove,
}: {
  item: SavedItemData;
  onRemove: (slug: string) => void;
}) {
  const [priceDropAlert, setPriceDropAlert] = useState(true);
  const [stockAlert, setStockAlert] = useState(false);

  if (!item.isAvailable) {
    return (
      <article className="border-tn-hair relative overflow-hidden rounded-[16px] border bg-white opacity-85">
        {/* Upper band */}
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="bg-tn-paper border-tn-hair relative flex h-[72px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-xl border opacity-50">
            <ProdPlaceholder kind="phone" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-tn-mute text-[10px] font-bold tracking-[0.06em] uppercase">
              Unavailable listing
            </p>
            <h3 className="text-tn-ink mt-0.5 text-[16.5px] font-extrabold tracking-[-0.02em]">
              {item.slug.replace(/-/g, " ")}
            </h3>
            <p className="text-tn-mute mt-1 text-xs">
              This product is no longer active or confirmed in verified shops.
            </p>
            <p className="font-tn-mono text-tn-mute mt-2 flex items-center gap-1.5 text-[11.5px]">
              <Icon name="heart" size={12} className="text-tn-red" />
              <span>Saved {formatSavedAgo(item.savedAt)}</span>
            </p>
          </div>

          {/* Right side: Price & Remove button */}
          <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
            <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
              <span className="font-tn-mono text-tn-mute text-[16px] font-semibold line-through">
                Sold out
              </span>
              <span className="bg-tn-red-soft text-tn-red mt-1.5 inline-flex h-6 items-center rounded-[7px] px-2 text-[11.5px] font-bold">
                Unavailable
              </span>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.slug)}
              aria-label="Remove unavailable item from saved"
              title="Remove from saved"
              className="border-tn-hair text-tn-mute hover:border-tn-ink hover:text-tn-ink flex size-[34px] shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="size-[15px]" />
            </button>
          </div>
        </div>

        <div className="bg-tn-paper border-tn-hair2 flex items-center justify-between border-t px-5 py-2.5">
          <span className="text-tn-mute text-xs">
            Removed from merchant inventory
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.slug)}
            className="text-tn-red hover:underline text-xs font-bold cursor-pointer"
          >
            Remove from list
          </button>
        </div>
      </article>
    );
  }

  const { product, savedAt } = item;
  const image = normalizeImageUrl(product.images?.[0]?.url) || null;
  const fresh = freshness(product.last_confirmed_at, product.confirmation_status);

  return (
    <article className="border-tn-hair hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)] relative overflow-hidden rounded-[16px] border bg-white transition-[transform,box-shadow,border-color] duration-150">
      {/* Upper band */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        {/* Thumbnail */}
        <div className="bg-tn-paper border-tn-hair relative flex h-[72px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-xl border">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="60px"
              className="object-cover"
            />
          ) : (
            <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
          )}
        </div>

        {/* Product details */}
        <div className="min-w-0 flex-1">
          <p className="text-tn-mute text-[10px] font-bold tracking-[0.06em] uppercase">
            {product.category?.name ?? "Electronics"}
          </p>
          <h3 className="text-tn-ink mt-0.5 truncate text-[16.5px] font-extrabold tracking-[-0.02em] leading-snug">
            <Link
              href={`/products/${product.slug}`}
              className="hover:underline text-tn-ink"
            >
              {product.title}
            </Link>
          </h3>
          <div className="font-tn-mono text-tn-mute mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="heart" size={12} className="text-tn-red" />
              <span>Saved {formatSavedAgo(savedAt)}</span>
            </span>
            <span className="text-tn-hair">·</span>
            <span className="flex items-center gap-1">
              <span>{product.shop_name}</span>
              {product.shop_verified && <VerifiedBadge size={11} />}
            </span>
          </div>
        </div>

        {/* Right side: Price & Status block + Remove button */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
          <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-tn-mute text-[10.5px] font-bold tracking-[0.04em] uppercase">
                From
              </span>
              <span className="font-tn-mono text-tn-red text-[18px] font-semibold tracking-[-0.02em]">
                {formatETB(product.price)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={`inline-flex h-6 items-center gap-1 rounded-[7px] px-2 text-[11.5px] font-bold ${
                  fresh.tone === "fresh"
                    ? "bg-tn-green-soft text-[#157049]"
                    : "bg-tn-paper text-tn-ink2"
                }`}
              >
                {fresh.tone === "fresh" && <Icon name="check" size={11} />}
                <span>{fresh.badge}</span>
              </span>
            </div>
          </div>

          {/* Remove button: cleanly aligned next to price block */}
          <button
            type="button"
            onClick={() => onRemove(product.slug)}
            aria-label={`Remove ${product.title} from saved`}
            title="Remove from saved"
            className="border-tn-hair text-tn-mute hover:border-tn-ink hover:text-tn-ink flex size-[34px] shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="size-[15px]" />
          </button>
        </div>
      </div>

      {/* Lower band: alerts & actions */}
      <div className="bg-tn-paper border-tn-hair2 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="text-tn-mute text-[10.5px] font-bold tracking-[0.08em] uppercase">
            Alert me
          </span>
          <Toggle
            on={priceDropAlert}
            onChange={() => setPriceDropAlert((v) => !v)}
            label="Price drop"
            icon="tag"
          />
          <Toggle
            on={stockAlert}
            onChange={() => setStockAlert((v) => !v)}
            label="Back in stock"
            icon="box"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="text-tn-ink2 hover:text-tn-ink text-[12.5px] font-bold transition-colors"
          >
            View listing
          </Link>
          <Pill
            kind="solid"
            size="sm"
            icon="tg"
            href={`/products/${product.slug}`}
          >
            Contact shop
          </Pill>
        </div>
      </div>
    </article>
  );
}
