"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { DEFAULT_FILTERS, type SearchFilters } from "@/lib/filters";
import { FilterControls, type CategoryOption } from "./filter-controls";
import { useModal } from "@/hooks/use-modal";

// Mobile / tablet filter sheet (handoff: a drawer/sheet; we use a bottom sheet).
// Controls edit a local draft; "Show N results" applies the draft to the URL
// and closes — matching the design's apply pattern and avoiding URL churn.
export function FilterSheet({
  open,
  onClose,
  filters,
  categories,
  products,
  bounds,
  onApply,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  categories: CategoryOption[];
  products: Product[];
  bounds?: { min: number; max: number };
  onApply: (filters: SearchFilters) => void;
  resultCount: number | undefined;
}) {
  const [draft, setDraft] = useState<SearchFilters>(filters);
  const [prevOpen, setPrevOpen] = useState(open);
  const dialogRef = useModal<HTMLDivElement>(open, onClose);

  // Refresh the draft from the URL each time the sheet opens.
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setDraft(filters);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="absolute inset-x-0 bottom-0 flex max-h-[85%] flex-col rounded-t-[26px] border-t border-tn-hair bg-white shadow-[-0_-10px_40px_rgba(11,11,11,0.18)]"
      >
        <div className="flex justify-center pt-2.5">
          <span className="bg-tn-hair h-[5px] w-[38px] rounded-full" />
        </div>
        <div className="flex items-center justify-between border-b border-tn-hair2 px-5 pt-3 pb-4">
          <span className="text-tn-ink text-[19px] font-extrabold tracking-[-0.02em]">Filters</span>
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_FILTERS)}
            className="text-tn-mute cursor-pointer bg-transparent text-[13px] font-bold"
          >
            Reset
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          <FilterControls
            filters={draft}
            categories={categories}
            products={products}
            bounds={bounds}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          />
        </div>

        <div className="flex gap-2.5 border-t border-tn-hair2 p-4 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="border-tn-hair text-tn-ink h-[50px] rounded-2xl border-[1.5px] bg-white px-5 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="bg-tn-red text-white h-[50px] flex-1 rounded-2xl text-[14.5px] font-bold shadow-[0_8px_20px_rgba(204,48,0,0.28)]"
          >
            Show {resultCount === undefined ? "results" : `${resultCount.toLocaleString("en-US")} results`}
          </button>
        </div>
      </div>
    </div>
  );
}
