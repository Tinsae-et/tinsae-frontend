"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { ProductGrid } from "./product-grid";
import { FilterRail } from "./filter-rail";
import type { CategoryOption } from "./filter-controls";
import { FilterSheet } from "./filter-sheet";
import { SortSelect } from "./sort-select";
import { BackToTop } from "./back-to-top";
import { useProducts, type InitialProducts } from "@/hooks/use-products";
import { getCategorySchema, getProductFacets, type ProductFacets } from "@/lib/api/public";
import type { CategorySchema } from "@/lib/specs/schema";
import {
  activeFilterCount,
  CONDITION_OPTIONS,
  DEFAULT_FILTERS,
  formatSpecNumber,
  filtersFromSearchParams,
  filtersToProductQuery,
  filtersToSearchParams,
  FRESHNESS_OPTIONS,
  SORT_OPTIONS,
  withCategory,
  type SearchFilters,
} from "@/lib/filters";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductsBrowser({
  categories,
  initial,
  priceBounds,
  initialSchema,
  initialFacets,
}: {
  categories: CategoryOption[];
  initial: InitialProducts;
  priceBounds?: { min: number; max: number };
  /** Server-rendered schema and counts for the first URL; refreshed here after. */
  initialSchema?: CategorySchema | null;
  initialFacets?: ProductFacets | null;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/products";
  const searchParams = useSearchParams();

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const query = useMemo(() => filtersToProductQuery(filters), [filters]);

  const {
    products,
    total,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    retry,
    retryLoadMore,
  } = useProducts(query, initial);

  // ── the category's spec schema (drives the spec filter groups) ──
  const isParentCategory =
    !!filters.category && categories.some((c) => c.parentSlug === filters.category);
  const [schemaState, setSchemaState] = useState<{
    slug?: string;
    schema: CategorySchema | null;
  }>({ slug: filters.category, schema: initialSchema ?? null });
  // A parent ("Vehicles & Auto") has no schema: a car and a tyre share no specs.
  const schema =
    !isParentCategory && schemaState.slug === filters.category ? schemaState.schema : null;
  useEffect(() => {
    const slug = filters.category;
    if (!slug || isParentCategory || schemaState.slug === slug) return;
    let alive = true;
    getCategorySchema(slug)
      .then((next) => alive && setSchemaState({ slug, schema: next }))
      .catch(() => alive && setSchemaState({ slug, schema: null }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, isParentCategory]);

  // ── live counts for every filter option ──
  const facetQuery = useMemo(() => ({ ...query, page: undefined, ordering: undefined }), [query]);
  const facetKey = JSON.stringify(facetQuery);
  const [facetState, setFacetState] = useState<{ key: string; data: ProductFacets | null }>(
    () => ({ key: facetKey, data: initialFacets ?? null }),
  );
  useEffect(() => {
    if (facetState.key === facetKey) return;
    const controller = new AbortController();
    getProductFacets(facetQuery, { signal: controller.signal })
      .then((data) => setFacetState({ key: facetKey, data }))
      .catch(() => {
        if (!controller.signal.aborted) setFacetState({ key: facetKey, data: null });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetKey]);
  // The previous counts stay up while new ones load, so the rail doesn't flash.
  const facets = facetState.data;
  // The price slider spans the current category's prices, not the catalogue's.
  const bounds = facets?.price ?? priceBounds;

  // Grid / list preference (per-user, not part of the shared URL).
  const [view, setView] = useState<"grid" | "list">("grid");
  useEffect(() => {
    try {
      localStorage.setItem("tinsae_view", view);
    } catch {
      /* ignore */
    }
  }, [view]);

  // ── URL helpers ──────────────────────────────────────────
  function navigate(next: URLSearchParams, mode: "push" | "replace") {
    const qs = next.toString();
    router[mode](qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function applyPatch(patch: Partial<SearchFilters>) {
    const current = filtersFromSearchParams(searchParams);
    // A new category clears the old one's spec, brand and condition filters.
    const base = "category" in patch ? withCategory(current, patch.category) : current;
    const next = { ...base, ...patch };
    // Rent or sale is the buyer's side, not one category's vocabulary: it
    // stays when they move from Apartments to Houses.
    const side = current.specs.listing_type;
    if (
      "category" in patch &&
      side?.length &&
      categories.find((c) => c.slug === patch.category)?.saleOrRent
    ) {
      next.specs = { ...next.specs, listing_type: side };
    }
    next.page = undefined; // any filter change resets infinite scroll
    navigate(filtersToSearchParams(next), "push");
  }

  function clearAll() {
    navigate(filtersToSearchParams(DEFAULT_FILTERS), "push");
  }

  // ── derived labels ───────────────────────────────────────
  const selectedCategory = categories.find((c) => c.slug === filters.category);
  const categoryName = selectedCategory?.name;
  // Inside a group ("Vehicles & Auto" or one of its subcategories): the
  // group's subcategories as a switcher under the title.
  const groupSlug =
    selectedCategory?.parentSlug ?? (isParentCategory ? filters.category : undefined);
  const group = groupSlug ? categories.find((c) => c.slug === groupSlug) : undefined;
  const groupChildren = groupSlug ? categories.filter((c) => c.parentSlug === groupSlug) : [];
  // Every category's count under the other filters: the same numbers on a
  // group's page and on each of its subcategories' pages.
  const subCounts = new Map(Object.entries(facets?.categories ?? {}));
  // Property: renters and buyers each get their own side of the page.
  const saleOrRent = Boolean(selectedCategory?.saleOrRent);
  const side =
    saleOrRent && filters.specs.listing_type?.length === 1 ? filters.specs.listing_type[0] : undefined;
  const pickSide = (value?: string) => {
    const specs = { ...filters.specs };
    if (value) specs.listing_type = [value];
    else delete specs.listing_type;
    applyPatch({ specs });
  };
  const title = filters.q
    ? `“${filters.q}”`
    : (categoryName ?? (filters.category ? filters.category.replace(/-/g, " ") : "All listings")) +
      (side === "rent" ? " for rent" : side === "sale" ? " for sale" : "");
  const activeCount = activeFilterCount(filters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const chips: { label: string; clear: () => void }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, clear: () => applyPatch({ q: undefined }) });
  // Inside a group the switcher already shows (and changes) the category.
  if (categoryName && !group)
    chips.push({ label: categoryName, clear: () => applyPatch({ category: undefined }) });
  if (filters.minPrice !== undefined)
    chips.push({ label: `From ETB ${filters.minPrice.toLocaleString("en-US")}`, clear: () => applyPatch({ minPrice: undefined }) });
  if (filters.maxPrice !== undefined)
    chips.push({ label: `Up to ETB ${filters.maxPrice.toLocaleString("en-US")}`, clear: () => applyPatch({ maxPrice: undefined }) });
  if (filters.freshness)
    chips.push({
      label: FRESHNESS_OPTIONS.find((o) => o.value === filters.freshness)?.label ?? "Confirmed stock",
      clear: () => applyPatch({ freshness: undefined }),
    });
  if (filters.verifiedOnly) chips.push({ label: "Verified only", clear: () => applyPatch({ verifiedOnly: undefined }) });
  for (const brand of filters.brands)
    chips.push({ label: brand, clear: () => applyPatch({ brands: filters.brands.filter((b) => b !== brand) }) });
  for (const condition of filters.conditions)
    chips.push({
      label: CONDITION_OPTIONS.find((o) => o.value === condition)?.label ?? condition,
      clear: () => applyPatch({ conditions: filters.conditions.filter((c) => c !== condition) }),
    });
  // Spec filters read as "Fuel: Diesel" and "Year: 2015–2020", with the
  // schema's labels; before it loads, the raw key and value.
  const fieldOf = (key: string) => schema?.fields.find((f) => f.key === key);
  for (const [key, values] of Object.entries(filters.specs)) {
    // The rent / sale switch shows that one itself.
    if (saleOrRent && key === "listing_type") continue;
    const field = fieldOf(key);
    for (const value of values)
      chips.push({
        label: `${field?.label ?? key}: ${field?.options?.find((o) => o.value === value)?.label ?? value}`,
        clear: () => {
          const rest = values.filter((v) => v !== value);
          const specs = { ...filters.specs, [key]: rest };
          if (!rest.length) delete specs[key];
          applyPatch({ specs });
        },
      });
  }
  for (const [key, range] of Object.entries(filters.ranges)) {
    const field = fieldOf(key);
    const unit = field?.unit ? ` ${field.unit}` : "";
    const n = (v: number) => formatSpecNumber(v, field?.unit);
    const text =
      range.min !== undefined && range.max !== undefined
        ? `${n(range.min)}–${n(range.max)}`
        : range.min !== undefined
          ? `${n(range.min)}+`
          : `up to ${n(range.max ?? 0)}`;
    chips.push({
      label: `${field?.label ?? key}: ${text}${unit}`,
      clear: () => {
        const ranges = { ...filters.ranges };
        delete ranges[key];
        applyPatch({ ranges });
      },
    });
  }
  if (filters.sort !== "newest")
    chips.push({
      label: SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? "Sort",
      clear: () => applyPatch({ sort: "newest" }),
    });

  return (
    <div>
      {/* ── hero band ─────────────────────────────────────── */}
      <div className="border-b border-tn-hair2 bg-[radial-gradient(120%_100%_at_90%_-20%,#FFF1EB_0%,rgba(255,241,235,0)_50%)]">
        <div className="mx-auto max-w-[1480px] px-6 pt-6 pb-7 sm:px-8 lg:px-12 xl:px-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-[7px] text-[12.5px] font-semibold">
            <Link href="/" className="text-tn-mute">Home</Link>
            <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
            <Link href="/products" className="text-tn-mute">Browse</Link>
            {selectedCategory?.parentSlug && (
              <>
                <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
                <Link
                  href={`/products?category=${selectedCategory.parentSlug}`}
                  className="text-tn-mute"
                >
                  {selectedCategory.parentName}
                </Link>
              </>
            )}
            {filters.category && (
              <>
                <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
                <span className="text-tn-ink">{categoryName ?? filters.category}</span>
              </>
            )}
          </nav>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-tn-ink text-[32px] leading-none font-extrabold tracking-[-0.035em] sm:text-[46px]">
                {title}
              </h1>
              {!loading && (
                <p className="text-tn-mute mt-2.5 text-[15px] font-medium">
                  <b className="font-tn-mono text-tn-ink font-semibold">
                    {total.toLocaleString("en-US")}
                  </b>{" "}
                  listings
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sort */}
              <SortSelect value={filters.sort} onChange={(sort) => applyPatch({ sort })} />

              {/* Grid / list toggle */}
              <div className="flex rounded-full border border-tn-hair bg-white p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={view === "grid" ? "bg-tn-ink text-white" : "text-tn-mute"}
                  style={{ width: 38, height: 36, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Icon name="spec" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={view === "list" ? "bg-tn-ink text-white" : "text-tn-mute"}
                  style={{ width: 38, height: 36, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Icon name="menu" size={16} />
                </button>
              </div>

              {/* Filters (mobile) */}
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-tn-hair bg-white px-4 text-[13.5px] font-bold text-tn-ink lg:hidden"
              >
                <Icon name="sliders" size={15} className="text-tn-ink2" />
                Filters
                {activeCount > 0 && (
                  <span className="bg-tn-red inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-extrabold text-white">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* property: rent or buy first, as renters and buyers never mix */}
          {saleOrRent && (
            <div className="mt-5">
              <div
                role="radiogroup"
                aria-label="For rent or for sale"
                className="inline-flex rounded-full border border-tn-hair bg-white p-1"
              >
                {[
                  { value: undefined, label: "All" },
                  { value: "rent", label: "For rent" },
                  { value: "sale", label: "For sale" },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    role="radio"
                    aria-checked={side === o.value}
                    onClick={() => side !== o.value && pickSide(o.value)}
                    className={cn(
                      "h-10 rounded-full px-5 text-[14px] font-bold transition-colors",
                      side === o.value ? "bg-tn-ink text-white" : "text-tn-ink2 hover:text-tn-ink",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {!side && filters.sort.startsWith("price") && (
                <p className="text-tn-mute mt-2.5 text-[13px]">
                  Monthly rents and sale prices are mixed here: pick For rent or For sale to compare
                  prices.
                </p>
              )}
            </div>
          )}

          {/* the group's subcategories: switch between them in one click */}
          {group && groupChildren.length > 0 && (
            <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
              {[{ slug: group.slug, name: `All ${group.name}` }, ...groupChildren].map((c) => {
                const isCurrent = c.slug === filters.category;
                const count = c.slug === group.slug ? undefined : subCounts.get(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={isCurrent}
                    onClick={() => !isCurrent && applyPatch({ category: c.slug })}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13.5px] font-bold transition-colors",
                      isCurrent
                        ? "border-tn-ink bg-tn-ink text-white"
                        : "border-tn-hair text-tn-ink hover:border-tn-ink bg-white",
                    )}
                  >
                    {c.name}
                    {count !== undefined && (
                      <span
                        className={cn(
                          "font-tn-mono text-[11.5px] font-medium",
                          isCurrent ? "text-white/70" : "text-tn-mute",
                        )}
                      >
                        {formatCount(count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* active filters */}
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-tn-mute text-[12.5px] font-semibold">Active:</span>
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="bg-tn-red-soft text-tn-red-dark inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold"
                >
                  {chip.label}
                  <button
                    type="button"
                    aria-label={`Remove ${chip.label}`}
                    onClick={chip.clear}
                    className="opacity-60 transition-opacity hover:opacity-100"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="text-tn-red cursor-pointer bg-transparent text-[12.5px] font-bold"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── body: rail + results ──────────────────────────── */}
      <div className="mx-auto flex max-w-[1480px] items-start gap-7 px-6 py-7 sm:px-8 lg:gap-8 lg:px-12 xl:px-16">
        <FilterRail
          filters={filters}
          categories={categories}
          products={products}
          bounds={bounds}
          schema={schema}
          facets={facets}
          onChange={(patch) => applyPatch(patch)}
          onReset={clearAll}
        />

        <div className="min-w-0 flex-1">
          {error && !loading ? (
            <ErrorState onRetry={retry} />
          ) : !loading && products.length === 0 ? (
            <EmptyState onClear={clearAll} hasFilters={activeCount > 0} />
          ) : (
            <ProductGrid
              products={products}
              total={total}
              loading={loading}
              loadingMore={loadingMore}
              error={error}
              loadMoreError={loadMoreError}
              hasMore={hasMore}
              view={view}
              onLoadMore={loadMore}
              onRetry={retry}
              onRetryLoadMore={retryLoadMore}
            />
          )}
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        categories={categories}
        products={products}
        bounds={bounds}
        schema={schema}
        facets={facets}
        onApply={(draft) => navigate(filtersToSearchParams({ ...draft, page: undefined }), "push")}
        resultCount={total}
      />

      <BackToTop />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="border-tn-hair rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="bg-tn-red-soft text-tn-red mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
        <Icon name="pulse" size={26} />
      </span>
      <h2 className="text-tn-ink text-lg font-extrabold">Couldn&rsquo;t reach the marketplace</h2>
      <p className="text-tn-mute mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        The listings service isn&rsquo;t responding right now. This is usually temporary — try again
        in a moment.
      </p>
      <div className="mt-6 flex justify-center">
        <Pill kind="outline" size="md" onClick={onRetry}>
          Try again
        </Pill>
      </div>
    </div>
  );
}

function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div className="border-tn-hair rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="bg-tn-paper text-tn-mute mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
        <Icon name="search" size={26} />
      </span>
      <h2 className="text-tn-ink text-lg font-extrabold">No listings found</h2>
      <p className="text-tn-mute mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        {hasFilters
          ? "Try a broader search, or remove some filters to see more of what verified shops have listed."
          : "Listings appear as soon as verified shops publish their stock."}
      </p>
      {hasFilters && (
        <div className="mt-6 flex justify-center">
          <Pill kind="solid" size="md" iconAfter="arrow" onClick={onClear}>
            Clear filters
          </Pill>
        </div>
      )}
    </div>
  );
}
