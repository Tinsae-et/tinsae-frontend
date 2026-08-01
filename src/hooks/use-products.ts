"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts, type ProductQuery } from "@/lib/api";
import type { Product } from "@/lib/types";
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
  const mounted = useRef(false);

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

  // Refetch whenever the query changes (skip the first mount, which already has
  // the server-rendered initial list).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const retry = useCallback(() => fetchPage(), [fetchPage]);

  return { products, total, loading, error, page, retry };
}
