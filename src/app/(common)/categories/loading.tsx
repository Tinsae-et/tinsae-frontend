import { ProductCardSkeleton } from "@/components/products/product-card";

export default function CategoriesLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <section className="border-b border-tn-hair2 bg-[radial-gradient(120%_110%_at_88%_-25%,#FFF1EB_0%,rgba(255,241,235,0)_52%)] bg-white">
        <div className="mx-auto max-w-[1240px] px-6 py-7 sm:px-8 sm:py-9">
          <div className="h-3 w-32 bg-tn-hair2 animate-pulse rounded" />
          <div className="mt-5 h-12 w-80 max-w-full bg-tn-hair2 animate-pulse rounded-lg" />
          <div className="mt-4 h-4 w-96 max-w-full bg-tn-hair2 animate-pulse rounded" />
          <div className="mt-6 flex gap-6">
            <div className="h-4 w-28 bg-tn-hair2 animate-pulse rounded" />
            <div className="h-4 w-28 bg-tn-hair2 animate-pulse rounded" />
            <div className="h-4 w-36 bg-tn-hair2 animate-pulse rounded" />
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="mx-auto max-w-[1240px] px-6 pt-16 sm:px-8 lg:pt-20">
        <div className="h-4 w-20 bg-tn-hair2 animate-pulse rounded mb-2" />
        <div className="h-8 w-44 bg-tn-hair2 animate-pulse rounded mb-7" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[190px] rounded-[18px] border border-tn-hair bg-white p-5 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="size-[50px] rounded-[14px] bg-tn-hair2" />
                <div className="h-3 w-16 bg-tn-hair2 rounded" />
              </div>
              <div className="mt-5 h-5 w-28 bg-tn-hair2 rounded" />
              <div className="mt-2 h-3 w-40 bg-tn-hair2 rounded" />
              <div className="mt-6 border-t border-tn-hair2 pt-3 flex justify-between">
                <div className="h-4 w-24 bg-tn-hair2 rounded" />
                <div className="size-4 bg-tn-hair2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Skeleton */}
      <section className="mx-auto max-w-[1240px] px-6 pt-16 sm:px-8 lg:pt-20">
        <div className="h-4 w-20 bg-tn-hair2 animate-pulse rounded mb-2" />
        <div className="h-8 w-44 bg-tn-hair2 animate-pulse rounded mb-7" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
