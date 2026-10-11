import type { Metadata } from "next";
import Link from "next/link";
import { Shirt, Wrench } from "lucide-react";
import { Icon } from "@/components/tinsae/icon";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { ProductCard } from "@/components/products/product-card";
import { getProducts, getPublicStats } from "@/lib/api/public";
import { formatCount, formatETB } from "@/lib/format";
import type { Product } from "@/lib/types";
import { getNavCategories } from "@/lib/nav-categories";

export const metadata: Metadata = {
  title: "Everything on Tinsae — All Categories",
  description:
    "Every verified category across Ethiopia, in one marketplace. Electronics and vehicles are live now — more verticals are on the way.",
};

type RoadmapCategory = {
  label: string;
  sub: string;
  icon: React.ReactNode;
};

const ROADMAP_CATEGORIES: RoadmapCategory[] = [
  {
    label: "Property",
    sub: "Rent · Sale · Land",
    icon: <Icon name="building" size={21} className="text-tn-mute" />,
  },
  {
    label: "Fashion",
    sub: "Clothing · Shoes · Bags",
    icon: <Shirt className="size-5 text-tn-mute" strokeWidth={1.6} />,
  },
  {
    label: "Services",
    sub: "Repairs · Installation",
    icon: <Wrench className="size-5 text-tn-mute" strokeWidth={1.6} />,
  },
];

