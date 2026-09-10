import type { ProductQuery } from "./api";

// Single source of truth for the /products search & filter state.
// Every value round-trips through the URL so results are shareable, linkable,
// and survive refresh / back-button. Matches design_handoff_search/README.md.

export type SortKey = "newest" | "oldest" | "price-asc" | "price-desc";

/** The stock-freshness threshold a buyer can pick (single-select, nested). */
export type FreshnessKey = "today" | "12h" | "24h";

export const FRESHNESS_OPTIONS: { value: FreshnessKey; label: string }[] = [
  { value: "today", label: "Confirmed today" },
  { value: "12h", label: "Within 12 hrs" },
  { value: "24h", label: "Within 24 hrs" },
];

const FRESHNESS_KEYS: FreshnessKey[] = FRESHNESS_OPTIONS.map((o) => o.value);

export type SearchFilters = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  /**
   * "Confirmed stock" threshold — backend `fresh=true` (confirmed within 48h).
   * Single-select: pick one window, or none.
   */
  freshness?: FreshnessKey;
  /**
   * Demo facets (design's Brand / Condition / Neighborhood groups). The backend
   * doesn't filter on these yet — toggling them re-queries and round-trips the
   * URL, but results only change once a facets endpoint lands (TIN-16/18).
   */
  brands: string[];
  conditions: string[];
  neighborhoods: string[];
  sort: SortKey;
  /** 1-based page. Reset to 1 whenever a non-page filter changes. */
  page?: number;
};

export const DEFAULT_FILTERS: SearchFilters = {
  sort: "newest",
  brands: [],
  conditions: [],
  neighborhoods: [],
};

const SORT_TO_ORDERING: Record<SortKey, string | undefined> = {
  newest: "-created_at",
  oldest: "created_at",
  "price-asc": "price",
  "price-desc": "-price",
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const SORT_KEYS: SortKey[] = SORT_OPTIONS.map((o) => o.value);

export function filtersToSearchParams(f: SearchFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("category", f.category);
  if (f.minPrice !== undefined) p.set("min_price", String(f.minPrice));
  if (f.maxPrice !== undefined) p.set("max_price", String(f.maxPrice));
  if (f.verifiedOnly) p.set("verified_only", "1");
  if (f.freshness) {
    p.set("fresh", "true");
    // Frontend-only: remembers which window was chosen (backend only knows
    // "confirmed recently", so this doesn't affect results).
    p.set("freshness_window", f.freshness);
  }
  if (f.page && f.page > 1) p.set("page", String(f.page));
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  if (f.brands?.length) p.set("brand", f.brands.join(","));
  if (f.conditions?.length) p.set("condition", f.conditions.join(","));
  if (f.neighborhoods?.length) p.set("neighborhood", f.neighborhoods.join(","));
  return p;
}

function parseNum(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parseList(v: string | null): string[] {
  return v ? v.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

export function filtersFromSearchParams(params: URLSearchParams): SearchFilters {
  const sort = params.get("sort");
  const freshnessParam = params.get("freshness_window");
  const freshness = (FRESHNESS_KEYS as string[]).includes(freshnessParam ?? "")
    ? (freshnessParam as FreshnessKey)
    : // Plain links: `fresh=true` defaults to the coarsest window.
      params.get("fresh") === "true" || params.get("fresh") === "1"
      ? "today"
      : undefined;
  return {
    q: params.get("q")?.trim() || undefined,
    category: params.get("category") || undefined,
    minPrice: parseNum(params.get("min_price")),
    maxPrice: parseNum(params.get("max_price")),
    verifiedOnly: params.get("verified_only") === "1",
    freshness,
    brands: parseList(params.get("brand")),
    conditions: parseList(params.get("condition")),
    neighborhoods: parseList(params.get("neighborhood")),
    sort: (SORT_KEYS as string[]).includes(sort ?? "") ? (sort as SortKey) : "newest",
    page: parseNum(params.get("page")) || 1,
  };
}

/** The API query for a filter set (page included — applied by the data hook). */
export function filtersToProductQuery(f: SearchFilters): ProductQuery {
  return {
    q: f.q,
    category: f.category,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    verifiedOnly: f.verifiedOnly,
    freshOnly: f.freshness !== undefined,
    // Demo facets: sent to the API for forward-compat; the backend ignores them
    // until the facets endpoint exists.
    brand: f.brands.length ? f.brands.join(",") : undefined,
    condition: f.conditions.length ? f.conditions.join(",") : undefined,
    neighborhood: f.neighborhoods.length ? f.neighborhoods.join(",") : undefined,
    ordering: SORT_TO_ORDERING[f.sort],
    page: f.page && f.page > 1 ? f.page : undefined,
  };
}

/** Stable string key used to detect changes (refetches the result list). */
export function filtersKey(f: SearchFilters): string {
  return filtersToSearchParams({ ...f, page: undefined }).toString();
}

/** Number of applied facets, excluding page (used for the mobile filter badge). */
export function activeFilterCount(f: SearchFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.category) n++;
  if (f.minPrice !== undefined) n++;
  if (f.maxPrice !== undefined) n++;
  if (f.verifiedOnly) n++;
  if (f.freshness) n++;
  if (f.brands?.length) n++;
  if (f.conditions?.length) n++;
  if (f.neighborhoods?.length) n++;
  if (f.sort !== "newest") n++;
  return n;
}
