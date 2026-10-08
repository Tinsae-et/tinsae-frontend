import { DIRECTORY_GUTTER, ResultsSkeleton } from "@/components/shops/shop-directory";

/** First load of the directory: the header and chip bar's shape, then shop cards. */
export default function Loading() {
  return (
    <main className="min-h-screen bg-white pb-20" aria-busy="true">
      <div className="border-tn-hair2 border-b">
        <div className={DIRECTORY_GUTTER + " pt-9 pb-7"}>
          <div className="bg-tn-hair2 h-7 w-56 animate-pulse rounded-full" />
          <div className="bg-tn-hair2 mt-4 h-10 w-72 max-w-full animate-pulse rounded" />
          <div className="bg-tn-hair2 mt-3 h-4 w-96 max-w-full animate-pulse rounded" />
        </div>
      </div>
      <div className="border-tn-hair2 border-b">
        <div className={DIRECTORY_GUTTER + " flex gap-2 overflow-hidden py-3.5"}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-tn-hair2 h-9 w-24 shrink-0 animate-pulse rounded-full" />
          ))}
        </div>
      </div>
      <div className={DIRECTORY_GUTTER + " pt-7"}>
        <ResultsSkeleton />
      </div>
    </main>
  );
}
