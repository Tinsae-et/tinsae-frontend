import { ProductCardSkeleton } from "@/components/products/product-card";

export default function Loading() {
  return (
    <div>
      <div className="border-b border-tn-hair2">
        <div className="mx-auto max-w-[1240px] px-6 pt-6 pb-7 lg:px-7">
          <div className="bg-tn-hair2 h-3 w-40 animate-pulse rounded" />
          <div className="bg-tn-hair2 mt-5 h-11 w-64 max-w-full animate-pulse rounded" />
          <div className="bg-tn-hair2 mt-3 h-3 w-24 animate-pulse rounded" />
        </div>
      </div>
      <div className="mx-auto flex max-w-[1240px] items-start gap-[26px] px-6 py-7 lg:px-7">
        <div className="hidden w-[268px] shrink-0 lg:block">
          <div className="bg-tn-hair2 h-96 animate-pulse rounded-[18px]" />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
