import { getProducts, getPublicStats, getShops } from "@/lib/api/public";
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
import { getCurrentUser } from "@/lib/auth/session";
import { getNavCategories } from "@/lib/nav-categories";

export default async function Home() {
  const user = await getCurrentUser();

  // The landing page must render even with the backend down, so the fetch
  // degrades to empty rather than throwing the whole route.
  const [products, stats, shopsData, categories] = await Promise.all([
    getProducts({
      // `freshness` excludes NULL last_confirmed_at, which matters: ordering by
      // -last_confirmed_at alone would sort never-confirmed rows to the top in
      // Postgres (NULLs first on DESC) — the opposite of "freshest".
      freshOnly: true,
      ordering: "-last_confirmed_at",
      pageSize: 6,
    }).catch(() => null),
    getPublicStats().catch(() => null),
    getShops({
      verifiedOnly: true,
      ordering: "-active_listings_count",
      pageSize: 4,
    }).catch(() => null),
    getNavCategories(),
  ]);

  const freshest: Product[] = products?.results ?? [];

  const topShops = shopsData?.results ?? [];

  return (
    <main>
      <Hero user={user} stats={stats} categories={categories} />
      <BrowseCategories stats={stats} categories={categories} />
      <TopShops shops={topShops} />
      <FreshListings products={freshest} />
      <Features />
      <HowItWorks />
      <StatBand stats={stats} />
      <ShopBand />
      <FinalCTA user={user} stats={stats} />
    </main>
  );
}

