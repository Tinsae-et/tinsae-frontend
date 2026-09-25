import type { Metadata } from "next";
import { getProduct } from "@/lib/api/public";
import { ComparePageClient } from "@/components/compare/compare-page-client";
import type { CompareItem } from "@/lib/compare-helpers";

export const metadata: Metadata = {
  title: "Compare — Tinsae",
  description:
    "Compare price, verified shops, stock freshness, and full technical specifications side by side across Bole, Addis Ababa.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams;

  // Accept ?items=slug1,slug2 or ?slugs=slug1,slug2
  const rawParam = sp.items ?? sp.slugs;
  const slugsString = typeof rawParam === "string" ? rawParam : "";
  const slugs = slugsString
    ? slugsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  // Fetch product data fresh on page load
  const initialItems: CompareItem[] = await Promise.all(
    slugs.map(async (slug): Promise<CompareItem> => {
      try {
        const product = await getProduct(slug);
        return { isAvailable: true, product };
      } catch {
        return { isAvailable: false, slug };
      }
    }),
  );

  return (
    <main>
      <ComparePageClient initialItems={initialItems} initialSlugs={slugs} />
    </main>
  );
}
