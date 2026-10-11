import type { ShopMetrics } from "@/lib/types";
import { formatCount } from "@/lib/format";

export function StatBand({ stats }: { stats?: ShopMetrics | null }) {
  if (!stats) return null;

  const totalProducts = stats.total_products;
  const verifiedShops = stats.verified_shops;
  const verifiedProducts = stats.verified_shop_products;
  const categoriesCount = stats.category_product_count
    ? Object.keys(stats.category_product_count).length
    : 0;

  // If the endpoint fails or is unavailable, the section is hidden
  // rather than showing zeros or stale placeholders.
  if (totalProducts == null || verifiedShops == null) {
    return null;
  }

  if (totalProducts <= 0 && verifiedShops <= 0) {
    return null;
  }

  const items: [string, string][] = [
    [formatCount(totalProducts), "listings live today"],
    [formatCount(verifiedShops), "verified shops across Ethiopia"],
  ];

  if (verifiedProducts != null && verifiedProducts > 0) {
    items.push([formatCount(verifiedProducts), "from verified sellers"]);
  }

  if (categoriesCount > 0) {
    items.push([formatCount(categoriesCount), "product categories"]);
  }

  const gridColsClass =
    items.length >= 4
      ? "lg:grid-cols-4"
      : items.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-2";

  return (
    <section className="mx-auto mt-16 max-w-[1480px] px-6 sm:px-8 lg:mt-24 lg:px-12 xl:px-16">
      <div className="bg-tn-ink relative overflow-hidden rounded-3xl px-7 py-10 sm:px-12 sm:py-13">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-16 -right-10 text-[300px] leading-none font-bold text-white/[0.04]"
        >
          ትንሳኤ
        </span>
        <div className={`relative grid grid-cols-2 gap-8 ${gridColsClass}`}>
          {items.map(([n, label], i) => (
            <div
              key={label}
              className={i > 0 ? "sm:border-l sm:border-white/15 sm:pl-8 lg:pl-7" : ""}
            >
              <p className="font-tn-mono text-[32px] leading-none font-semibold tracking-[-0.03em] text-white sm:text-[46px]">
                {n}
              </p>
              <p className="mt-2.5 text-[13.5px] font-medium text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

