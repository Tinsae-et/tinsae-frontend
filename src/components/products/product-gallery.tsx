"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/tinsae/icon";
import { ProdPlaceholder, type ProductKind } from "@/components/tinsae/prod-placeholder";
import { cn } from "@/lib/utils";

// Listing gallery — ported from design_handoff_listing.
// Sticky on desktop, main frame + thumbnail rail with click-to-swap.
// When real photography is missing we fall back to the silhouette placeholder
// on a dark gradient ground (as the prototype does).

const TONES = ["#1a1a1a", "#2a2520", "#0f1418", "#1a1a1a"];

export function ProductGallery({
  images,
  kind,
  inStock,
}: {
  images: string[];
  kind: ProductKind;
  inStock: boolean;
}) {
  const total = Math.max(1, images.length || TONES.length);
  const [idx, setIdx] = useState(0);
  const hasImage = images.length > 0;
  const ground = hasImage ? "#F7F6F2" : `linear-gradient(180deg, ${TONES[idx]} 0%, #050505 100%)`;

  return (
    <div className="lg:sticky lg:top-[90px]">
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[20px]"
        style={{ background: ground }}
      >
        {hasImage ? (
          <Image
            src={images[idx]}
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
            "absolute top-4 left-4 inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold",
            inStock ? "bg-white/95 text-[#157049]" : "bg-white/95 text-[#8a5512]",
          )}
        >
          <Icon name="check" size={13} />
          {inStock ? "Confirmed in stock today" : "Aging"}
        </span>

        <span className="font-tn-mono absolute right-4 bottom-4 rounded-full bg-black/50 px-3 py-1.5 text-[12px] text-white">
          {idx + 1} / {total}
        </span>
      </div>

      <div className="mt-3 flex gap-2.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Show image ${i + 1}`}
            aria-pressed={i === idx}
            className={cn(
              "flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-[12px]",
              i === idx ? "border-2 border-tn-red" : "border border-tn-hair",
            )}
          >
            {hasImage ? (
              <Image src={images[i]} alt="" fill sizes="25vw" className="object-cover" />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `linear-gradient(180deg, ${TONES[i]} 0%, #050505 100%)`,
                }}
              >
                <ProdPlaceholder kind={kind} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
