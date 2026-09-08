// Central place for talking to the backend API.
// The base URL comes from the environment so it can change per environment.
import type { Category, Paginated, Product, Shop, ShopProduct } from "./types";
import { normalizeImageUrl } from "./format";

// Dual-context base URL:
//  - Server components (SSR, inside the dev container) reach the host backend
//    via API_INTERNAL_URL (host.docker.internal) when set.
//  - Client components (the browser, on the user's machine) use the public URL
//    from NEXT_PUBLIC_API_URL, which is inlined at build time.
const API_URL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:8000")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

/** Catalog routes live under /api/v1/catalog/ (config/urls.py). */
const CATALOG = `${API_URL}/api/v1/catalog`;

export async function getHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch(`${API_URL}/api/health/`, { cache: "no-store" });
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
  /** Backend-defined: only products confirmed within the last 30 days. */
  freshOnly?: boolean;
  /** Demo facets — sent for forward-compat; the backend ignores them for now. */
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
  if (query.freshOnly) params.set("freshness", "1");
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
  const res = await fetch(`${CATALOG}/products/${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
    ...init,
  });
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

export async function getSimilarProducts(slug:string): Promise<Paginated<Product>> {
  const res = await fetch(`${CATALOG}/similar/${encodeURIComponent(slug)}/`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Could not load similar products (${res.status})`);
  }
  return res.json();
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
  const res = await fetch(`${API_URL}/api/v1/shops/?page_size=1`, {
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Could not load shops (${res.status})`);
  }
  const data = (await res.json()) as Paginated<Shop>;
  return data.count;
}

export async function getCategories(init?: RequestInit): Promise<Paginated<Category>> {
  const res = await fetch(`${CATALOG}/categories/`, { cache: "no-store", ...init });
  if (!res.ok) {
    throw new Error(`Could not load categories (${res.status})`);
  }
  return res.json();
}

/**
 * Single listing detail — ProductViewSet looks products up by `slug`
 * (catalog/views.py: lookup_field = "slug").
 */
export async function getProduct(slug: string, init?: RequestInit): Promise<Product> {
  const res = await fetch(`${CATALOG}/products/${encodeURIComponent(slug)}/`, {
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Could not load product (${res.status})`);
  }
  const data = (await res.json()) as Product;
  return normalizeProduct(data);
}

export async function getShop(slug: string): Promise<Shop> {
  const res = await fetch(`${API_URL}/api/v1/shops/${encodeURIComponent(slug)}/`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Could not load shop (${res.status})`);
  }
  return res.json();
}

export async function getPublicShopProducts(slug: string, query: ShopProductQuery): Promise<Paginated<Product>> {
  const params = ShopProductSearchParams(query).toString();
  const res = await fetch(
    `${API_URL}/api/v1/shop/${encodeURIComponent(slug)}/products/${params ? `?${params}` : ""}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Could not load public shop products (${res.status})`);
  }
  return res.json();
}

export type ShopProductQuery = {
  q?: string;
  category?: string;
  ordering?: string;
  status?: string;
}

function ShopProductSearchParams(query: ShopProductQuery): URLSearchParams{
  const params = new URLSearchParams()
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.ordering) params.set("ordering", query.ordering);
  if (query.status) params.set("status", query.status);
  return params;
}

/**
 * The signed-in shop's own catalogue.
 *
 * Browser-only, and deliberately takes no token: it calls the same-origin route
 * handler at /api/shop/<slug>/products, which reads the httpOnly session cookie
 * and attaches the Authorization header server-side. The JWT never enters the
 * client bundle, a component prop, or the RSC payload.
 */
export async function getShopProducts(
  slug: string,
  query: ShopProductQuery,
  init?: RequestInit,
): Promise<Paginated<ShopProduct>> {
  const params = ShopProductSearchParams(query).toString();
  const res = await fetch(
    `/api/shop/${encodeURIComponent(slug)}/products${params ? `?${params}` : ""}`,
    { method: "GET", cache: "no-store", ...init },
  );
  if (!res.ok) {
    throw new Error(`Couldn't load products (${res.status})`);
  }
  return res.json();
}