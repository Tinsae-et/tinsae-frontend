"use client";

import { SortDropdown } from "@/components/tinsae/sort-dropdown";
import { SORT_OPTIONS, type SortKey } from "@/lib/filters";

// Custom sort dropdown for the /products hero band (design_handoff_search:
// a 44px pill with the sort icon + a transparent select). We render our own
// popup instead of the OS menu so it matches the app's design language.

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <SortDropdown
      value={value}
      onChange={onChange}
      options={SORT_OPTIONS}
      size="md"
    />
  );
}
