"use client";

import type { Product } from "@/lib/types";
import { type SearchFilters } from "@/lib/filters";
import { FilterControls, type CategoryOption } from "./filter-controls";

// Desktop filter rail — sticky 268px card (handoff: top: 90px under the nav).
// Hidden below lg; mobile uses FilterSheet instead.
export function FilterRail({
  filters,
  categories,
  products,
  bounds,
  onChange,
  onReset,
}: {
  filters: SearchFilters;
  categories: CategoryOption[];
  products: Product[];
  bounds?: { min: number; max: number };
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
}) {
  return (
    <aside className="hidden w-[268px] shrink-0 lg:block">
      <div className="sticky top-[90px] rounded-[18px] border border-tn-hair bg-white px-[22px] pt-2 pb-[18px]">
        <div className="flex items-center justify-between py-4">
          <span className="text-tn-ink text-sm font-extrabold tracking-[-0.01em]">Filters</span>
          <button
            type="button"
            onClick={onReset}
            className="text-tn-red cursor-pointer bg-transparent text-[12.5px] font-bold"
          >
            Reset
          </button>
        </div>
        <FilterControls filters={filters} categories={categories} products={products} bounds={bounds} onChange={onChange} />
      </div>
    </aside>
  );
}
