import { ProductCardSkeleton } from "@/components/products/product-card";

export default function Loading() {
  return (
    <div>
      <div className="border-b border-tn-hair2">
        <div className="mx-auto max-w-[1480px] px-6 pt-6 pb-7 sm:px-8 lg:px-12 xl:px-16">
          <div className="bg-tn-hair2 h-3 w-40 animate-pulse rounded" />
          <div className="bg-tn-hair2 mt-5 h-11 w-64 max-w-full animate-pulse rounded" />
          <div className="bg-tn-hair2 mt-3 h-3 w-24 animate-pulse rounded" />
        </div>
      </div>
      <div className="mx-auto flex max-w-[1480px] items-start gap-7 px-6 py-7 sm:px-8 lg:gap-8 lg:px-12 xl:px-16">
        <div className="hidden w-[268px] shrink-0 lg:block">
          <div className="bg-tn-hair2 h-96 animate-pulse rounded-[18px]" />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
