// Public catalogue reads — no authentication, safe on the server and in the
// browser alike.
//
// The API client is split by trust boundary, and each file only does one kind
// of call:
//   public.ts  (this file)  anonymous reads of Django, from anywhere
//   server.ts               reads *as the signed-in user*, Server Components only
//   client.ts               the browser's mutations, via same-origin /api routes
// Nothing here ever takes a token, which is what keeps a JWT from being
// threaded into a Client Component again.
import type { Category, Paginated, Product, Shop, ShopMetrics } from "../types";
import { API_URL } from "../config";
import { normalizeImageUrl } from "../format";
import { fromApiSchema, type ApiCategorySchema, type CategorySchema } from "../specs/schema";

/** Catalog routes live under /api/v1/catalog/ (config/urls.py). */
const CATALOG = `${API_URL}/api/v1/catalog`;

/**
 * Tag on every cached catalogue read. Any successful merchant mutation
 * expires it (lib/auth/django-proxy), so a shop sees its own edits at once.
 */
export const CATALOG_TAG = "catalog";

/**
 * How long server-side reads may be served from Next's data cache.
 *
 * Stock is confirmed daily, so a minute of staleness on listings is invisible
 * to buyers while collapsing a traffic spike into one Django query per URL
 * per minute. Free-text searches are never cached: every distinct query would
 * be a new cache entry, and they are the least repeated URLs anyway.
 */
export const REVALIDATE = {
  listings: 60,
  shops: 300,
  categories: 3600,
  stats: 3600,
} as const;

/** Server reads give up after this; the auth driver uses the same bound. */
const SERVER_TIMEOUT_MS = 8_000;

export class ApiError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type CachePolicy = number | "no-store";

/**
 * Cache and timeout options for one read.
 *
 * Browser fetches get neither: `next` means nothing there, and the caller
 * (useProducts and friends) owns cancellation through its own signal.
 */
function readInit(policy: CachePolicy, init?: RequestInit): RequestInit {
  if (typeof window !== "undefined") return { ...init };
  // An explicit `cache` from the caller (e.g. the dashboard's editor wanting
  // what Django has right now) replaces the policy rather than conflicting.
  const cache: RequestInit =
    policy === "no-store" || init?.cache
      ? { cache: init?.cache ?? "no-store" }
      : { next: { revalidate: policy, tags: [CATALOG_TAG] } };
  return { ...cache, signal: AbortSignal.timeout(SERVER_TIMEOUT_MS), ...init };
}

export async function getHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch(`${API_URL}/api/health/`, readInit("no-store"));
  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`);
  }
  return res.json();
}

/** Query params accepted by ProductViewSet (catalog/views.py). */
export type ProductQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  ordering?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  /** Backend-defined: only products confirmed within the 48h freshness window. */
  freshOnly?: boolean;
  /**
   * PLACEHOLDER: demo facets — sent for forward-compat, but the backend ignores
   * them, so the filters look applied while results do not change.
   */
  brand?: string;
  condition?: string;
  neighborhood?: string;
};

function productSearchParams(query: ProductQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.pageSize) params.set("page_size", String(query.pageSize));
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.ordering) params.set("ordering", query.ordering);
  if (query.minPrice !== undefined) params.set("min_price", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("max_price", String(query.maxPrice));
  if (query.verifiedOnly) params.set("verified_only", "1");
  if (query.freshOnly) params.set("fresh", "true");
  if (query.brand) params.set("brand", query.brand);
  if (query.condition) params.set("condition", query.condition);
  if (query.neighborhood) params.set("neighborhood", query.neighborhood);
  return params;
}

function normalizeProduct(product: Product): Product {
  if (!product.images || !Array.isArray(product.images)) return product;
  return {
    ...product,
    images: product.images.map((img) => ({
      ...img,
      url: normalizeImageUrl(img.url) ?? img.url,
    })),
  };
}

export async function getProducts(
  query: ProductQuery = {},
  init?: RequestInit,
): Promise<Paginated<Product>> {
  const params = productSearchParams(query);
  const qs = params.toString();
  const res = await fetch(
    `${CATALOG}/products/${qs ? `?${qs}` : ""}`,
    readInit(query.q ? "no-store" : REVALIDATE.listings, init),
  );
  if (!res.ok) {
    // DRF returns 404 when `page` exceeds the total number of pages:
    // {"detail": "Invalid page."}. In paginated feeds, treating a page > 1 404
    // as an empty page prevents error banners when simply reaching the end.
    if (res.status === 404 && query.page && query.page > 1) {
      return { count: 0, next: null, previous: null, results: [] };
    }
    throw new Error(`Could not load products (${res.status})`);
  }
  const data = (await res.json()) as Paginated<Product>;
  return {
    ...data,
    results: data.results.map(normalizeProduct),
  };
}

/**
 * Up to four listings like `slug`, ranked by Django (catalog/views.py
 * SimilarProductsView: same shop, freshness, recency). One query, where the
 * tiered client-side engine in lib/suggestions needs up to four.
 */
export async function getSimilarProducts(slug: string): Promise<Product[]> {
  const res = await fetch(
    `${CATALOG}/similar/${encodeURIComponent(slug)}/`,
    readInit(REVALIDATE.listings),
  );
  if (!res.ok) {
    throw new Error(`Could not load similar products (${res.status})`);
  }
  const data = (await res.json()) as Paginated<Product> | Product[];
  const results = Array.isArray(data) ? data : data.results;
  return results.map(normalizeProduct);
}

/**
 * Total registered shops.
 *
 * NOTE: this is *all* shops, not just verified ones — ShopViewSet exposes no
 * `is_verified` filter (shops/views.py), so a verified-only count isn't
 * available without a backend change. Label the result accordingly.
 */
export async function getShopCount(init?: RequestInit): Promise<number> {
  // `count` is all we need, so ask for the smallest possible page.
  const res = await fetch(
    `${API_URL}/api/v1/shops/?page_size=1`,
    readInit(REVALIDATE.shops, init),
  );
  if (!res.ok) {
    throw new Error(`Could not load shops (${res.status})`);
  }
  const data = (await res.json()) as Paginated<Shop>;
  return data.count;
}

export async function getCategories(init?: RequestInit): Promise<Paginated<Category>> {
  const res = await fetch(`${CATALOG}/categories/`, readInit(REVALIDATE.categories, init));
  if (!res.ok) {
    throw new Error(`Could not load categories (${res.status})`);
  }
  return res.json();
}

/**
 * The spec schema a category's listings follow (catalog/specs.py), or null when
 * the category has no product type yet -- the form then shows no spec fields.
 */
export async function getCategorySchema(
  slug: string,
  init?: RequestInit,
): Promise<CategorySchema | null> {
  const res = await fetch(
    `${CATALOG}/categories/${encodeURIComponent(slug)}/schema/`,
    readInit(REVALIDATE.categories, init),
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Could not load the spec schema (${res.status})`);
  }
  return fromApiSchema((await res.json()) as ApiCategorySchema);
}

