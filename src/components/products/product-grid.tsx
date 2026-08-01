"use client";

import type { Product } from "@/lib/types";
import { ProductCard, ProductRow, ProductCardSkeleton } from "./product-card";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

export const PRODUCTS_PAGE_SIZE = 12;

// Windowed page numbers: 1 … (current-1) current (current+1) … last
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (page > 3) out.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) out.push(p);
  if (page < totalPages - 2) out.push("…");
  out.push(totalPages);
  return out;
}

export function ProductGrid({
  products,
  total,
  loading,
  error,
  page,
  view,
  onPageChange,
  onRetry,
}: {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  view: "grid" | "list";
  onPageChange: (page: number) => void;
  onRetry: () => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages); // clamp out-of-range ?page=
  const start = total === 0 ? 0 : (safePage - 1) * PRODUCTS_PAGE_SIZE + 1;
  const end = Math.min(safePage * PRODUCTS_PAGE_SIZE, total);
  const window = pageWindow(safePage, totalPages);

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {total} {total === 1 ? "listing" : "listings"}
      </p>

      {loading ? (
        <div
          className={cn(
            "grid gap-4",
            view === "grid"
              ? "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1",
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? null : (
        <div
          role="region"
          aria-label="Results"
          className={cn(
            "grid gap-4",
            view === "grid"
              ? "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1",
          )}
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

      {error && (
        <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold">
          <span>{error}</span>
          <button type="button" onClick={onRetry} className="text-tn-red underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {/* ── pagination (design) ───────────────────────────── */}
      {!loading && total > 0 && (
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-tn-hair pt-[22px]">
          <span className="font-tn-mono text-tn-mute text-[13px]">
            Showing {start}–{end} of {total.toLocaleString("en-US")}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="text-tn-ink2 border-tn-hair inline-flex h-10 min-w-[40px] items-center justify-center rounded-full border bg-white px-3 text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="chevron" size={15} className="-scale-x-100" />
            </button>

            {window.map((n, i) =>
              n === "…" ? (
                <span key={`d${i}`} className="text-tn-mute inline-flex h-10 min-w-[24px] items-center justify-center text-[13.5px] font-bold">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => onPageChange(n)}
                  aria-current={n === safePage ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 min-w-[40px] items-center justify-center rounded-full px-3 text-[13.5px] font-bold",
                    n === safePage
                      ? "bg-tn-ink text-white"
                      : "border-tn-hair border bg-white text-tn-ink2",
                  )}
                >
                  {n}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="text-tn-ink border-tn-hair ml-1 inline-flex h-10 items-center gap-1.5 rounded-full border bg-white px-4 text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <Icon name="chevron" size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
