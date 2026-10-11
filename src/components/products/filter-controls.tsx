"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { PriceSlider } from "./price-slider";
import type { Product } from "@/lib/types";
import type { ProductFacets } from "@/lib/api/public";
import type { CategorySchema, SpecField } from "@/lib/specs/schema";
import {
  CONDITION_OPTIONS,
  formatSpecNumber,
  FRESHNESS_OPTIONS,
  type SearchFilters,
  type SpecRange,
} from "@/lib/filters";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

// The filter rail (design_handoff_search): collapsible groups with checkbox
// rows and live counts. Every count is the backend's facet count -- what
// ticking that option would show -- and options nothing matches are hidden.
// Spec groups come from the selected category's schema, so a category gets
// the filters its listings actually carry: fuel and year on Cars, RAM and
// storage on Phones.

/** A category for the filter; a subcategory names its parent. */
export type CategoryOption = {
  slug: string;
  name: string;
  icon?: IconName;
  parentSlug?: string;
  parentName?: string;
  /** Property: the page offers a "For rent | For sale" switch. */
  saleOrRent?: boolean;
};

/** Options shown before "Show all". */
const VISIBLE_OPTIONS = 6;

function Group({
  open,
  onToggle,
  title,
  badge,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  /** How many values are picked in this group. */
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-tn-hair2 border-b py-4 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between bg-transparent p-0"
      >
        <span className="text-tn-ink flex items-center gap-2 text-[13.5px] font-extrabold tracking-[-0.01em]">
          {title}
          {badge ? (
            <span className="bg-tn-red inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-extrabold text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <Icon name={open ? "minus" : "plus"} size={15} className="text-tn-mute" />
      </button>
      {open && <div className="mt-3">{children}</div>}
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
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 rounded-lg py-1.5">
      <span
        className={cn(
          "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[6px] transition-colors",
          checked ? "bg-tn-red" : "border-tn-hair group-hover:border-tn-ink/40 border-[1.5px] bg-white",
        )}
      >
        {checked && <Icon name="check" size={12} className="text-white" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "flex-1 truncate text-[13.5px]",
          checked ? "text-tn-ink font-bold" : "text-tn-ink2 font-medium",
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="font-tn-mono text-tn-mute text-[11.5px]">{formatCount(count)}</span>
      )}
    </label>
  );
}

/** A list of check rows that folds after `VISIBLE_OPTIONS`; picked ones always show. */
function OptionList({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onToggle: (value: string, on: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded
    ? options
    : options.filter((o, i) => i < VISIBLE_OPTIONS || selected.includes(o.value));
  const hidden = options.length - shown.length;
  return (
    <div>
      {shown.map((o) => (
        <CheckRow
          key={o.value}
          label={o.label}
          count={o.count}
          checked={selected.includes(o.value)}
          onChange={(on) => onToggle(o.value, on)}
        />
      ))}
      {(hidden > 0 || expanded) && options.length > VISIBLE_OPTIONS && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-tn-red cursor-pointer bg-transparent pt-1.5 text-xs font-bold"
        >
          {expanded ? "Show fewer" : `Show all ${options.length}`}
        </button>
      )}
    </div>
  );
}

/** Min / max boxes for a number spec, applied on blur or Enter. */
function RangeInputs({
  field,
  value,
  available,
  onChange,
}: {
  field: SpecField;
  value: SpecRange | undefined;
  available?: { min: number; max: number } | null;
  onChange: (range: SpecRange) => void;
}) {
  const unit = field.unit ? ` ${field.unit}` : "";
  const box = (bound: "min" | "max") => {
    const current = value?.[bound];
    const hint = available?.[bound];
    return (
      <label className="border-tn-hair focus-within:border-tn-ink flex h-10 min-w-0 flex-1 items-center gap-1.5 rounded-xl border bg-white px-3 transition-colors">
        <span className="text-tn-mute text-[10.5px] font-extrabold uppercase">
          {bound === "min" ? "Min" : "Max"}
        </span>
        <input
          // Remount when the applied value changes, so "Clear" resets the box.
          key={`${bound}-${current ?? ""}`}
          type="number"
          inputMode="decimal"
          defaultValue={current ?? ""}
          placeholder={hint !== undefined ? String(hint) : "Any"}
          aria-label={`${field.label} ${bound === "min" ? "minimum" : "maximum"}`}
          className="text-tn-ink placeholder:text-tn-mute/70 font-tn-mono min-w-0 flex-1 bg-transparent text-[13px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          onBlur={(e) => commit(bound, e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(bound, e.currentTarget.value);
          }}
        />
      </label>
    );
  };
  const commit = (bound: "min" | "max", raw: string) => {
    const n = raw.trim() === "" ? undefined : Number(raw);
    if (n !== undefined && !Number.isFinite(n)) return;
    if (n === value?.[bound]) return;
    onChange({ ...value, [bound]: n });
  };
  const active = value?.min !== undefined || value?.max !== undefined;
  return (
    <div>
      <div className="flex items-center gap-2">
        {box("min")}
        <span className="text-tn-mute text-xs">–</span>
        {box("max")}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
        <span className="text-tn-mute">
          {available
            ? `Listed: ${formatSpecNumber(available.min, field.unit)}–${formatSpecNumber(available.max, field.unit)}${unit}`
            : unit.trim()}
        </span>
        {active && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-tn-red cursor-pointer bg-transparent font-bold"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The category tree. Every top-level category stays in view, so picking one
 * never hides the others; a group ("Vehicles & Auto") opens in place under
 * its row. Its chevron opens or closes it without changing the filter, and
 * the group of the picked category is always open. Counts follow the other
 * filters, so the tree shows where matching listings are.
 */
function CategoryNav({
  categories,
  selected,
  facets,
  onPick,
}: {
  categories: CategoryOption[];
  selected: string | undefined;
  facets: ProductFacets | null;
  onPick: (slug: string | undefined) => void;
}) {
  // Groups opened or closed by hand; anything not listed follows the default.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const current = categories.find((c) => c.slug === selected);
  const currentGroup = current?.parentSlug ?? current?.slug;
  const childrenOf = (slug: string) => categories.filter((c) => c.parentSlug === slug);
  // Once counts load, a category missing from them has nothing matching: 0.
  const countOf = (slug?: string) =>
    facets?.categories ? (slug ? (facets.categories[slug] ?? 0) : facets.category_total) : undefined;

  const row = (
    c: { slug?: string; name: string; icon?: IconName },
    { child = false }: { child?: boolean } = {},
  ) => {
    const isCurrent = c.slug === selected;
    const count = countOf(c.slug);
    const empty = count === 0 && !isCurrent;
    return (
      <button
        type="button"
        onClick={() => onPick(c.slug)}
        aria-current={isCurrent ? "true" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] px-2 text-left transition-colors",
          child ? "h-8 text-[13px]" : "h-9 text-[13.5px]",
          isCurrent
            ? "bg-tn-red-soft text-tn-red-dark font-extrabold"
            : cn("hover:bg-tn-paper font-semibold", empty ? "text-tn-mute/70" : "text-tn-ink2"),
        )}
      >
        {!child && (
          <Icon
            name={c.icon ?? "tag"}
            size={16}
            className={cn("shrink-0", isCurrent ? "text-tn-red" : "text-tn-mute")}
          />
        )}
        <span className="flex-1 truncate">{c.name}</span>
        {count !== undefined && (
          <span
            className={cn(
              "font-tn-mono text-[11.5px] font-normal",
              isCurrent ? "text-tn-red-dark/70" : "text-tn-mute",
            )}
          >
            {formatCount(count)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="-mx-2 space-y-0.5">
      {/* Rows without a chevron keep its width, so every count lines up. */}
      <div className="flex items-center gap-0.5">
        {row({ name: "All categories", icon: "spec" })}
        <span className="size-8 shrink-0" />
      </div>
      {categories
        .filter((c) => !c.parentSlug)
        .map((c) => {
          const children = childrenOf(c.slug);
          if (!children.length)
            return (
              <div key={c.slug} className="flex items-center gap-0.5">
                {row(c)}
                <span className="size-8 shrink-0" />
              </div>
            );
          const open = toggled[c.slug] ?? c.slug === currentGroup;
          return (
            <div key={c.slug}>
              <div className="flex items-center gap-0.5">
                {row(c)}
                <button
                  type="button"
                  onClick={() => setToggled((t) => ({ ...t, [c.slug]: !open }))}
                  aria-expanded={open}
                  aria-label={`${open ? "Hide" : "Show"} ${c.name} subcategories`}
                  className="text-tn-mute hover:bg-tn-paper hover:text-tn-ink inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] transition-colors"
                >
                  <Icon
                    name="chevd"
                    size={14}
                    className={cn("transition-transform duration-150", open && "rotate-180")}
                  />
                </button>
              </div>
              {open && (
                <div className="border-tn-hair2 mt-0.5 mb-1 ml-[17px] space-y-0.5 border-l pl-2.5 animate-[tnRise_0.12s_ease_both]">
                  {children.map((child) => (
                    <div key={child.slug} className="flex items-center gap-0.5">
                      {row(child, { child: true })}
                      <span className="size-8 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

export function FilterControls({
  filters,
  categories,
  products,
  bounds,
  schema,
  facets,
  onChange,
}: {
  filters: SearchFilters;
  categories: CategoryOption[];
  products: Product[];
  bounds?: { min: number; max: number };
  /** The selected category's spec schema; null without one. */
  schema?: CategorySchema | null;
  /** Live counts for the current filters; null while loading or unavailable. */
  facets?: ProductFacets | null;
  onChange: (patch: Partial<SearchFilters>) => void;
}) {
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const isOpen = (key: string, byDefault = true) => (key in closed ? !closed[key] : byDefault);
  const toggle = (key: string, byDefault = true) =>
    setClosed((c) => ({ ...c, [key]: isOpen(key, byDefault) }));

  // Changing category clears the old category's filters (see withCategory).
  const pickCategory = (slug: string | undefined) => {
    if (slug === filters.category) return;
    onChange({ category: slug, specs: {}, ranges: {}, brands: [], conditions: [] });
  };

  const toggleValue = (list: string[], value: string, on: boolean) =>
    on ? [...list, value] : list.filter((v) => v !== value);

  const specGroup = (field: SpecField) => {
    const facet = facets?.specs[field.key];
    const groupKey = `spec:${field.key}`;
    const byDefault = (field.section ?? "key") === "key";

    if (field.type === "number") {
      const range = filters.ranges[field.key];
      const active = range?.min !== undefined || range?.max !== undefined;
      // Nothing listed with this spec, and no filter on it: no group.
      if (!active && (!facet?.range || facet.range.min === facet.range.max)) return null;
      return (
        <Group
          key={field.key}
          title={field.unit ? `${field.label} (${field.unit})` : field.label}
          badge={active ? 1 : 0}
          open={isOpen(groupKey, byDefault || active)}
          onToggle={() => toggle(groupKey, byDefault || active)}
        >
          <RangeInputs
            field={field}
            value={range}
            available={facet?.range}
            onChange={(next) => {
              const ranges = { ...filters.ranges };
              if (next.min === undefined && next.max === undefined) delete ranges[field.key];
              else ranges[field.key] = next;
              onChange({ ranges });
            }}
          />
        </Group>
      );
    }

    const picked = filters.specs[field.key] ?? [];
    const counts = new Map(facet?.values?.map((v) => [v.value.toLowerCase(), v]) ?? []);
    // Enum: the schema's options in its order. Text: what listings hold, most common first.
    const options =
      field.type === "enum"
        ? (field.options ?? []).map((o) => ({
            value: o.value,
            label: o.label,
            count: counts.get(o.value.toLowerCase())?.count,
          }))
        : (facet?.values ?? []).map((v) => ({ value: v.value, label: v.value, count: v.count }));
    const visible = options.filter((o) => (o.count ?? 0) > 0 || picked.includes(o.value));
    if (!visible.length) return null;
    return (
      <Group
        key={field.key}
        title={field.label}
        badge={picked.length}
        open={isOpen(groupKey, byDefault || picked.length > 0)}
        onToggle={() => toggle(groupKey, byDefault || picked.length > 0)}
      >
        <OptionList
          options={visible}
          selected={picked}
          onToggle={(value, on) => {
            const specs = { ...filters.specs, [field.key]: toggleValue(picked, value, on) };
            if (!specs[field.key].length) delete specs[field.key];
            onChange({ specs });
          }}
        />
      </Group>
    );
  };

  const fields = schema?.fields ?? [];
  const keyFields = fields.filter((f) => (f.section ?? "key") === "key");
  const otherFields = fields.filter((f) => (f.section ?? "key") !== "key");

  const brandCounts = new Map(facets?.brands.map((b) => [b.value.toLowerCase(), b.count]) ?? []);
  const brandOptions = [
    ...(facets?.brands.map((b) => ({ value: b.value, label: b.value, count: b.count })) ?? []),
    // A picked brand stays visible even when nothing else matches it any more.
    ...filters.brands
      .filter((b) => !brandCounts.has(b.toLowerCase()))
      .map((b) => ({ value: b, label: b, count: 0 })),
  ];
  const conditionCounts = new Map(facets?.conditions.map((c) => [c.value, c.count]) ?? []);
  const conditionOptions = CONDITION_OPTIONS.map((c) => ({
    ...c,
    count: conditionCounts.get(c.value) ?? 0,
  })).filter((c) => c.count > 0 || filters.conditions.includes(c.value));

  return (
    <div>
      {categories.length > 0 && (
        <Group
          open={isOpen("category")}
          onToggle={() => toggle("category")}
          title="Category"
        >
          <CategoryNav
            categories={categories}
            selected={filters.category}
            facets={facets ?? null}
            onPick={pickCategory}
          />
        </Group>
      )}

      <Group open={isOpen("price")} onToggle={() => toggle("price")} title="Price (ETB)">
        <PriceSlider
          // A new range (another category) restarts the slider; it keeps its
          // track in state, so Phones would otherwise inherit Cars' millions.
          key={bounds ? `${bounds.min}-${bounds.max}` : "auto"}
          products={products}
          bounds={bounds}
          min={filters.minPrice}
          max={filters.maxPrice}
          onChange={(patch) => onChange(patch)}
        />
      </Group>

      {keyFields.map(specGroup)}

      {brandOptions.length > 0 && (
        <Group
          open={isOpen("brand")}
          onToggle={() => toggle("brand")}
          title={schema?.brandLabel ?? "Brand"}
          badge={filters.brands.length}
        >
          <OptionList
            options={brandOptions}
            selected={filters.brands}
            onToggle={(value, on) => onChange({ brands: toggleValue(filters.brands, value, on) })}
          />
        </Group>
      )}

      {conditionOptions.length > 0 && (
        <Group
          open={isOpen("condition")}
          onToggle={() => toggle("condition")}
          title="Condition"
          badge={filters.conditions.length}
        >
          <OptionList
            options={conditionOptions}
            selected={filters.conditions}
            onToggle={(value, on) =>
              onChange({ conditions: toggleValue(filters.conditions, value, on) })
            }
          />
        </Group>
      )}

      {/* Spec sheet and per-unit facts: folded until opened or in use. */}
      {otherFields.map(specGroup)}

      <Group open={isOpen("freshness")} onToggle={() => toggle("freshness")} title="Stock freshness">
        {FRESHNESS_OPTIONS.map((o) => (
          <CheckRow
            key={o.value}
            label={o.label}
            checked={filters.freshness === o.value}
            onChange={(on) => onChange({ freshness: on ? o.value : undefined })}
          />
        ))}
      </Group>

      <Group open={isOpen("trust")} onToggle={() => toggle("trust")} title="Trust">
        <CheckRow
          label="Verified shops only"
          checked={!!filters.verifiedOnly}
          onChange={(on) => onChange({ verifiedOnly: on || undefined })}
        />
      </Group>
    </div>
  );
}
