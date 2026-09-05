import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { SectionHead } from "./section-head";
import { getCategories } from "@/lib/api";
import { ShopMetrics } from "@/lib/types";

// Design block 5. Static for now: the design's six categories with their demo
// counts. The backend only seeds Phones + Accessories and exposes no
// per-category counts yet, so we keep this on the design dataset until it does.
export async function BrowseCategories({statCounts}:{statCounts: ShopMetrics}) {
  const categoryCounts = statCounts.category_product_count;
  const categories = await getCategories()
    .then((c) => c.results.map(d => ({...d, count: categoryCounts?.[d.slug]})))
    .catch(() => []);
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-[92px] lg:px-7">
      <SectionHead
        eyebrow="Browse"
        title="Shop by category"
        href="/products"
        link="All categories"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3.5">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="flex flex-col gap-4 rounded-2xl border border-tn-hair bg-white p-4 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)] lg:p-5"
          >
            <span className="bg-tn-paper inline-flex size-11 items-center justify-center rounded-[13px] lg:size-[46px]">
              <Icon name={"phone"} size={22} className="text-tn-ink" />
            </span>
            <span>
              <span className="text-tn-ink block text-[15px] font-extrabold tracking-tight">
                {c.name}
              </span>
              <span className="font-tn-mono text-tn-mute mt-[3px] block text-xs">
                {c.count} listings
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
