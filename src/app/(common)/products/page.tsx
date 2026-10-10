import { Suspense } from "react";
import { getCategories, getCategorySchema, getProductFacets, getProducts } from "@/lib/api/public";
import { ProductsBrowser } from "@/components/products/products-browser";
import type { CategoryOption } from "@/components/products/filter-controls";
import { toNavCategories } from "@/lib/nav-categories";
import { ProductCardSkeleton } from "@/components/products/product-card";
import { PRODUCTS_PAGE_SIZE } from "@/components/products/product-grid";
import { filtersFromSearchParams, filtersToProductQuery } from "@/lib/filters";

export const metadata = {
  title: "Browse listings — Tinsae",
  description: "Electronics and vehicles from verified shops across Addis Ababa.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") params.set(key, value);
  }

  // The URL is the single source of truth: parse it into filters, server-render
  // the first page, and let the client take over for subsequent changes.
  const filters = filtersFromSearchParams(params);
  const [data, categories, priceBounds, initialSchema, initialFacets] = await Promise.all([
    // Always page 1: the client owns the scroll cursor from here on, so an old
    // `?page=3` link degrades to the top of the list rather than desyncing it.
    getProducts({
      ...filtersToProductQuery(filters),
      page: 1,
      pageSize: PRODUCTS_PAGE_SIZE,
    }).catch(() => null),
    getCategories().catch(() => null),
    (async () => {
      // True price bounds for the slider track, from the whole catalog — two
      // tiny page_size=1 requests ordered by price. Unfiltered so the range
      // covers the full market regardless of the current query.
      const [min, max] = await Promise.all([
        getProducts({ ordering: "price", pageSize: 1 }).catch(() => null),
        getProducts({ ordering: "-price", pageSize: 1 }).catch(() => null),
      ]);
      const lo = Number(min?.results[0]?.price);
      const hi = Number(max?.results[0]?.price);
      return Number.isFinite(lo) && Number.isFinite(hi) && lo <= hi
        ? { min: lo, max: hi }
        : undefined;
    })(),
    // The spec filters' schema (null for a parent or no category) and the
    // counts beside every option, so the rail renders complete on first paint.
    filters.category ? getCategorySchema(filters.category).catch(() => null) : null,
    getProductFacets(filtersToProductQuery(filters)).catch(() => null),
  ]);

  const initial = data ? { products: data.results, total: data.count } : null;
  // Backend-owned: an outage shows no category filter rather than a stale list.
  // Each top-level category is followed by its subcategories, which carry
  // their parent so the page can show chips and a breadcrumb for them.
  const categoryOptions: CategoryOption[] = toNavCategories(categories?.results ?? []).flatMap(
    (c) => [
      { slug: c.slug, name: c.label, icon: c.icon },
      ...(c.children ?? []).map((child) => ({
        slug: child.slug,
        name: child.label,
        icon: child.icon,
        parentSlug: c.slug,
        parentName: c.label,
      })),
    ],
  );

  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <ProductsBrowser
          categories={categoryOptions}
          initial={initial}
          priceBounds={priceBounds}
          initialSchema={initialSchema}
          initialFacets={initialFacets}
        />
      </Suspense>
    </main>
  );
}

function PageSkeleton() {
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
