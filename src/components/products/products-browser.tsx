"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { ProductGrid } from "./product-grid";
import { FilterRail } from "./filter-rail";
import { FilterSheet } from "./filter-sheet";
import { SortSelect } from "./sort-select";
import { BackToTop } from "./back-to-top";
import { useProducts, type InitialProducts } from "@/hooks/use-products";
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  filtersToProductQuery,
  filtersToSearchParams,
  FRESHNESS_OPTIONS,
  SORT_OPTIONS,
  type SearchFilters,
} from "@/lib/filters";

export function ProductsBrowser({
  categories,
  initial,
  priceBounds,
}: {
  categories: { slug: string; name: string }[];
  initial: InitialProducts;
  priceBounds?: { min: number; max: number };
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
    const next = { ...current, ...patch };
    next.page = undefined; // any filter change resets infinite scroll
    navigate(filtersToSearchParams(next), "push");
  }

  function clearAll() {
    navigate(filtersToSearchParams(DEFAULT_FILTERS), "push");
  }

  // ── derived labels ───────────────────────────────────────
  const categoryName = categories.find((c) => c.slug === filters.category)?.name;
  const title = filters.q
    ? `“${filters.q}”`
    : categoryName ?? (filters.category ? filters.category.replace(/-/g, " ") : "All listings");
  const activeCount = activeFilterCount(filters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const chips: { label: string; clear: () => void }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, clear: () => applyPatch({ q: undefined }) });
  if (categoryName) chips.push({ label: categoryName, clear: () => applyPatch({ category: undefined }) });
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
          bounds={priceBounds}
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
        bounds={priceBounds}
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
