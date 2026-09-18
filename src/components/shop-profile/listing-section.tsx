"use client";

import  { useState, useCallback, useEffect, useRef } from "react";
import CategoryChips from "./category-chips";
import { Icon } from "@/components/tinsae/icon";
import { SortDropdown } from "@/components/tinsae/sort-dropdown";
import type { ShopProductQuery } from "@/lib/api";
import { getPublicShopProducts } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "../products/product-card";
import type { Product, Paginated } from "@/lib/types";

const PAGE_SIZE = 12;

const LISTING_SORT_OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "created_at", label: "Oldest" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
] as const;

export function ListingSection({
  slug,
  shopSlug,
  initialProducts,
}: {
  slug?: string;
  shopSlug?: string;
  initialProducts?: Paginated<Product> | null;
}) {
  const resolvedSlug = (shopSlug || slug) ?? "";

  const [query, setQuery] = useState<ShopProductQuery>({
    category: undefined,
    ordering: "-created_at",
  });

  const [products, setProducts] = useState<Product[]>(initialProducts?.results ?? []);
  const [total, setTotal] = useState<number>(initialProducts?.count ?? 0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(
    initialProducts ? initialProducts.results.length < initialProducts.count : false,
  );

  const seenIdsRef = useRef<Set<number>>(
    new Set((initialProducts?.results ?? []).map((p) => p.id)),
  );
  const pageRef = useRef(1);
  const hasMoreRef = useRef(hasMore);
  const isFetchingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const queryRef = useRef(query);
  const firstPageRef = useRef<AbortController | null>(null);
  const loadMoreRef = useRef<AbortController | null>(null);

  useEffect(() => {
    queryRef.current = query;
    hasMoreRef.current = hasMore;
    pageRef.current = page;
  });

  const fetchFirstPage = useCallback(
    async (currentQuery: ShopProductQuery, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      setLoadMoreError(null);
      try {
        const data = await getPublicShopProducts(
          resolvedSlug,
          {
            ...currentQuery,
            page: 1,
            pageSize: PAGE_SIZE,
          },
          { signal },
        );
        if (signal?.aborted) return;
        seenIdsRef.current = new Set(data.results.map((p) => p.id));
        setProducts(data.results);
        setTotal(data.count);
        setPage(1);
        const more = data.results.length < data.count && Boolean(data.next);
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Failed to load products for shop:", err);
        setError("Couldn't load listings. Check your connection and try again.");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [resolvedSlug],
  );

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialProducts) {
        return;
      }
    }

    firstPageRef.current?.abort();
    loadMoreRef.current?.abort();
    loadMoreRef.current = null;
    isFetchingMoreRef.current = false;
    setLoadingMore(false);
    setLoadMoreError(null);

    const controller = new AbortController();
    firstPageRef.current = controller;
    fetchFirstPage(query, controller.signal);

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.category, query.ordering, query.q, fetchFirstPage, initialProducts]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || isFetchingMoreRef.current || !hasMoreRef.current) return;
    isFetchingMoreRef.current = true;

    const controller = new AbortController();
    loadMoreRef.current = controller;
    const { signal } = controller;

    setLoadingMore(true);
    setLoadMoreError(null);

    const nextPage = pageRef.current + 1;
    try {
      const data = await getPublicShopProducts(
        resolvedSlug,
        {
          ...queryRef.current,
          page: nextPage,
          pageSize: PAGE_SIZE,
        },
        { signal },
      );
      if (signal.aborted) return;

      const fresh = data.results.filter((p) => !seenIdsRef.current.has(p.id));
      for (const p of fresh) {
        seenIdsRef.current.add(p.id);
      }

      if (fresh.length > 0) {
        setProducts((prev) => [...prev, ...fresh]);
      }

      setPage(nextPage);
      setTotal(data.count);
      const more = seenIdsRef.current.size < data.count && Boolean(data.next) && fresh.length > 0;
      setHasMore(more);
      hasMoreRef.current = more;
    } catch (err) {
      if (signal.aborted) return;
      console.error("Failed to load more products:", err);
      setLoadMoreError("Could not load more listings. Click to retry.");
    } finally {
      if (!signal.aborted) {
        setLoadingMore(false);
        isFetchingMoreRef.current = false;
      }
    }
  }, [loading, loadingMore, resolvedSlug]);

  const loadMoreCallbackRef = useRef(loadMore);
  useEffect(() => {
    loadMoreCallbackRef.current = loadMore;
  });

  const checkAndTrigger = useCallback(() => {
    if (loading || loadingMore || isFetchingMoreRef.current || !hasMoreRef.current) return;
    const sentinel = sentinelRef.current;
    if (sentinel) {
      const rect = sentinel.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 800) {
        loadMoreCallbackRef.current();
        return;
      }
    }
    const scrollY = window.scrollY;
    const innerH = window.innerHeight;
    const totalH = document.documentElement.scrollHeight;
    if (scrollY + innerH >= totalH - 800) {
      loadMoreCallbackRef.current();
    }
  }, [loading, loadingMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingMoreRef.current && hasMoreRef.current) {
          loadMoreCallbackRef.current();
        }
      },
      { rootMargin: "800px" },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

  useEffect(() => {
    if (!loading && !loadingMore && hasMore && !loadMoreError) {
      requestAnimationFrame(() => {
        checkAndTrigger();
      });
    }
  }, [products.length, loading, loadingMore, hasMore, loadMoreError, checkAndTrigger]);

  useEffect(() => {
    if (!hasMore) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        checkAndTrigger();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hasMore, checkAndTrigger]);

  return (
    <div>
      {/* Header with Title & Count & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-tn-ink text-2xl font-extrabold tracking-tight">
            All listings <span className="font-semibold text-tn-mute">{total}</span>
          </h2>
          <p className="font-tn-mono text-tn-mute mt-1 flex items-center gap-1.5 text-xs">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {total} available & confirmed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SortDropdown
            value={query.ordering ?? "-created_at"}
            onChange={(ordering) =>
              setQuery((prev) => ({
                ...prev,
                ordering,
              }))
            }
            options={LISTING_SORT_OPTIONS}
            size="sm"
          />
        </div>
      </div>

      {/* Category chips */}
      <CategoryChips total={total} query={query} setQuery={setQuery} />

      {/* Listing cards */}
      <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-tn-hair bg-white p-12 text-center">
            <Icon name="box" size={32} className="mx-auto text-tn-mute" />
            <h3 className="mt-3 text-base font-bold text-tn-ink">No listings found</h3>
            <p className="text-tn-mute mt-1 text-sm">
              This shop doesn&apos;t have any active listings matching your selection.
            </p>
          </div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && !loading && !loadMoreError && (
        <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
      )}

      {/* Loading more spinner indicator */}
      {loadingMore && (
        <div className="flex flex-col items-center justify-center py-8" aria-live="polite">
          <div className="flex items-center gap-2.5 rounded-full border border-tn-hair bg-white px-5 py-2.5 shadow-xs">
            <div className="size-4 animate-spin rounded-full border-2 border-tn-hair2 border-t-tn-red" />
            <span className="text-xs font-semibold text-tn-mute">Loading more listings…</span>
          </div>
        </div>
      )}

      {/* Error on initial fetch */}
      {error && (
        <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mt-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchFirstPage(query)}
            className="text-tn-red underline underline-offset-2 hover:opacity-80 font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Error when loading next page */}
      {loadMoreError && (
        <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mt-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold">
          <span>{loadMoreError}</span>
          <button
            type="button"
            onClick={() => loadMore()}
            className="text-tn-red underline underline-offset-2 hover:opacity-80 font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && products.length > 0 && !loading && (
        <div className="mt-10 flex flex-col items-center justify-center gap-1 border-t border-tn-hair pt-8 pb-4 text-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-tn-mute uppercase">
            <Icon name="check" size={14} className="text-tn-green" />
            <span>All listings loaded</span>
          </div>
          <p className="font-tn-mono text-xs text-tn-mute">
            Showing all {products.length} of {total.toLocaleString("en-US")} listings
          </p>
        </div>
      )}
    </div>
  );
}

export default ListingSection;
