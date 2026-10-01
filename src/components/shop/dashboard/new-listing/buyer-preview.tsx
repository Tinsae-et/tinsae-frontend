"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { kindForSlug, ProdPlaceholder } from "@/components/tinsae/prod-placeholder";
import { ShopProductImage } from "@/lib/types";
import { normalizeImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ProductPreviewProps {
  name?: string;
  category?: string;
  brand?: string;
  variant?: string;
  price?: string;
  isAvailable?: boolean;
  coverPhoto?: ShopProductImage | null;
}

export function ProductPreview({
  name = "",
  category = "phone",
  brand = "",
  variant = "",
  price = "",
  isAvailable = true,
  coverPhoto = null,
}: ProductPreviewProps) {
  const displayPrice = (() => {
    if (!price) return "0";
    const num = parseFloat(price);
    return isNaN(num) ? "0" : num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  })();

  const coverSrc = (() => {
    if (!coverPhoto) return null;
    if (coverPhoto.image instanceof File) {
      if (typeof coverPhoto.preview === "string" && coverPhoto.preview.startsWith("blob:")) {
        return coverPhoto.preview;
      }
      return URL.createObjectURL(coverPhoto.image);
    }
    const src = coverPhoto.preview || coverPhoto.image || coverPhoto.url;
    if (typeof src === "string") {
      return normalizeImageUrl(src) || src;
    }
    return null;
  })();

  return (
    <div>
      <span className="text-[11px] font-extrabold tracking-[0.08em] uppercase text-tn-mute mb-2.5 block">
        Buyers will see
      </span>
      <article className="border border-tn-hair flex flex-col overflow-hidden rounded-[18px] bg-white pointer-events-none shadow-[0_2px_8px_rgba(11,11,11,0.03)]">
        <div className="bg-tn-paper relative aspect-square flex items-center justify-center overflow-hidden">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={name || "Product preview"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ProdPlaceholder kind={kindForSlug(category || "phone")} />
          )}

          <span
            className={cn(
              "absolute top-3 left-3 inline-flex h-[26px] items-center gap-1 rounded-full px-2.5 text-[11.5px] font-bold z-10 backdrop-blur-xs",
              isAvailable
                ? "bg-white/95 text-tn-ink border border-tn-hair/60 shadow-xs"
                : "bg-tn-paper/95 text-tn-mute border border-tn-hair"
            )}
          >
            <Icon name="check" size={12} className={isAvailable ? "text-tn-green" : "text-tn-mute"} />
            {isAvailable ? "In stock" : "Unavailable"}
          </span>

          <span className="bg-white/95 text-tn-ink2 absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-[10px] shadow-[0_2px_8px_rgba(11,11,11,0.06)]">
            <Icon name="heart" size={15} />
          </span>
        </div>

        <div className="px-[18px] pt-4 pb-[18px]">
          <p className="text-tn-mute truncate text-[10.5px] font-bold tracking-[0.06em] uppercase">
            {brand || category || "Product"}
          </p>
          <h3 className="text-tn-ink mt-1 truncate text-[15.5px] leading-tight font-extrabold tracking-[-0.02em]">
            {name.trim() || "Your product name"}
          </h3>
          <p className="text-xs text-tn-mute mt-0.5 truncate">
            {variant.trim() || "Add a model / variant"}
          </p>

          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-tn-mute text-[10.5px] font-semibold tracking-[0.04em] uppercase">
              ETB
            </span>
            <span className="font-tn-mono text-tn-ink text-lg font-bold tracking-[-0.02em]">
              {displayPrice}
            </span>
          </p>

          <div className="border-t border-tn-hair2 text-tn-ink2 mt-3 flex justify-between items-center gap-1.5 pt-3 text-[11.5px]">
            <span className="font-tn-mono text-tn-mute flex min-w-0 items-center gap-1.5 text-[10.5px]">
              <span className="size-1.5 shrink-0 rounded-full bg-tn-green" />
              <span className="truncate">1 shop</span>
            </span>
            <span className="font-tn-mono text-tn-mute flex min-w-0 items-center gap-1.5 text-[10.5px]">
              <span className="size-1.5 shrink-0 rounded-full bg-tn-green" />
              <span className="truncate">1h ago</span>
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}

export function DailyStockCheckIn() {
  return (
    <div className="rounded-[16px] border border-tn-hair bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-tn-telegram/10 text-tn-telegram">
          <Icon name="tg" size={19} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-extrabold text-tn-ink">
              Weekly stock check-in
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
              Automated
            </span>
          </div>
          <div className="text-[11.5px] text-tn-mute truncate">
            Monitored by @tinsae_et_bot
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-[10px] bg-tn-paper p-3 text-xs leading-relaxed text-tn-ink space-y-2">
        <p className="text-tn-mute">
          When published, this listing automatically starts with a{" "}
          <b className="text-emerald-700 font-semibold">Fresh (7 days)</b> status.
        </p>
        <p className="text-tn-mute">
          When due, the bot pings you on Telegram to confirm stock in 1 tap or reply{" "}
          <code className="font-bold text-tn-ink">sold</code> if out of stock.
        </p>
        <div className="pt-1 border-t border-tn-hair/60 flex items-center justify-between">
          <Link
            href="/shop/dashboard/telegram"
            className="text-[11px] font-bold text-tn-telegram hover:underline inline-flex items-center gap-1"
          >
            <span>Bot settings & guide</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const WeeklyStockProtection = DailyStockCheckIn;

export function BeforePublication({
  name,
  price,
  condition,
  specsComplete,
  coverPhoto,
  extraPhotos,
  action,
  submitting = false,
}: {
  name: string;
  price: string;
  condition: string;
  /** Every required spec for the chosen category is filled in and valid. */
  specsComplete: boolean;
  coverPhoto: ShopProductImage | null;
  extraPhotos: (ShopProductImage | null)[];
  action: string;
  submitting?: boolean;
}) {
  const hasPhoto = Boolean(coverPhoto || extraPhotos.some((p) => p !== null));
  const priceNum = parseFloat(price || "0");
  const isPriceSet = Boolean(price && !isNaN(priceNum) && priceNum > 0);
  const isNameSet = Boolean(name && name.trim().length >= 3);
  const isConditionSet = Boolean(condition);

  const CHECKLIST: ChecklistItem[] = [
    { id: "name", label: "Product name", done: isNameSet },
    { id: "photo", label: "At least one photo", done: hasPhoto },
    { id: "price", label: "Price set", done: isPriceSet },
    { id: "specs", label: "Required specs", done: specsComplete },
    { id: "condition", label: "Condition", done: isConditionSet },
  ];

  const allDone = CHECKLIST.every((item) => item.done);

  return (
    <div className="rounded-[16px] border border-tn-hair bg-white p-4">
      <h3 className="text-[13.5px] font-extrabold text-tn-ink mb-3">
        Before you publish
      </h3>

      <ul className="space-y-2">
        {CHECKLIST.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5 py-1">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                item.done
                  ? "bg-tn-green text-white"
                  : "bg-tn-hair2 border border-tn-hair text-transparent"
              )}
            >
              {item.done && <Icon name="check" size={12} strokeWidth={3} className="text-white" />}
            </span>
            <span
              className={cn(
                "text-xs font-semibold transition-colors",
                item.done ? "text-tn-ink" : "text-tn-mute"
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={!allDone || submitting}
        form="product-form"
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold tracking-[-0.01em] transition-all cursor-pointer",
          allDone && !submitting
            ? "bg-tn-ink text-white hover:bg-tn-ink/90 shadow-[0_2px_8px_rgba(11,11,11,0.12)]"
            : "border border-tn-hair bg-transparent text-tn-mute/50 cursor-not-allowed opacity-50"
        )}
      >
        <Icon name="check" size={14} />
        {submitting
          ? "Saving..."
          : action === "edit"
          ? "Save changes"
          : "Publish listing"}
      </button>
    </div>
  );
}