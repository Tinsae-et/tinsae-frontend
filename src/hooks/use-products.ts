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


export function useShopProducts(query: ShopProductQuery, slug: string, access: string | undefined){
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryKey = JSON.stringify(query);
  const loadedKey = useRef(queryKey);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShopProducts(slug, query, access);
      setTotal(data.count);
      setProducts(data.results);
    } catch {
      setError("Couldn't load listings. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [query, slug, access]);

  // Refetch whenever the query changes.
  useEffect(() => {
    if (loadedKey.current === queryKey) return;
    loadedKey.current = queryKey;
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { products, total, loading, error };  
}