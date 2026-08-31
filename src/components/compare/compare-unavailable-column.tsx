"use client";

import { Icon } from "@/components/tinsae/icon";
import { ProdPlaceholder } from "@/components/tinsae/prod-placeholder";

export function CompareUnavailableHeader({
  slug,
  title,
  onRemove,
}: {
  slug: string;
  title?: string;
  onRemove: () => void;
}) {
  const displayTitle =
    title ||
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="relative flex flex-col items-center text-center opacity-70">
      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${displayTitle} from comparison`}
        className="bg-tn-paper hover:bg-tn-hair text-tn-mute hover:text-tn-ink absolute top-0 right-0 z-10 inline-flex size-7 items-center justify-center rounded-lg border border-tn-hair transition-colors"
      >
        <Icon name="close" size={13} />
      </button>

      {/* Placeholder image */}
      <div className="bg-tn-paper relative flex aspect-square w-full max-w-[140px] items-center justify-center overflow-hidden rounded-2xl p-3 grayscale">
        <ProdPlaceholder kind="phone" />
        <span className="bg-tn-ink/80 text-white absolute bottom-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Unavailable
        </span>
      </div>

      {/* Product Details */}
      <div className="mt-3.5 flex flex-col items-center">
        <p className="text-tn-mute text-[10.5px] font-extrabold tracking-[0.06em] uppercase">
          Listing ended
        </p>
        <h3 className="text-tn-mute line-clamp-2 min-h-[44px] text-[15.5px] font-extrabold leading-snug tracking-[-0.02em]">
          {displayTitle}
        </h3>
        <p className="text-tn-mute mt-0.5 text-xs font-semibold">
          Currently out of stock
        </p>

        <span className="border-tn-hair text-tn-mute mt-3 inline-flex h-9 items-center rounded-full border bg-white px-3.5 text-xs font-bold">
          No longer listed
        </span>
      </div>
    </div>
  );
}
