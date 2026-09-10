"use client";

import React from "react";
import type { ShopProductQuery } from "@/lib/api";

type CategoryFilter = "" | "phones" | "laptops" | "audio" | "tablets" | "accessories";

type CategoryChip = {
  id: CategoryFilter;
  label: string;
};

const CATEGORY_CHIPS: CategoryChip[] = [
  { id: "", label: "All" },
  { id: "phones", label: "Phones" },
  { id: "laptops", label: "Laptops" },
  { id: "audio", label: "Audio" },
  { id: "tablets", label: "Tablets" },
  { id: "accessories", label: "Accessories" },
];

export function CategoryChips({
  query,
  setQuery,
  total,
}: {
  query: ShopProductQuery;
  setQuery: React.Dispatch<React.SetStateAction<ShopProductQuery>>;
  total: number;
}) {
  const currentCategory = (query.category ?? "") as CategoryFilter;

  return (
    <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
      {CATEGORY_CHIPS.map((chip) => {
        const active = currentCategory === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => {
              setQuery((prev) => ({
                ...prev,
                category: chip.id ? chip.id : undefined,
                page: 1,
              }));
            }}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer ${
              active
                ? "border-tn-ink bg-tn-ink text-white"
                : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
            }`}
          >
            <span>{chip.label}</span>
            {active && (
              <span className="font-tn-mono text-xs opacity-70">
                {total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryChips;