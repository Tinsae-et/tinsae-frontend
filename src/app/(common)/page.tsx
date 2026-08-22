import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Hero } from "@/components/home/hero";
import { BrowseCategories } from "@/components/home/browse-categories";
import { TopShops } from "@/components/home/top-shops";
import { FreshListings } from "@/components/home/fresh-listings";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatBand } from "@/components/home/stat-band";
import { ShopBand } from "@/components/home/shop-band";
import { FinalCTA } from "@/components/home/final-cta";

export default async function Home() {
  // The landing page must render even with the backend down, so the fetch
  // degrades to empty rather than throwing the whole route.
  const products = await getProducts({
    // `freshness` excludes NULL last_confirmed_at, which matters: ordering by
    // -last_confirmed_at alone would sort never-confirmed rows to the top in
    // Postgres (NULLs first on DESC) — the opposite of "freshest".
    freshOnly: true,
    ordering: "-last_confirmed_at",
    pageSize: 5,
  }).catch(() => null);

  const freshest: Product[] = products?.results ?? [];

  return (
    <main>
      <Hero />
      <BrowseCategories />
      <TopShops />
      <FreshListings products={freshest} />
      <Features />
      <HowItWorks />
      <StatBand />
      <ShopBand />
      <FinalCTA />
    </main>
  );
}
