import type { MetadataRoute } from "next";

import { CATALOG_TAG, getProducts, getShops } from "@/lib/api/public";
import { SITE_URL } from "@/lib/config";

// Rebuilt at most hourly; crawlers do not need fresher than that. The reads
// below carry the same window — the page revalidates as often as its most
// eager fetch, and the catalogue's default is one minute.
export const revalidate = 3600;
const HOURLY: RequestInit = { next: { revalidate: 3600, tags: [CATALOG_TAG] } };

/** Upper bound on API pages walked per list, so a huge catalogue can't stall a crawl. */
const MAX_PAGES = 20;
const PAGE_SIZE = 100;

const STATIC_ROUTES = [
  "",
  "/products",
  "/shops",
  "/categories",
  "/how-it-works",
  "/trust-and-safety",
  "/about",
  "/careers",
  "/contact",
  "/help",
  "/terms-and-privacy",
  "/returns",
  "/press",
  "/telegram-bot",
];

async function collect<T>(
  fetchPage: (page: number) => Promise<{ results: T[]; next: string | null }>,
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchPage(page);
    items.push(...data.results);
    if (!data.next) break;
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/products" ? "daily" : "monthly",
  }));

  // Each list is independent: a backend hiccup on one still yields the other,
  // and the static routes always make it out.
  const [products, shops] = await Promise.all([
    collect((page) => getProducts({ page, pageSize: PAGE_SIZE }, HOURLY)).catch(() => []),
    collect((page) => getShops({ page, pageSize: PAGE_SIZE }, HOURLY)).catch(() => []),
  ]);

  for (const product of products) {
    entries.push({
      url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
      lastModified: product.last_confirmed_at ?? undefined,
      changeFrequency: "daily",
    });
  }
  for (const shop of shops) {
    entries.push({
      url: `${SITE_URL}/shops/${encodeURIComponent(shop.slug)}`,
      changeFrequency: "weekly",
    });
  }

  return entries;
}
