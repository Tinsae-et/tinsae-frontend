"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Product } from "@/lib/types";
import {
  ProductCard,
  ProductRow,
  ProductCardSkeleton,
  ProductRowSkeleton,
} from "./product-card";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

export const PRODUCTS_PAGE_SIZE = 12;

export function ProductGrid({
  products,
  total,
  loading,
  loadingMore = false,
  error,
  loadMoreError = null,
  hasMore = false,
  view,
  onLoadMore,
  onRetry,
  onRetryLoadMore,
}: {
  products: Product[];
  total: number;
  loading: boolean;
  loadingMore?: boolean;
  error: string | null;
  loadMoreError?: string | null;
  hasMore?: boolean;
  view: "grid" | "list";
  onLoadMore?: () => void;
  onRetry: () => void;
  onRetryLoadMore?: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const gridClass = cn(
    "grid gap-4",
    view === "grid" ? "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1",
  );
  const Skeleton = view === "grid" ? ProductCardSkeleton : ProductRowSkeleton;

  const onLoadMoreRef = useRef(onLoadMore);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    isFetchingRef.current = Boolean(loading || loadingMore || loadMoreError);
  });

  const checkAndTrigger = useCallback(() => {
    if (isFetchingRef.current || !hasMore || !onLoadMoreRef.current) return;
    const sentinel = sentinelRef.current;
    if (sentinel) {
      const rect = sentinel.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 800) {
        onLoadMoreRef.current();
        return;
      }
    }
    const scrollY = window.scrollY;
    const innerH = window.innerHeight;
    const totalH = document.documentElement.scrollHeight;
    if (scrollY + innerH >= totalH - 800) {
      onLoadMoreRef.current();
    }
  }, [hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || !onLoadMore) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingRef.current) {
          onLoadMoreRef.current?.();
        }
      },
      { rootMargin: "800px" },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, onLoadMore]);

  // Re-check after products append / loading completes to keep auto-generating if still at bottom
  useEffect(() => {
    if (!loading && !loadingMore && hasMore && !loadMoreError) {
      requestAnimationFrame(() => {
        checkAndTrigger();
      });
    }
  }, [products.length, loading, loadingMore, hasMore, loadMoreError, checkAndTrigger]);

  // Passive window scroll & resize fallback for fast scroll jumps
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

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
  }, [hasMore, onLoadMore, checkAndTrigger]);

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {total} {total === 1 ? "listing" : "listings"}
      </p>

      {loading ? (
        <div className={gridClass}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? null : (
        <div
          role="region"
          aria-label="Results"
          data-results-grid={view}
          className={gridClass}
        >
          {products.map((p) =>
            view === "grid" ? (
              <ProductCard key={p.id} product={p} />
            ) : (
              <ProductRow key={p.id} product={p} />
            ),
          )}
        </div>
      )}

      {/* Sentinel for infinite scroll prefetching */}
      {hasMore && !loading && !loadMoreError && (
        <div ref={sentinelRef} className="h-6 w-full" aria-hidden />
      )}

      {/* Stable loading-more indicator */}
      {loadingMore && (
        <div className="flex flex-col items-center justify-center py-10" aria-live="polite">
          <div className="flex items-center gap-2.5 rounded-full border border-tn-hair bg-white px-5 py-2.5 shadow-xs">
            <div className="size-4 animate-spin rounded-full border-2 border-tn-hair2 border-t-tn-red" />
            <span className="text-xs font-semibold text-tn-mute">Loading more listings…</span>
          </div>
        </div>
      )}

      {/* Error on initial load */}
      {error && (
        <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mt-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold">
          <span>{error}</span>
          <button type="button" onClick={onRetry} className="text-tn-red underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {/* Error when loading next page */}
      {loadMoreError && (
        <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mt-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold">
          <span>{loadMoreError}</span>
          {onRetryLoadMore && (
            <button
              type="button"
              onClick={onRetryLoadMore}
              className="text-tn-red underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          )}
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
    </>
  );
}
