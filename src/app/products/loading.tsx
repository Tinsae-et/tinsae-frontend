import { ProductCardSkeleton } from "@/components/products/product-card";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1240px] px-6 py-10 lg:py-14">
      <header className="mb-8">
        <div className="bg-tn-hair2 h-3 w-24 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-4 h-9 w-72 max-w-full animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-3 h-3 w-20 animate-pulse rounded" />
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
