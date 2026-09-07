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
  const [categoryPage, setCategoryPage] = useState(2);
  const [discoveryPage, setDiscoveryPage] = useState(1);
  const [mode, setMode] = useState<"category" | "discovery">(
    product.category?.slug ? "category" : "discovery",
  );

  const seenIdsRef = useRef<Set<number>>(
    new Set([product.id, ...initialProducts.map((p) => p.id)]),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);

  // Batches that produced nothing new, back to back. Two in a row means the
  // sentinel would stay on screen with no new content beneath it and the
  // observer would spin through pages, so treat the stream as finished.
  const emptyStreak = useRef(0);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

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
      setHasMore(data.hasMore && emptyStreak.current < 2);
    } catch {
      if (signal.aborted) return;
      setError("Couldn't load more suggestions. Check connection and tap retry.");
    } finally {
      // A newer request, or an unmount, has already taken over the flag.
      if (inFlightRef.current === controller) {
        inFlightRef.current = null;
        setLoadingMore(false);
      }
    }
  }, [categoryPage, discoveryPage, hasMore, loadingMore, mode, product]);

  // Abandon any in-flight batch when the section goes away.
  useEffect(() => {
    return () => {
      inFlightRef.current?.abort();
      inFlightRef.current = null;
    };
  }, []);

  const loadMoreRef = useRef(loadMore);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    loadMoreRef.current = loadMore;
    isFetchingRef.current = Boolean(loadingMore || error);
  });

  // Set up IntersectionObserver on sentinel with stable callback reference
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingRef.current) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

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

      {/* Sentinel for infinite scroll. Stays mounted across a load: unmounting
          it mid-fetch changed the document height twice per batch, which is
          what made the scrollbar jitter. Only the observer is gated. */}
      {hasMore && !error && (
        <div ref={sentinelRef} className="h-10 w-full" aria-hidden />
      )}

      {/* Loading feedback. Announced rather than drawn — the in-grid skeletons
          already show the pending batch, and a visible block here would add and
          remove height on every fetch. */}
      <p aria-live="polite" className="sr-only">
        {loadingMore ? "Loading more recommendations" : ""}
      </p>

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