export default async function CategoriesPage() {
  const liveCategories = await getNavCategories();
  const [stats, trendingRes, minPrices] = await Promise.all([
    getPublicStats().catch(() => null),
    getProducts({ pageSize: 5, ordering: "-created_at" }).catch(() => null),
    Promise.all(
      liveCategories.map(async (c) => {
        try {
          const res = await getProducts({
            category: c.slug,
            ordering: "price",
            pageSize: 1,
          });
          const rawPrice = Number(res?.results?.[0]?.price);
          return {
            slug: c.slug,
            price: Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : null,
          };
        } catch {
          return { slug: c.slug, price: null };
        }
      }),
    ),
  ]);

  const minPriceMap = new Map(minPrices.map((m) => [m.slug, m.price]));
  const trendingProducts: Product[] = trendingRes?.results ?? [];

  // Real figures only: when stats are unavailable these are hidden rather
  // than replaced with invented counts.
  const verifiedShopsCount = stats?.verified_shops ?? null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-tn-hair2 bg-[radial-gradient(120%_110%_at_88%_-25%,#FFF1EB_0%,rgba(255,241,235,0)_52%)] bg-white">
        <div className="mx-auto max-w-[1240px] px-6 py-7 sm:px-8 sm:py-9">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-neutral-700 transition-colors">
              Home
            </Link>
            <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
            <span className="text-neutral-700 font-medium">Browse all</span>
          </nav>

          {/* Heading and Intro */}
          <div className="mt-5 max-w-[720px]">
            <h1 className="text-[40px] sm:text-[54px] font-extrabold tracking-[-0.04em] leading-[0.98] text-tn-ink">
              Everything on Tinsae
            </h1>
            <p className="mt-4 max-w-[600px] text-base sm:text-[17px] leading-[1.55] text-tn-ink2">
              Every verified category across Ethiopia, in one marketplace. Electronics and vehicles are
              live now — more verticals are on the way.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-tn-mono text-sm text-tn-mute">
            <span>
              <strong className="font-bold text-tn-ink">{liveCategories.length}</strong> categories live
            </span>
            {verifiedShopsCount !== null && (
              <>
                <span className="text-tn-hair">·</span>
                <span>
                  <strong className="font-bold text-tn-ink">{verifiedShopsCount}</strong> verified shops
                </span>
              </>
            )}
            <span className="text-tn-hair">·</span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-tn-green inline-block animate-pulse" />
              stock confirmed daily
            </span>
          </div>
        </div>
      </section>

      {/* Live categories */}
      <section className="mx-auto max-w-[1240px] px-6 pt-16 sm:px-8 lg:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-[640px]">
            <p className="mb-2 text-[13px] font-bold tracking-[0.10em] uppercase text-tn-red">
              Live now
            </p>
            <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-[1.05] text-tn-ink">
              Shop by category
            </h2>
            <p className="mt-2.5 text-[15px] text-tn-mute leading-[1.6]">
              Electronics and vehicles from verified shops across Ethiopia, with stock confirmed every
              day.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-tn-ink hover:text-tn-red transition-colors whitespace-nowrap self-start sm:self-end"
          >
            Browse all listings
            <Icon name="arrow" size={15} className="text-tn-red" />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveCategories.map((cat) => {
            const count = stats?.category_product_count?.[cat.slug] ?? null;
            const minPrice = minPriceMap.get(cat.slug) ?? null;

            const subcategories = cat.children ?? [];
            const hasSubcategories = subcategories.length > 0;
            return (
              // The whole card links to the category (a stretched link under
              // the content). A group ("Vehicles & Auto") opens a floating
              // card on hover or focus, anchored over this one and as tall as
              // its subcategory list needs: nothing is cut off and nothing on
              // the page moves. `hover:z-30` lifts it above the cards after it.
              <div
                key={cat.slug}
                className="group/cat relative hover:z-30 focus-within:z-30"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-[18px] border border-tn-hair bg-white p-5 sm:p-[22px_22px_20px] transition-[transform,box-shadow,border-color] duration-150 group-hover/cat:-translate-y-[3px] group-hover/cat:border-[#E0DDD4] group-hover/cat:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    aria-label={cat.label}
                    className="absolute inset-0 z-[1] rounded-[18px]"
                  />

                  {/* Subtle Ghost Product Silhouette */}
                  <div className="pointer-events-none select-none absolute -right-3 -top-2 size-[120px] opacity-[0.05] -rotate-[8deg] flex items-center justify-center">
                    <ProdPlaceholder kind={kindForSlug(cat.slug)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-[50px] items-center justify-center rounded-[14px] bg-[#F7F6F2] text-tn-ink transition-colors group-hover/cat:bg-[#F0EEE6]">
                      <Icon name={cat.icon} size={24} />
                    </span>
                    {count !== null && (
                      <span className="font-tn-mono text-xs font-semibold text-tn-mute">
                        {formatCount(count)} listings
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 flex items-center gap-1.5 text-[21px] font-extrabold tracking-[-0.02em] text-tn-ink">
                    {cat.label}
                    {hasSubcategories && (
                      <Icon name="chevd" size={16} className="text-tn-mute" />
                    )}
                  </h3>
                  <p className="mt-1 text-[13px] text-tn-mute line-clamp-1">{cat.subtitle}</p>

                  <div className="mt-4 pt-3.5 border-t border-tn-hair2 flex items-center justify-between">
                    {minPrice !== null ? (
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-[10.5px] font-bold tracking-[0.04em] uppercase text-tn-mute">
                          From
                        </span>
                        <span className="font-tn-mono text-[15px] font-semibold text-tn-red">
                          {formatETB(minPrice)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[13px] font-semibold text-tn-mute">Browse</span>
                    )}
                    <Icon
                      name="arrow"
                      size={17}
                      className="text-tn-ink transition-transform group-hover/cat:translate-x-1"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* The group's floating card. Shown after a short rest
                    (`delay-100`) so sweeping across the grid never flashes it. */}
                {hasSubcategories && (
                  <div
                    role="menu"
                    aria-label={`${cat.label} subcategories`}
                    className="invisible absolute inset-x-0 -top-[3px] z-10 rounded-[18px] border border-[#E0DDD4] bg-white p-5 opacity-0 shadow-[0_26px_60px_rgba(11,11,11,0.16)] transition-[opacity,visibility] duration-150 sm:p-[22px_22px_16px] group-focus-within/cat:visible group-focus-within/cat:opacity-100 group-hover/cat:visible group-hover/cat:opacity-100 group-hover/cat:delay-100"
                  >
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="group/head flex items-center justify-between"
                    >
                      <span className="inline-flex size-[50px] items-center justify-center rounded-[14px] bg-tn-red-soft text-tn-red">
                        <Icon name={cat.icon} size={24} />
                      </span>
                      {count !== null && (
                        <span className="font-tn-mono text-xs font-semibold text-tn-mute">
                          {formatCount(count)} listings
                        </span>
                      )}
                    </Link>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="mt-4 flex items-center gap-1.5 text-[21px] font-extrabold tracking-[-0.02em] text-tn-red"
                    >
                      {cat.label}
                      <Icon name="chevd" size={16} className="rotate-180" />
                    </Link>

                    <div className="-mx-2 mt-3">
                      {subcategories.map((child) => {
                        const childCount = stats?.category_product_count?.[child.slug];
                        return (
                          <Link
                            key={child.slug}
                            role="menuitem"
                            href={`/products?category=${child.slug}`}
                            className="group/sub flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-tn-paper"
                          >
                            <Icon
                              name={child.icon}
                              size={17}
                              className="shrink-0 text-tn-mute group-hover/sub:text-tn-red"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-bold text-tn-ink transition-colors group-hover/sub:text-tn-red">
                                {child.label}
                              </span>
                              {child.subtitle && (
                                <span className="block truncate text-[12px] text-tn-mute">
                                  {child.subtitle}
                                </span>
                              )}
                            </span>
                            {childCount ? (
                              <span className="font-tn-mono shrink-0 text-[11.5px] text-tn-mute">
                                {formatCount(childCount)}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Property: renters and buyers go straight to their side. */}
                    {cat.saleOrRent && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          ["rent", "For rent"],
                          ["sale", "For sale"],
                        ].map(([value, label]) => (
                          <Link
                            key={value}
                            href={`/products?category=${cat.slug}&spec_listing_type=${value}`}
                            className="border-tn-hair text-tn-ink hover:border-tn-ink rounded-full border py-2 text-center text-[13px] font-bold transition-colors"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="mt-2 flex items-center justify-between border-t border-tn-hair2 pt-3.5 text-[13px] font-extrabold text-tn-ink transition-colors hover:text-tn-red"
                    >
                      Shop all {cat.label}
                      <Icon name="arrow" size={17} strokeWidth={2} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending / Popular right now */}
      <section className="mx-auto max-w-[1240px] px-6 pt-16 sm:px-8 lg:pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[13px] font-bold tracking-[0.10em] uppercase text-tn-red">
              Trending
            </p>
            <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-[1.05] text-tn-ink">
              Popular right now
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-tn-ink hover:text-tn-red transition-colors whitespace-nowrap"
          >
            See all
            <Icon name="arrow" size={15} className="text-tn-red" />
          </Link>
        </div>

        {trendingProducts.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-dashed border-tn-hair px-6 py-14 text-center">
            <p className="text-base font-extrabold text-tn-ink">No confirmed listings yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-tn-mute leading-relaxed">
              Listings appear here once shops confirm their stock over Telegram.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
            {trendingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Roadmap Band */}
      <section className="mt-20 border-y border-tn-hair2 bg-[#F7F6F2] py-16">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
          <div className="max-w-[640px]">
            <p className="mb-2 text-[13px] font-bold tracking-[0.10em] uppercase text-[#B8741F]">
              On the roadmap
            </p>
            <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-[1.05] text-tn-ink">
              More marketplaces, coming to Ethiopia
            </h2>
            <p className="mt-2.5 text-[15px] text-tn-mute leading-[1.6]">
              Tinsae is built category-agnostic. Each new vertical launches with the same verified
              shops and confirmed-stock promise.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {ROADMAP_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col gap-3 rounded-2xl border border-dashed border-tn-hair bg-white p-5 transition-shadow"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-[13px] bg-[#F7F6F2]">
                  {cat.icon}
                </span>

                <div className="mt-1">
                  <h3 className="text-base font-extrabold tracking-[-0.02em] text-tn-ink2">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-xs text-tn-mute leading-relaxed">{cat.sub}</p>
                </div>

                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-xs font-bold text-tn-mute">
                  <span className="size-2 rounded-full bg-[#B8741F]" />
                  Coming soon
                </span>
              </div>
            ))}
          </div>

          {/* Waitlist Banner */}
          <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-tn-hair bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#229ED9]/10 text-[#229ED9]">
                <Icon name="tg" size={24} />
              </span>
              <div>
                <p className="text-sm sm:text-[15px] font-bold text-tn-ink">
                  Run a shop in one of these categories?
                </p>
                <p className="text-xs sm:text-sm text-tn-mute mt-0.5">
                  Get listed early and we&apos;ll onboard you the moment your vertical goes live.
                </p>
              </div>
            </div>

            <a
              href="https://t.me/TinsaeStockBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-tn-ink px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-black hover:shadow-md shrink-0 self-start sm:self-center"
            >
              <Icon name="tg" size={15} />
              Join the waitlist
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
