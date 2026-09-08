"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { extractBrand, getNextSuggestions, type NextSuggestionsResult } from "@/lib/suggestions";
import { Icon } from "@/components/tinsae/icon";

/** Cap on how many seen ids are echoed back to the API in the query string. */
const SEEN_WINDOW = 300;

/** Suggestions arrive 8 at a time; reserve exactly that much space. */
const BATCH_SIZE = 8;

export function SimilarProductsInfinite({
  product,
  initialProducts,
}: {
  product: Product;
  initialProducts: Product[];
}) {
  const brand = extractBrand(product);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [categoryPage, setCategoryPage] = useState(initialProducts.length > 0 ? 2 : 1);
  const [discoveryPage, setDiscoveryPage] = useState(1);
  const [mode, setMode] = useState<"category" | "discovery">(
    product.category?.slug ? "category" : "discovery",
  );

  const seenIdsRef = useRef<Set<number>>(
    new Set([product.id, ...initialProducts.map((p) => p.id)]),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const loadMoreRef = useRef<() => void>(() => {});

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Batches that produced nothing new, back to back.
  const emptyStreak = useRef(0);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    isFetchingRef.current = true;

    const controller = new AbortController();
    inFlightRef.current = controller;
    const { signal } = controller;

    setLoadingMore(true);
    setError(null);

    try {
      // Only the most recent ids are sent: the whole set would grow without
      // bound in the query string. Anything older is still de-duplicated
      // client-side against seenIdsRef below.
      const seenIds = Array.from(seenIdsRef.current).slice(-SEEN_WINDOW);
      const qs = new URLSearchParams({
        categoryPage: String(categoryPage),
        discoveryPage: String(discoveryPage),
        mode,
        seen: seenIds.join(","),
      }).toString();

      let data: NextSuggestionsResult;

      try {
        const res = await fetch(
          `/api/products/${encodeURIComponent(product.slug)}/suggestions?${qs}`,
          { signal },
        );
        if (!res.ok) throw new Error("API request failed");
        data = (await res.json()) as NextSuggestionsResult;
      } catch (err) {
        if (signal.aborted || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        // Fallback to client-side suggestion generation if the route fails.
        data = await getNextSuggestions(product, {
          categoryPage,
          discoveryPage,
          seenIds,
          mode,
        });
      }

      if (signal.aborted) return;

      // De-duplicate before setState: updater functions must stay pure, and
      // React may call them more than once.
      const fresh: Product[] = [];
      for (const item of data.products) {
        if (!seenIdsRef.current.has(item.id)) {
          seenIdsRef.current.add(item.id);
          fresh.push(item);
        }
      }
      if (fresh.length > 0) {
        setProducts((prev) => [...prev, ...fresh]);
      }

      emptyStreak.current = fresh.length === 0 ? emptyStreak.current + 1 : 0;

      setCategoryPage(data.nextCategoryPage);
      setDiscoveryPage(data.nextDiscoveryPage);
      setMode(data.mode);
      const nextHasMore = data.hasMore && emptyStreak.current < 4;
      setHasMore(nextHasMore);
      hasMoreRef.current = nextHasMore;
    } catch {
      if (signal.aborted) return;
      setError("Couldn't load more suggestions. Check connection and tap retry.");
    } finally {
      // A newer request, or an unmount, has already taken over the flag.
      if (inFlightRef.current === controller) {
        inFlightRef.current = null;
        isFetchingRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [categoryPage, discoveryPage, mode, product]);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  // Check if sentinel or bottom of page is within trigger distance
  const checkAndTrigger = useCallback(() => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    const sentinel = sentinelRef.current;
    if (sentinel) {
      const rect = sentinel.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 800) {
        loadMoreRef.current();
        return;
      }
    }
    const scrollY = window.scrollY;
    const innerH = window.innerHeight;
    const totalH = document.documentElement.scrollHeight;
    if (scrollY + innerH >= totalH - 800) {
      loadMoreRef.current();
    }
  }, []);

  // Abandon any in-flight batch when the section goes away.
  useEffect(() => {
    return () => {
      inFlightRef.current?.abort();
      inFlightRef.current = null;
    };
  }, []);

  // Set up IntersectionObserver on sentinel with generous rootMargin
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingRef.current && hasMoreRef.current) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "800px" },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

  // Re-check after products append / loading completes to keep auto-generating if still at bottom
  useEffect(() => {
    if (!loadingMore && hasMore && !error) {
      requestAnimationFrame(() => {
        checkAndTrigger();
      });
    }
  }, [products.length, loadingMore, hasMore, error, checkAndTrigger]);

  // Passive window scroll & resize fallback for fast scroll jumps
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

  // Nothing to show and nothing left to fetch. While more may still arrive the
  // section stays mounted so the sentinel can trigger the first batch.
  if (products.length === 0 && !loadingMore && !hasMore) {
    return null;
  }

  const categoryName = product.category?.name ?? "listings";

  return (
    <section className="mt-14 border-t border-tn-hair pt-10" aria-label="Similar listings">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-tn-ink text-[28px] font-extrabold tracking-[-0.03em] sm:text-[32px]">
            Similar {categoryName.toLowerCase()}
          </h2>
          <p className="text-tn-mute mt-1 text-sm font-medium">
            Personalized recommendations based on brand, specs &amp; price
          </p>
        </div>
        {brand && (
          <span className="border-tn-hair bg-tn-paper text-tn-ink2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            <span>Brand match:</span>
            <span className="text-tn-ink font-extrabold">{brand}</span>
          </span>
        )}
      </div>

      <div
        data-results-grid="grid"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {loadingMore &&
          Array.from({ length: BATCH_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={`sugg-skel-${i}`} />
          ))}
      </div>

      {/* Sentinel for infinite scroll. */}
      {hasMore && !error && (
        <div ref={sentinelRef} className="h-10 w-full" aria-hidden />
      )}

      {/* Loading feedback */}
      {loadingMore && (
        <div className="flex flex-col items-center justify-center py-8" aria-live="polite">
          <div className="flex items-center gap-2.5 rounded-full border border-tn-hair bg-white px-5 py-2.5 shadow-xs">
            <div className="size-4 animate-spin rounded-full border-2 border-tn-hair2 border-t-tn-red" />
            <span className="text-xs font-semibold text-tn-mute">Loading more recommendations…</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mt-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadMore}
            className="text-tn-red underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* End state */}
      {!hasMore && products.length > 0 && (
        <div className="border-tn-hair mt-10 flex flex-col items-center justify-center gap-1 border-t pt-8 pb-10 text-center">
          <div className="text-tn-mute flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
            <Icon name="check" size={14} className="text-tn-green" />
            <span>All recommendations loaded</span>
          </div>
          <p className="font-tn-mono text-tn-mute text-xs">
            Showing {products.length} recommendations
          </p>
        </div>
      )}
    </section>
  );
}
