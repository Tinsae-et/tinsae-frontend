"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts, getPublicShopProducts, getShopProducts, ShopProductQuery, type ProductQuery } from "@/lib/api";
import type { Paginated, Product, ShopProduct } from "@/lib/types";
import { PRODUCTS_PAGE_SIZE } from "@/components/products/product-grid";

export type InitialProducts = { products: Product[]; total: number } | null;

/**
 * Owns the product list for /products.
 *
 * - Uses the server-rendered `initial` list on first mount.
 * - Starts a fresh list whenever the filters or sort change; the URL remains the
 *   single source of truth for those.
 * - Appends further pages through `loadMore`. The page cursor lives here, not in
 *   the URL, so a filter change always restarts from page 1.
 */
export function useProducts(query: ProductQuery, initial: InitialProducts) {
  // `page` is the infinite-scroll cursor, owned here rather than by the URL, so
  // it is kept out of the key that decides when to start a brand new list.
  const filterQuery: ProductQuery = { ...query, page: undefined };
  const filterKey = JSON.stringify(filterQuery);

  const [products, setProducts] = useState<Product[]>(initial?.products ?? []);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initial ? initial.products.length < initial.total : true,
  );

  // The query the currently displayed list was loaded for.
  const loadedKey = useRef<string>(initial ? filterKey : "");
  const firstPageRef = useRef<AbortController | null>(null);
  const loadMoreRef = useRef<AbortController | null>(null);
  const isFetchingMoreRef = useRef(false);

  // Latest filters, read through a ref so `loadMore` does not take the query
  // object as a dependency. Spreading `query` produces a new object every
  // render, which would churn `loadMore`'s identity and make the caller tear
  // down and rebuild its IntersectionObserver on every single render.
  const filterQueryRef = useRef(filterQuery);
  // Synced in an effect, not during render. Declared before the fetch effect
  // below so it is already up to date by the time that one runs.
  useEffect(() => {
    filterQueryRef.current = filterQuery;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Ids already on screen. Kept in a ref so de-duplication happens before
  // setState rather than inside the updater — updater functions must stay pure.
  const seenIdsRef = useRef<Set<number>>(
    new Set(initial?.products.map((p) => p.id) ?? []),
  );

  // Appends that produced nothing new, back to back. Two in a row means the
  // sentinel stays on screen with no new content under it, which would spin the
  // observer through pages; stop auto-loading instead.
  const emptyStreak = useRef(0);

  const fetchFirstPage = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    emptyStreak.current = 0;
    try {
      const data = await getProducts(
        { ...filterQueryRef.current, page: 1, pageSize: PRODUCTS_PAGE_SIZE },
        { signal },
      );
      if (signal?.aborted) return;
      seenIdsRef.current = new Set(data.results.map((p) => p.id));
      setTotal(data.count);
      setProducts(data.results);
      setPage(1);
      setHasMore(Boolean(data.next) && data.results.length > 0);
    } catch {
      if (signal?.aborted) return;
      setError("Couldn't load listings. Check your connection and try again.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Refetch whenever the filters or sorting change.
  useEffect(() => {
    if (loadedKey.current === filterKey) return;
    loadedKey.current = filterKey;

    // Abandon everything belonging to the previous filters — including a
    // load-more already in flight, whose page would otherwise be appended
    // underneath the new list with the wrong total and page cursor.
    firstPageRef.current?.abort();
    loadMoreRef.current?.abort();
    loadMoreRef.current = null;
    isFetchingMoreRef.current = false;
    setLoadingMore(false);
    setLoadMoreError(null);

    const controller = new AbortController();
    firstPageRef.current = controller;

    fetchFirstPage(controller.signal);
    return () => {
      controller.abort();
    };
  }, [filterKey, fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || isFetchingMoreRef.current || !hasMore) return;
    isFetchingMoreRef.current = true;

    const controller = new AbortController();
    loadMoreRef.current = controller;
    const { signal } = controller;

    setLoadingMore(true);
    setLoadMoreError(null);

    const nextPage = page + 1;
    try {
      const data = await getProducts(
        { ...filterQueryRef.current, page: nextPage, pageSize: PRODUCTS_PAGE_SIZE },
        { signal },
      );
      if (signal.aborted) return;

      const fresh = data.results.filter((p) => !seenIdsRef.current.has(p.id));
      for (const p of fresh) seenIdsRef.current.add(p.id);
      if (fresh.length > 0) {
        setProducts((prev) => [...prev, ...fresh]);
      }

      emptyStreak.current = fresh.length === 0 ? emptyStreak.current + 1 : 0;

      setTotal(data.count);
      setPage(nextPage);
      setHasMore(
        Boolean(data.next) && data.results.length > 0 && emptyStreak.current < 4,
      );
    } catch {
      if (signal.aborted) return;
      setLoadMoreError("Couldn't load more listings. Tap to retry.");
    } finally {
      // Only the request that is still current may clear the flag: a newer
      // load-more, or a filter change, has already taken ownership of it.
      if (loadMoreRef.current === controller) {
        loadMoreRef.current = null;
        isFetchingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [hasMore, loading, loadingMore, page]);

  const retry = useCallback(() => fetchFirstPage(), [fetchFirstPage]);

  const retryLoadMore = useCallback(() => {
    setLoadMoreError(null);
    loadMore();
  }, [loadMore]);

  return {
    products,
    total,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    page,
    loadMore,
    retry,
    retryLoadMore,
  };
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

  const fetchPage = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getShopProducts(slug, query, { signal });
        if (signal?.aborted) return;
        setTotal(data.count);
        setProducts(data.results);
      } catch {
        if (signal?.aborted) return;
        setError("Couldn't load listings. Check your connection and try again.");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [query, slug],
  );

  // Fetches on mount, then whenever the query changes. The ref survives
  // StrictMode's simulated remount, so this is one request either way.
  useEffect(() => {
    if (loadedKey.current === queryKey) return;
    loadedKey.current = queryKey;
    const controller = new AbortController();
    fetchPage(controller.signal);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { products, total, loading, error };
}

export function usePublicShopProducts(
  query: ShopProductQuery,
  slug: string,
  initial?: Paginated<Product> | null,
) {
  const filterQuery: ShopProductQuery = { ...query, page: undefined };
  const filterKey = JSON.stringify(filterQuery);

  const [products, setProducts] = useState<Product[]>(initial?.results ?? []);
  const [total, setTotal] = useState(initial?.count ?? 0);
  const [loading, setLoading] = useState(initial ? false : true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initial ? initial.results.length < initial.count : true,
  );

  const loadedKey = useRef<string>(initial ? filterKey : "");
  const controllerRef = useRef<AbortController | null>(null);

  const fetchFirstPage = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicShopProducts(slug, { ...filterQuery, page: 1 }, { signal });
        if (signal?.aborted) return;
        setTotal(data.count);
        setProducts(data.results);
        setPage(1);
        setHasMore(Boolean(data.next) && data.results.length > 0 && data.results.length < data.count);
      } catch {
        if (signal?.aborted) return;
        setError("Couldn't load listings. Check your connection and try again.");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey, slug],
  );

  useEffect(() => {
    if (loadedKey.current === filterKey) return;
    loadedKey.current = filterKey;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchFirstPage(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchFirstPage, filterKey]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await getPublicShopProducts(slug, { ...filterQuery, page: nextPage });
      setProducts((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const added = data.results.filter((p) => !existing.has(p.id));
        const next = [...prev, ...added];
        setHasMore(Boolean(data.next) && next.length < data.count);
        return next;
      });
      setPage(nextPage);
    } catch {
      // keep existing
    } finally {
      setLoadingMore(false);
    }
  }, [filterQuery, hasMore, loading, loadingMore, page, slug]);

  return { products, total, loading, loadingMore, error, hasMore, loadMore };
}