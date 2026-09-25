"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProducts, getPublicShopProducts, type ProductQuery, type ShopProductQuery } from "@/lib/api/public";
import { getShopProducts } from "@/lib/api/client";
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
      if (loadedKey.current === filterKey) {
        loadedKey.current = "";
      }
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
        {
          ...filterQueryRef.current,
          page: nextPage,
          pageSize: PRODUCTS_PAGE_SIZE,
        },
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
        Boolean(data.next) &&
          data.results.length > 0 &&
          emptyStreak.current < 4,
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

type CachedShopProducts = {
  products: ShopProduct[];
  total: number;
  timestamp: number;
};

const shopProductsCache = new Map<string, CachedShopProducts>();

export function getShopProductsCacheKey(
  slug: string,
  query: ShopProductQuery,
): string {
  const normalized = {
    page: query.page && query.page > 1 ? query.page : 1,
    pageSize: query.pageSize || 20,
    ordering: query.ordering || "-created_at",
    q: query.q || undefined,
    category: query.category || undefined,
    status: query.status || undefined,
    fresh: query.fresh || undefined,
  };
  return `${slug}:${JSON.stringify(normalized)}`;
}

export function clearShopProductsCache(slug?: string) {
  if (slug) {
    for (const key of Array.from(shopProductsCache.keys())) {
      if (key.startsWith(`${slug}:`)) {
        shopProductsCache.delete(key);
      }
    }
  } else {
    shopProductsCache.clear();
  }
}

/**
 * Owns the merchant's own catalogue for the dashboard.
 *
 * Takes no access token: `getShopProducts` calls a same-origin route handler
 * that attaches the Authorization header server-side (see lib/auth/authed-fetch).
 *
 * Utilizes a client-side memory cache so navigating between Overview and Listings
 * renders instantly without getting stuck in a loading state or refetching unnecessarily.
 */
export function useShopProducts(query: ShopProductQuery, slug: string) {
  const cacheKey = getShopProductsCacheKey(slug, query);
  // Callers commonly build this object inline. Depend on its values rather
  // than its identity so a response update cannot restart the same request.
  const queryKey = JSON.stringify(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey represents every query value.
  const stableQuery = useMemo(() => query, [queryKey]);
  const cached = shopProductsCache.get(cacheKey);

  const [products, setProducts] = useState<ShopProduct[]>(
    () => cached?.products ?? [],
  );
  const [total, setTotal] = useState<number>(() => cached?.total ?? 0);
  const [loading, setLoading] = useState<boolean>(() => !cached);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  // Sync state if cacheKey changes and we already have cached data for it
  const [prevCacheKey, setPrevCacheKey] = useState(cacheKey);
  if (prevCacheKey !== cacheKey) {
    setPrevCacheKey(cacheKey);
    const currentCached = shopProductsCache.get(cacheKey);
    if (currentCached) {
      setProducts(currentCached.products);
      setTotal(currentCached.total);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }
  }

  const fetchPage = useCallback(
    async (signal?: AbortSignal) => {
      const currentCached = shopProductsCache.get(cacheKey);
      try {
        const data = await getShopProducts(slug, stableQuery, { signal });
        if (signal?.aborted) return;
        shopProductsCache.set(cacheKey, {
          products: data.results,
          total: data.count,
          timestamp: Date.now(),
        });
        setTotal(data.count);
        setProducts(data.results);
        setError(null);
      } catch (err: unknown) {
        if (signal?.aborted || (err as Error)?.name === "AbortError") return;
        if (!currentCached) {
          setError(
            "Couldn't load listings. Check your connection and try again.",
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [cacheKey, setError, setLoading, setProducts, setTotal, slug, stableQuery],
  );

  useEffect(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    queueMicrotask(() => {
      void fetchPage(controller.signal);
    });

    return () => {
      controller.abort();
    };
  }, [fetchPage]);

  // Wrapped updater to keep cache in sync when optimistic updates occur
  const setProductsAndCache = useCallback(
    (action: React.SetStateAction<ShopProduct[]>) => {
      setProducts((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        const current = shopProductsCache.get(cacheKey);
        if (current) {
          shopProductsCache.set(cacheKey, {
            ...current,
            products: next,
          });
        }
        return next;
      });
    },
    [cacheKey, setProducts],
  );

  return {
    products,
    setProducts: setProductsAndCache,
    total,
    loading,
    error,
    refetch: () => fetchPage(),
  };
}

export function usePublicShopProducts(
  query: ShopProductQuery,
  slug: string,
  initial?: Paginated<Product> | null,
) {
  const filterQuery: ShopProductQuery = useMemo(
    () => ({ ...query, page: undefined }),
    [query],
  );
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
        const data = await getPublicShopProducts(
          slug,
          { ...filterQuery, page: 1 },
          { signal },
        );
        if (signal?.aborted) return;
        setTotal(data.count);
        setProducts(data.results);
        setPage(1);
        setHasMore(
          Boolean(data.next) &&
            data.results.length > 0 &&
            data.results.length < data.count,
        );
      } catch {
        if (signal?.aborted) return;
        setError(
          "Couldn't load listings. Check your connection and try again.",
        );
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
      if (loadedKey.current === filterKey) {
        loadedKey.current = "";
      }
    };
  }, [fetchFirstPage, filterKey]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await getPublicShopProducts(slug, {
        ...filterQuery,
        page: nextPage,
      });
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
