"use client";

import type { Product } from "@/lib/types";
import type { ProductFacets } from "@/lib/api/public";
import type { CategorySchema } from "@/lib/specs/schema";
import { type SearchFilters } from "@/lib/filters";
import { FilterControls, type CategoryOption } from "./filter-controls";

// Desktop filter rail — sticky 268px card (handoff: top: 90px under the nav).
// Hidden below lg; mobile uses FilterSheet instead.
export function FilterRail({
  filters,
  categories,
  products,
  bounds,
  schema,
  facets,
  onChange,
  onReset,
}: {
  filters: SearchFilters;
  categories: CategoryOption[];
  products: Product[];
  bounds?: { min: number; max: number };
  schema?: CategorySchema | null;
  facets?: ProductFacets | null;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
}) {
  return (
    <aside className="sticky top-[88px] hidden w-[268px] shrink-0 self-start lg:block">
      <div className="max-h-[calc(100vh-104px)] overflow-y-auto overscroll-contain rounded-[18px] border border-tn-hair bg-white px-[22px] pt-2 pb-[18px] shadow-sm">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white py-4">
          <span className="text-tn-ink text-sm font-extrabold tracking-[-0.01em]">Filters</span>
          <button
            type="button"
            onClick={onReset}
            className="text-tn-red cursor-pointer bg-transparent text-[12.5px] font-bold hover:underline"
          >
            Reset
          </button>
        </div>
        <FilterControls
          filters={filters}
          categories={categories}
          products={products}
          bounds={bounds}
          schema={schema}
          facets={facets}
          onChange={onChange}
        />
      </div>
    </aside>
  );
}
