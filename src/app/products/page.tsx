import { getProducts, type ProductQuery } from "@/lib/api";
import { ProductGrid, PRODUCTS_PAGE_SIZE } from "@/components/products/product-grid";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

export const metadata = {
  title: "Browse listings — Tinsae",
  description: "Electronics from verified shops across Bole, Addis Ababa.",
};

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, category } = await searchParams;
  const query: ProductQuery = { q, category };

  const data = await getProducts({ ...query, pageSize: PRODUCTS_PAGE_SIZE }).catch(() => null);

  return (
    <main className="mx-auto max-w-[1240px] px-6 py-10 lg:py-14">
      <header className="mb-8">
        <p className="text-tn-red mb-3 text-[13px] font-bold tracking-[0.10em] uppercase">
          {q ? "Search results" : category ? "Category" : "Browse"}
        </p>
        <h1 className="text-tn-ink text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[40px]">
          {q ? `“${q}”` : category ? category.replace(/-/g, " ") : "All listings in Bole"}
        </h1>
        {data && (
          <p className="text-tn-mute font-tn-mono mt-3 text-[13px] tracking-wide">
            {data.count} {data.count === 1 ? "listing" : "listings"}
          </p>
        )}
      </header>

      {!data ? (
        <ErrorState />
      ) : data.results.length === 0 ? (
        <EmptyState q={q} category={category} />
      ) : (
        <ProductGrid initialProducts={data.results} totalCount={data.count} query={query} />
      )}
    </main>
  );
}

function ErrorState() {
  return (
    <div
      role="alert"
      className="border-tn-hair rounded-2xl border border-dashed px-6 py-16 text-center"
    >
      <span className="bg-tn-red-soft text-tn-red mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
        <Icon name="pulse" size={26} />
      </span>
      <h2 className="text-tn-ink text-lg font-extrabold">Couldn&rsquo;t reach the marketplace</h2>
      <p className="text-tn-mute mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        The listings service isn&rsquo;t responding right now. This is usually temporary — try
        again in a moment.
      </p>
      <div className="mt-6 flex justify-center">
        <Pill kind="outline" size="md" href="/products">
          Try again
        </Pill>
      </div>
    </div>
  );
}

function EmptyState({ q, category }: { q?: string; category?: string }) {
  return (
    <div className="border-tn-hair rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="bg-tn-paper text-tn-mute mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
        <Icon name="search" size={26} />
      </span>
      <h2 className="text-tn-ink text-lg font-extrabold">
        {q ? `No listings match “${q}”` : "No listings here yet"}
      </h2>
      <p className="text-tn-mute mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        {q || category
          ? "Try a broader search, or browse everything verified shops in Bole have listed."
          : "Listings appear as soon as verified shops publish their stock."}
      </p>
      {(q || category) && (
        <div className="mt-6 flex justify-center">
          <Pill kind="solid" size="md" iconAfter="arrow" href="/products">
            Browse all listings
          </Pill>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
