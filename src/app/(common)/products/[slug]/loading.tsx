import React from "react";

export default function ProductDetailLoading() {
  return (
    <main className="text-tn-ink mx-auto max-w-[1480px] px-6 pt-6 sm:px-8 lg:px-12 xl:px-16 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-12 bg-tn-hair2 rounded" />
        <div className="h-3 w-3 bg-tn-hair2 rounded" />
        <div className="h-3 w-16 bg-tn-hair2 rounded" />
        <div className="h-3 w-3 bg-tn-hair2 rounded" />
        <div className="h-3 w-32 bg-tn-hair2 rounded" />
      </div>

      <div className="pt-6">
        <div className="grid items-start gap-[44px] lg:grid-cols-[1fr_1.12fr]">
          {/* Gallery skeleton */}
          <div className="aspect-square w-full rounded-[22px] bg-tn-hair2" />

          {/* Details skeleton */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-7 w-24 bg-tn-hair2 rounded-full" />
              <div className="h-7 w-28 bg-tn-hair2 rounded-full" />
            </div>
            <div className="h-3 w-20 bg-tn-hair2 rounded" />
            <div className="h-10 w-3/4 bg-tn-hair2 rounded-lg" />
            <div className="h-4 w-1/2 bg-tn-hair2 rounded" />

            <div className="mt-6 h-36 rounded-[18px] border border-tn-hair bg-tn-paper p-6" />
            <div className="mt-4 h-24 rounded-[18px] border border-tn-hair bg-white p-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
