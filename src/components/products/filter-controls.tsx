"use client";

import { useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { PriceSlider } from "./price-slider";
import { type SearchFilters } from "@/lib/filters";
import { cn } from "@/lib/utils";

// The design's filter rail (design_handoff_search): collapsible groups with
// checkbox rows + counts. Brand / Condition / Neighborhood are display-only
// (the backend has no facets endpoint yet — toggling them re-queries and
// round-trips the URL but doesn't change results). Price + Stock freshness are
// wired, plus the ticket's Category and Verified-only (Trust) groups.

export type CategoryOption = { slug: string; name: string };

function Group({
  open,
  onToggle,
  title,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-tn-hair2 border-b py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between bg-transparent p-0"
      >
        <span className="text-tn-ink text-[13.5px] font-extrabold tracking-[-0.01em]">{title}</span>
        <Icon name={open ? "minus" : "plus"} size={15} className="text-tn-mute" />
      </button>
      {open && <div className="mt-3.5">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <span
        className={cn(
          "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[6px]",
          checked ? "bg-tn-red" : "border-tn-hair border-[1.5px] bg-white",
        )}
      >
        {checked && <Icon name="check" size={12} className="text-white" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
      />
      <span className="text-tn-ink2 flex-1 text-[13.5px] font-medium">{label}</span>
      {count !== undefined && <span className="font-tn-mono text-tn-mute text-[11.5px]">{count}</span>}
    </label>
  );
}

const BRANDS: [string, number][] = [
  ["Apple", 412],
  ["Samsung", 286],
  ["Sony", 164],
  ["Dell", 92],
  ["Xiaomi", 71],
];
const CONDITIONS = ["New · Sealed", "New · Open box", "Refurbished", "Used"];
const NEIGHBORHOODS: [string, number][] = [
  ["Bole · Atlas", 62],
  ["Bole · Friendship", 54],
  ["Bole · Medhanialem", 38],
  ["Bole · Olympia", 31],
];
const FRESHNESS: [string, number][] = [
  ["Confirmed today", 312],
  ["Within 12 hrs", 418],
  ["Within 24 hrs", 520],
];

export function FilterControls({
  filters,
  categories,
  onChange,
}: {
  filters: SearchFilters;
  categories: CategoryOption[];
  onChange: (patch: Partial<SearchFilters>) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    condition: true,
    price: true,
    neighborhood: true,
    freshness: true,
    trust: true,
  });
  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  return (
    <div>
      {categories.length > 0 && (
        <Group open={open.category} onToggle={() => toggle("category")} title="Category">
          {categories.map((c) => (
            <CheckRow
              key={c.slug}
              label={c.name}
              checked={filters.category === c.slug}
              onChange={(on) => onChange({ category: on ? c.slug : undefined })}
            />
          ))}
        </Group>
      )}

      <Group open={open.brand} onToggle={() => toggle("brand")} title="Brand">
        {BRANDS.map(([b, c]) => (
          <CheckRow
            key={b}
            label={b}
            count={c}
            checked={filters.brands.includes(b)}
            onChange={(on) =>
              onChange({ brands: on ? [...filters.brands, b] : filters.brands.filter((x) => x !== b) })
            }
          />
        ))}
        <button type="button" className="text-tn-red cursor-pointer bg-transparent pt-2 text-xs font-bold">
          + 18 more
        </button>
      </Group>

      <Group open={open.condition} onToggle={() => toggle("condition")} title="Condition">
        {CONDITIONS.map((c) => (
          <CheckRow
            key={c}
            label={c}
            checked={filters.conditions.includes(c)}
            onChange={(on) =>
              onChange({
                conditions: on ? [...filters.conditions, c] : filters.conditions.filter((x) => x !== c),
              })
            }
          />
        ))}
      </Group>

      <Group open={open.price} onToggle={() => toggle("price")} title="Price (ETB)">
        <PriceSlider
          min={filters.minPrice}
          max={filters.maxPrice}
          onChange={(patch) => onChange(patch)}
        />
      </Group>

      <Group open={open.neighborhood} onToggle={() => toggle("neighborhood")} title="Neighborhood">
        {NEIGHBORHOODS.map(([n, c]) => (
          <CheckRow
            key={n}
            label={n}
            count={c}
            checked={filters.neighborhoods.includes(n)}
            onChange={(on) =>
              onChange({
                neighborhoods: on
                  ? [...filters.neighborhoods, n]
                  : filters.neighborhoods.filter((x) => x !== n),
              })
            }
          />
        ))}
      </Group>

      <Group open={open.freshness} onToggle={() => toggle("freshness")} title="Stock freshness">
        {FRESHNESS.map(([f, c]) => (
          <CheckRow
            key={f}
            label={f}
            count={c}
            checked={!!filters.freshness}
            onChange={(on) => onChange({ freshness: on || undefined })}
          />
        ))}
      </Group>

      <Group open={open.trust} onToggle={() => toggle("trust")} title="Trust">
        <CheckRow
          label="Verified shops only"
          checked={!!filters.verifiedOnly}
          onChange={(on) => onChange({ verifiedOnly: on || undefined })}
        />
      </Group>
    </div>
  );
}
