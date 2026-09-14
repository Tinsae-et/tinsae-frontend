import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopsBrowser } from "@/components/shops/shops-browser";
import { ShopCardSkeleton } from "@/components/shops/shop-card";
import { SHOPS_RICH, mapShopToDirectoryShop } from "@/lib/shops-data";
import { getShops } from "@/lib/api";

export const metadata: Metadata = {
  title: "Verified Shops in Bole — Tinsae",
  description:
    "Browse verified electronics shops across Bole, Addis Ababa by rating, reply speed, and distance.",
};

export const dynamic = "force-dynamic";

export default async function ShopsPage() {
  let shops = SHOPS_RICH;
  try {
    const data = await getShops({ pageSize: 100 });
    if (data?.results && data.results.length > 0) {
      shops = data.results.map(mapShopToDirectoryShop);
    }
  } catch (error) {
    console.error("Failed to fetch shops from backend, falling back to static shops:", error);
  }

  return (
    <main>
      <Suspense fallback={<ShopDirectorySkeleton />}>
        <ShopsBrowser initialShops={shops} />
      </Suspense>
    </main>
  );
}

function ShopDirectorySkeleton() {
  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="border-b border-tn-hair2 bg-[radial-gradient(120%_120%_at_90%_-20%,#FFF1EB_0%,rgba(255,255,255,0)_50%)]">
        <div className="mx-auto max-w-[1480px] px-6 pt-9 pb-7 sm:px-8 lg:px-12 xl:px-16">
          <div className="bg-tn-hair2 h-6 w-48 animate-pulse rounded-full" />
          <div className="bg-tn-hair2 mt-4 h-10 w-96 animate-pulse rounded" />
          <div className="bg-tn-hair2 mt-3 h-4 w-72 animate-pulse rounded" />
        </div>
      </div>
      <div className="border-b border-tn-hair2 bg-white/95 py-3.5">
        <div className="mx-auto flex max-w-[1480px] gap-2 px-6 sm:px-8 lg:px-12 xl:px-16">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-tn-hair2 h-9 w-20 animate-pulse rounded-full" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1480px] px-6 pt-7 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}