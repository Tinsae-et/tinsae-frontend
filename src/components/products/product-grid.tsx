"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts, type ProductQuery } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { Icon } from "@/components/tinsae/icon";

export const PRODUCTS_PAGE_SIZE = 20;

export function ProductGrid({
  initialProducts,
  totalCount,
  query,
}: {
  initialProducts: Product[];
  totalCount: number;
  query: ProductQuery;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const hasMore = products.length < totalCount;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const next = page + 1;
      const data = await getProducts({ ...query, page: next, pageSize: PRODUCTS_PAGE_SIZE });
      setProducts((prev) => {
        // Guard against duplicates if the underlying ordering shifts between pages.
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.results.filter((p) => !seen.has(p.id))];
      });
      setPage(next);
    } catch {
      setError("Couldn't load more listings. Check your connection and try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, page, query]);

  // Infinite scroll: when the sentinel enters the viewport, load the next page.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`s-${i}`} />)}
      </div>

      {error && (
        <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              loadMore();
            }}
            className="text-tn-red underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Scroll sentinel + footer status */}
      <div ref={sentinelRef} aria-hidden className="h-px" />
      <div className="mt-8 flex flex-col items-center gap-2">
        {loading ? (
          <p className="font-tn-mono text-tn-mute text-xs tracking-wide">Loading more…</p>
        ) : hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            className="border-tn-hair text-tn-ink hover:border-tn-red hover:text-tn-red inline-flex h-12 items-center gap-2 rounded-full border bg-white px-6 text-sm font-bold transition-colors"
          >
            Load more
            <Icon name="chevd" size={16} />
          </button>
        ) : (
          products.length > 0 && (
            <p className="text-tn-mute text-sm font-medium">You&rsquo;ve reached the end.</p>
          )
        )}
        <p className="font-tn-mono text-tn-mute text-xs tracking-wide">
          Showing {products.length} of {totalCount}
        </p>
      </div>
    </>
  );
}
