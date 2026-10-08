import { Suspense } from "react";
import type { Metadata } from "next";
import {
  DIRECTORY_GUTTER,
  DirectoryControls,
  DirectoryHeader,
  DirectoryResults,
  ListYourShopBand,
  ResultsSkeleton,
} from "@/components/shops/shop-directory";
import { getShopAreas } from "@/lib/api/public";
import { directoryHref, parseDirectoryQuery } from "@/lib/shop-directory";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseDirectoryQuery(await searchParams);
  const where = query.area ? ` in ${query.area}` : "";
  const title = `Verified electronics shops${where} — Tinsae`;
  const description = `Electronics shops${where} that passed Tinsae's manual verification. See each shop's products and how long it's been on Tinsae, then visit the one you trust.`;
  return {
    title,
    description,
    alternates: { canonical: directoryHref(query) },
    openGraph: { title, description, url: directoryHref(query), siteName: "Tinsae", type: "website" },
  };
}

export default async function ShopsPage({ searchParams }: Props) {
  const query = parseDirectoryQuery(await searchParams);
  // Without areas the page still works: only the "All areas" chip shows.
  const areas = await getShopAreas().catch(() => []);

  return (
    <main className="text-tn-ink min-h-screen bg-white pb-20">
      <DirectoryHeader query={query} />
      <DirectoryControls query={query} areas={areas} />
      <section className={DIRECTORY_GUTTER + " pt-7"}>
        {/* Keyed on the query so changing area, sort or page shows the
            skeleton instead of leaving the old results on screen. */}
        <Suspense key={directoryHref(query)} fallback={<ResultsSkeleton />}>
          <DirectoryResults query={query} />
        </Suspense>
      </section>
      <ListYourShopBand />
    </main>
  );
}
