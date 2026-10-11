"use client";

import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { useCompare } from "@/hooks/use-compare";
import type { Product } from "@/lib/types";
import { formatETB } from "@/lib/format";
import Image from "next/image";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";

export function CompareEmptyState({
  singleProduct,
  onOpenAddModal,
}: {
  singleProduct?: Product | null;
  onOpenAddModal?: () => void;
}) {
  const { setCompareSlugs } = useCompare();

  // Quick preset comparisons
  const popularPresets = [
    {
      title: "iPhone 15 Pro Max vs Galaxy S24 Ultra",
      description: "Top flagships head-to-head on price, battery & camera",
      slugs: ["iphone-15-pro-max", "galaxy-s24-ultra"],
    },
    {
      title: "iPhone 15 Pro vs iPhone 15 Pro Max",
      description: "Size, battery life, and price spread compared",
      slugs: ["iphone-15-pro", "iphone-15-pro-max"],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl py-12 text-center">
      {/* Visual illustration icon */}
      <div className="bg-tn-paper mx-auto flex size-20 items-center justify-center rounded-[24px] shadow-sm">
        <Icon name="sliders" size={36} className="text-tn-red" />
      </div>

      <h2 className="text-tn-ink mt-6 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
        {singleProduct ? "Select at least 2 products to compare" : "Compare products side by side"}
      </h2>

      <p className="text-tn-mute mx-auto mt-3 max-w-lg text-[15px] leading-relaxed">
        {singleProduct
          ? "You have 1 product selected. Add another product to compare prices, verified shops, and full specifications."
          : "Put up to 4 devices side by side to compare live prices, verified shop locations, Telegram confirmation freshness, and hardware specs."}
      </p>

      {/* Single product preview if 1 product is already chosen */}
      {singleProduct && (
        <div className="border-tn-hair mx-auto mt-6 flex max-w-md items-center gap-3.5 rounded-2xl border bg-white p-3.5 text-left shadow-sm">
          <div className="bg-tn-paper relative size-16 shrink-0 overflow-hidden rounded-xl">
            {singleProduct.images?.[0]?.url ? (
              <Image
                src={singleProduct.images[0].url}
                alt={singleProduct.title}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            ) : (
              <ProdPlaceholder kind={kindForSlug(singleProduct.category?.slug)} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="bg-tn-paper text-tn-ink2 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">
              1 of 2 min selected
            </span>
            <h4 className="text-tn-ink truncate text-sm font-extrabold">{singleProduct.title}</h4>
            <p className="font-tn-mono text-tn-red text-xs font-bold">{formatETB(singleProduct.price)}</p>
          </div>
          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="bg-tn-ink text-white inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold"
            >
              <Icon name="plus" size={13} />
              Add 2nd
            </button>
          )}
        </div>
      )}

      {/* Primary Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="bg-tn-ink hover:bg-black text-white inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold shadow-[0_8px_22px_rgba(11,11,11,0.18)] transition-all hover:-translate-y-px"
          >
            <Icon name="plus" size={16} />
            Search & add products
          </button>
        )}
        <Pill kind="solid" size="md" href="/products" icon="search">
          Browse all listings
        </Pill>
      </div>

      {/* Preset Suggestions */}
      <div className="mt-14 border-t border-tn-hair pt-10">
        <p className="text-tn-mute text-[11px] font-extrabold tracking-[0.08em] uppercase">
          Popular comparisons in Ethiopia
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {popularPresets.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => {
                setCompareSlugs(preset.slugs);
              }}
              className="border-tn-hair bg-tn-paper/40 hover:bg-white hover:border-tn-ink/30 flex flex-col items-start rounded-2xl border p-4.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-tn-ink text-[15px] font-extrabold tracking-tight">
                {preset.title}
              </span>
              <span className="text-tn-mute mt-1 text-xs">
                {preset.description}
              </span>
              <span className="text-tn-red mt-3 inline-flex items-center gap-1 text-xs font-bold">
                Compare these phones <Icon name="arrow" size={12} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
