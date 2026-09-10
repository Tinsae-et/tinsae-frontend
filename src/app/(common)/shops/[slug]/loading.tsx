import React from "react";
import { ProductCardSkeleton } from "@/components/products/product-card";

export default function ShopProfileLoading() {
  return (
    <div className="min-h-screen w-full bg-white text-tn-ink">
      {/* Cover skeleton */}
      <div className="h-[172px] w-full animate-pulse bg-tn-hair2" />

      {/* Header skeleton */}
      <div className="mx-auto max-w-[1240px] px-6 lg:px-7">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="flex items-end gap-5">
            <div className="-mt-11 size-24 shrink-0 animate-pulse rounded-3xl border-4 border-white bg-tn-hair2 shadow-md sm:size-28" />
            <div className="space-y-2 pb-1">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-tn-hair2" />
              <div className="h-4 w-80 animate-pulse rounded bg-tn-hair" />
            </div>
          </div>
          <div className="flex gap-2.5 pb-1">
            <div className="h-11 w-24 animate-pulse rounded-full bg-tn-hair2" />
            <div className="h-11 w-44 animate-pulse rounded-full bg-tn-hair2" />
          </div>
        </div>

        {/* Stat strip skeleton */}
        <div className="mt-7 grid grid-cols-2 gap-4 border-t border-tn-hair2 py-4 sm:grid-cols-5 sm:gap-0 sm:py-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5 px-3 sm:px-5">
              <div className="h-7 w-20 animate-pulse rounded bg-tn-hair2" />
              <div className="h-4 w-24 animate-pulse rounded bg-tn-hair" />
              <div className="h-3 w-16 animate-pulse rounded bg-tn-hair" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="mt-8 flex gap-6 border-b border-tn-hair2 pb-3">
          <div className="h-5 w-24 animate-pulse rounded bg-tn-hair2" />
          <div className="h-5 w-20 animate-pulse rounded bg-tn-hair" />
          <div className="h-5 w-20 animate-pulse rounded bg-tn-hair" />
          <div className="h-5 w-20 animate-pulse rounded bg-tn-hair" />
        </div>

        {/* Body skeleton */}
        <div className="grid grid-cols-1 items-start gap-7 py-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex justify-between pb-6">
              <div className="h-6 w-36 animate-pulse rounded bg-tn-hair2" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-tn-hair" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-80 w-full animate-pulse rounded-2xl bg-tn-hair2" />
            <div className="h-44 w-full animate-pulse rounded-2xl bg-tn-hair2" />
          </div>
        </div>
      </div>
    </div>
  );
}
