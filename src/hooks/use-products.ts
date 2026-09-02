"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts, getShopProducts, ShopProductQuery, type ProductQuery } from "@/lib/api";
import type { Product, ShopProduct } from "@/lib/types";
import { PRODUCTS_PAGE_SIZE } from "@/components/products/product-grid";

export type InitialProducts = { products: Product[]; total: number } | null;

/**
 * Owns the product list for /products.
 *
 * - Uses the server-rendered `initial` list on first mount.
 * - Re-fetches whenever `query` changes (filters / sort / page — the URL is the
 *   single source of truth).
 */
export function useProducts(query: ProductQuery, initial: InitialProducts) {
  const [products, setProducts] = useState<Product[]>(initial?.products ?? []);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(query.page ?? 1);

  const queryKey = JSON.stringify(query);
  // The query the currently displayed list was loaded for. Initialized to the
  // first-render query, which matches the server-rendered `initial` list, so we
  // refetch only when the query actually changes — not on the first mount or on
  // StrictMode's simulated remount (refs survive it, so this stays in sync).
  const loadedKey = useRef(queryKey);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({ ...query, pageSize: PRODUCTS_PAGE_SIZE });
      setTotal(data.count);
      setProducts(data.results);
      setPage(query.page ?? 1);
    } catch {
      setError("Couldn't load listings. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Refetch whenever the query changes.
  useEffect(() => {
    if (loadedKey.current === queryKey) return;
    loadedKey.current = queryKey;
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const retry = useCallback(() => fetchPage(), [fetchPage]);

  return { products, total, loading, error, page, retry };
}


/**
 * Owns the merchant's own catalogue for the dashboard.
 *
 * Takes no access token: `getShopProducts` calls a same-origin route handler
 * that attaches the Authorization header server-side (see lib/auth/authed-fetch).
 *
 * Unlike `useProducts` there is no server-rendered `initial` list to fall back
 * on, so this must fetch on mount as well as on every query change — seeding
 * `loadedKey` with the first query key, as the sibling hook does, meant the
 * mount effect returned early and the table stayed empty until the user touched
 * a filter.
 */
export function useShopProducts(query: ShopProductQuery, slug: string) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = JSON.stringify(query);
  const loadedKey = useRef<string | null>(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShopProducts(slug, query);
      setTotal(data.count);
      setProducts(data.results);
    } catch {
      setError("Couldn't load listings. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [query, slug]);

  // Fetches on mount, then whenever the query changes. The ref survives
  // StrictMode's simulated remount, so this is one request either way.
  useEffect(() => {
    if (loadedKey.current === queryKey) return;
    loadedKey.current = queryKey;
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { products, total, loading, error };
}