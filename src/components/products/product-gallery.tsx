"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/tinsae/icon";
import { ProdPlaceholder, type ProductKind } from "@/components/tinsae/prod-placeholder";
import { cn } from "@/lib/utils";
import { normalizeImageUrl, type FreshnessTone } from "@/lib/format";

// Listing gallery — ported from design_handoff_listing.
// Sticky on desktop, main frame + thumbnail rail with click-to-swap.
// When real photography is missing we fall back to the silhouette placeholder
// on a dark gradient ground (as the prototype does).

const TONES = ["#1a1a1a", "#2a2520", "#0f1418", "#1a1a1a"];

// Same restraint as the card badge: only "fresh" gets green and a check.
const TONE_BADGE: Record<FreshnessTone, string> = {
  fresh: "text-[#157049]",
  stale: "text-tn-ink2",
  unconfirmed: "text-tn-mute",
};

export function ProductGallery({
  images,
  kind,
  tone,
  label,
}: {
  images: string[];
  kind: ProductKind;
  tone: FreshnessTone;
  /** Pre-resolved badge text, so it can never disagree with `tone`. */
  label: string;
}) {
  const normalizedImages = images.map((img) => normalizeImageUrl(img) || img);
  const hasImage = normalizedImages.length > 0;
  const total = hasImage ? normalizedImages.length : TONES.length;
  const [idx, setIdx] = useState(0);
  const activeIdx = Math.min(idx, Math.max(0, total - 1));
  const currentImage = hasImage ? normalizedImages[activeIdx] : null;
  const ground = currentImage
    ? "#F7F6F2"
    : `linear-gradient(180deg, ${TONES[activeIdx % TONES.length]} 0%, #050505 100%)`;

  return (
    <div className="lg:sticky lg:top-[90px]">
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[20px]"
        style={{ background: ground }}
      >
        {currentImage ? (
          <Image
            src={currentImage}
            alt=""
            fill
            sizes="(max-width: 950px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <ProdPlaceholder kind={kind} />
        )}

        <span
          className={cn(
            "absolute top-4 left-4 inline-flex h-[30px] items-center gap-1.5 rounded-full bg-white/95 px-3 text-[12.5px] font-semibold",
            TONE_BADGE[tone],
          )}
        >
          {tone === "fresh" && <Icon name="check" size={13} />}
          {label}
        </span>

        <span className="font-tn-mono absolute right-4 bottom-4 rounded-full bg-black/50 px-3 py-1.5 text-[12px] text-white">
          {activeIdx + 1} / {total}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {Array.from({ length: total }).map((_, i) => {
          const thumbImage = hasImage ? normalizedImages[i] : null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === activeIdx}
              className={cn(
                "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[12px] transition-all",
                i === activeIdx ? "border-2 border-tn-red" : "border border-tn-hair hover:border-tn-ink2",
              )}
            >
              {thumbImage ? (
                <Image
                  src={thumbImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 25vw, 120px"
                  className="object-cover"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background: `linear-gradient(180deg, ${TONES[i % TONES.length]} 0%, #050505 100%)`,
                  }}
                >
                  <ProdPlaceholder kind={kind} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