export type ShopQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  city?: string;
  verifiedOnly?: boolean;
  ordering?: string;
};

export async function getShops(query?: ShopQuery, init?: RequestInit): Promise<Paginated<Shop>> {
  const params = new URLSearchParams();
  if (query?.page && query.page > 1) params.set("page", String(query.page));
  if (query?.pageSize) params.set("page_size", String(query.pageSize));
  if (query?.q) params.set("q", query.q);
  if (query?.city) params.set("city", query.city);
  if (query?.verifiedOnly !== undefined) params.set("verified_only", query.verifiedOnly ? "1" : "0");
  if (query?.ordering) params.set("ordering", query.ordering);

  const qs = params.toString();
  const url = `${API_URL}/api/v1/shops/${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, readInit(query?.q ? "no-store" : REVALIDATE.shops, init));
  if (!res.ok) {
    throw new Error(`Couldn't load shops (${res.status})`);
  }
  return res.json();
}

export async function getPublicStats(init?: RequestInit): Promise<ShopMetrics> {
  const res = await fetch(`${CATALOG}/public-stats/`, readInit(REVALIDATE.stats, init));
  if (!res.ok) {
    throw new Error(`Couldn't load public stats (${res.status})`);
  }
  return res.json();
}

/**
 * Single listing detail — ProductViewSet looks products up by `slug`
 * (catalog/views.py: lookup_field = "slug").
 */
export async function getProduct(slug: string, init?: RequestInit): Promise<Product> {
  const res = await fetch(
    `${CATALOG}/products/${encodeURIComponent(slug)}/`,
    readInit(REVALIDATE.listings, init),
  );
  if (!res.ok) {
    throw new Error(`Could not load product (${res.status})`);
  }
  const data = (await res.json()) as Product;
  return normalizeProduct(data);
}

export async function getShop(slug: string, init?: RequestInit): Promise<Shop> {
  const res = await fetch(
    `${API_URL}/api/v1/shops/${encodeURIComponent(slug)}/`,
    readInit(REVALIDATE.shops, init),
  );
  if (!res.ok) {
    throw new Error(`Could not load shop (${res.status})`);
  }
  return res.json();
}

export type ShopProductQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  ordering?: string;
  status?: string;
  fresh?: string;
};

export function shopProductSearchParams(query: ShopProductQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.pageSize) params.set("page_size", String(query.pageSize));
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.ordering) params.set("ordering", query.ordering);
  if (query.status) params.set("status", query.status);
  if (query.fresh) params.set("fresh", query.fresh);
  return params;
}

export async function getPublicShopProducts(
  slug: string,
  query: ShopProductQuery = {},
  init?: RequestInit,
): Promise<Paginated<Product>> {
  const params = shopProductSearchParams(query).toString();
  const res = await fetch(
    `${API_URL}/api/v1/shop/${encodeURIComponent(slug)}/products/${params ? `?${params}` : ""}`,
    readInit(query.q ? "no-store" : REVALIDATE.listings, init),
  );
  if (!res.ok) {
    if (res.status === 404 && query.page && query.page > 1) {
      return { count: 0, next: null, previous: null, results: [] };
    }
    throw new Error(`Could not load public shop products (${res.status})`);
  }
  const data = (await res.json()) as Paginated<Product>;
  return {
    ...data,
    results: data.results.map(normalizeProduct),
  };
}
