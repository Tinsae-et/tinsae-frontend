import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { SectionHead } from "./section-head";
import type { NavCategory } from "@/lib/nav-categories";
import { formatCount } from "@/lib/format";
import type { ShopMetrics } from "@/lib/types";

/** One row of tiles; the section's "All categories" link lists everything. */
const FEATURED_COUNT = 6;

export function BrowseCategories({
  stats,
  categories,
}: {
  stats?: ShopMetrics | null;
  categories: NavCategory[];
}) {
  const categoryCounts = stats?.category_product_count;
  // The busiest categories first; ties keep the backend's order.
  const featured = [...categories]
    .sort((a, b) => (categoryCounts?.[b.slug] ?? 0) - (categoryCounts?.[a.slug] ?? 0))
    .slice(0, FEATURED_COUNT);

  return (
    <section className="mx-auto mt-16 max-w-[1480px] px-6 sm:px-8 lg:mt-[92px] lg:px-12 xl:px-16">
      <SectionHead
        eyebrow="Browse"
        title="Shop by category"
        href="/categories"
        link="All categories"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3.5">
        {featured.map((c) => {
          const count = categoryCounts?.[c.slug];
          const hasCount = count != null && count > 0;
          return (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="flex flex-col gap-4 rounded-2xl border border-tn-hair bg-white p-4 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)] lg:p-5"
            >
              <span className="bg-tn-paper inline-flex size-11 items-center justify-center rounded-[13px] lg:size-[46px]">
                <Icon name={c.icon} size={22} className="text-tn-ink" />
              </span>
              <span>
                <span className="text-tn-ink block text-[15px] font-extrabold tracking-tight">
                  {c.label}
                </span>
                <span className="font-tn-mono text-tn-mute mt-[3px] block text-xs">
                  {hasCount ? `${formatCount(count)} listings` : "Browse all"}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
