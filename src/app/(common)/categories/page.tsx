import type { Metadata } from "next";
import Link from "next/link";
import { Shirt, Sofa, Wrench } from "lucide-react";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { ProdPlaceholder, type ProductKind } from "@/components/tinsae/prod-placeholder";
import { ProductCard } from "@/components/products/product-card";
import { getProducts, getPublicStats } from "@/lib/api";
import { formatCount, formatETB } from "@/lib/format";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Everything on Tinsae — All Categories",
  description:
    "Every verified category in Addis Ababa, in one marketplace. Electronics is live now — more verticals are on the way.",
};

type LiveCategoryConfig = {
  id: string;
  slug: string;
  label: string;
  subtitle: string;
  icon: IconName;
  placeholderKind: ProductKind;
  defaultCount: number;
  defaultFrom: number;
};

const LIVE_CATEGORIES: LiveCategoryConfig[] = [
  {
    id: "phone",
    slug: "phones",
    label: "Phones",
    subtitle: "iPhone · Samsung · Tecno",
    icon: "phone",
    placeholderKind: "phone",
    defaultCount: 142,
    defaultFrom: 8500,
  },
  {
    id: "laptop",
    slug: "laptops",
    label: "Laptops",
    subtitle: "MacBook · Dell · HP",
    icon: "laptop",
    placeholderKind: "laptop",
    defaultCount: 86,
    defaultFrom: 22000,
  },
  {
    id: "audio",
    slug: "audio",
    label: "Audio",
    subtitle: "AirPods · JBL · Sony",
    icon: "audio",
    placeholderKind: "audio",
    defaultCount: 210,
    defaultFrom: 1200,
  },
  {
    id: "tablet",
    slug: "tablets",
    label: "Tablets",
    subtitle: "iPad · Galaxy Tab",
    icon: "tablet",
    placeholderKind: "tablet",
    defaultCount: 54,
    defaultFrom: 14000,
  },
  {
    id: "accessories",
    slug: "accessories",
    label: "Accessories",
    subtitle: "Chargers · Cases · Cables",
    icon: "plug",
    placeholderKind: "phone",
    defaultCount: 320,
    defaultFrom: 350,
  },
  {
    id: "camera",
    slug: "cameras",
    label: "Cameras",
    subtitle: "Canon · Sony · GoPro",
    icon: "camera",
    placeholderKind: "camera",
    defaultCount: 38,
    defaultFrom: 18000,
  },
];

type RoadmapCategory = {
  label: string;
  sub: string;
  eta: string;
  icon: React.ReactNode;
};

const ROADMAP_CATEGORIES: RoadmapCategory[] = [
  {
    label: "Vehicles",
    sub: "Cars · Bikes · Parts",
    eta: "Q3 2026",
    icon: <Icon name="car" size={21} className="text-tn-mute" />,
  },
  {
    label: "Property",
    sub: "Rent · Sale · Land",
    eta: "Q3 2026",
    icon: <Icon name="building" size={21} className="text-tn-mute" />,
  },
  {
    label: "Fashion",
    sub: "Clothing · Shoes · Bags",
    eta: "Q4 2026",
    icon: <Shirt className="size-5 text-tn-mute" strokeWidth={1.6} />,
  },
  {
    label: "Home & Furniture",
    sub: "Furniture · Appliances",
    eta: "Q4 2026",
    icon: <Sofa className="size-5 text-tn-mute" strokeWidth={1.6} />,
  },
  {
    label: "Services",
    sub: "Repairs · Installation",
    eta: "2027",
    icon: <Wrench className="size-5 text-tn-mute" strokeWidth={1.6} />,
  },
];

export default async function CategoriesPage() {
  const [stats, trendingRes, minPrices] = await Promise.all([
    getPublicStats().catch(() => null),
    getProducts({ pageSize: 5, ordering: "-created_at" }).catch(() => null),
    Promise.all(
      LIVE_CATEGORIES.map(async (c) => {
        try {
          const res = await getProducts({
            category: c.slug,
            ordering: "price",
            pageSize: 1,
          });
          const rawPrice = Number(res?.results?.[0]?.price);
          return {
            slug: c.slug,
            price: Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : c.defaultFrom,
          };
        } catch {
          return { slug: c.slug, price: c.defaultFrom };
        }
      }),
    ),
  ]);

  const minPriceMap = new Map(minPrices.map((m) => [m.slug, m.price]));
  const trendingProducts: Product[] = trendingRes?.results ?? [];

  const verifiedShopsCount = stats?.verified_shops ?? 850;

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
              Every verified category in Addis Ababa, in one marketplace. Electronics is live now —
              more verticals are on the way.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-tn-mono text-sm text-tn-mute">
            <span>
              <strong className="font-bold text-tn-ink">{LIVE_CATEGORIES.length}</strong> categories live
            </span>
            <span className="text-tn-hair">·</span>
            <span>
              <strong className="font-bold text-tn-ink">{verifiedShopsCount}+</strong> verified shops
            </span>
            <span className="text-tn-hair">·</span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-tn-green inline-block animate-pulse" />
              stock confirmed daily
            </span>
          </div>
        </div>
      </section>

      {/* Electronics: Live Now */}
      <section className="mx-auto max-w-[1240px] px-6 pt-16 sm:px-8 lg:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-[640px]">
            <p className="mb-2 text-[13px] font-bold tracking-[0.10em] uppercase text-tn-red">
              Live now
            </p>
            <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-[1.05] text-tn-ink">
              Electronics
            </h2>
            <p className="mt-2.5 text-[15px] text-tn-mute leading-[1.6]">
              Phones, laptops, audio and more — from verified shops across Bole, with stock confirmed
              every day.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-tn-ink hover:text-tn-red transition-colors whitespace-nowrap self-start sm:self-end"
          >
            Browse all electronics
            <Icon name="arrow" size={15} className="text-tn-red" />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LIVE_CATEGORIES.map((cat) => {
            const count = stats?.category_product_count?.[cat.slug] ?? cat.defaultCount;
            const minPrice = minPriceMap.get(cat.slug) ?? cat.defaultFrom;

            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[18px] border border-tn-hair bg-white p-5 sm:p-[22px_22px_20px] transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]"
              >
                {/* Subtle Ghost Product Silhouette */}
                <div className="pointer-events-none select-none absolute -right-3 -top-2 size-[120px] opacity-[0.05] -rotate-[8deg] flex items-center justify-center">
                  <ProdPlaceholder kind={cat.placeholderKind} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex size-[50px] items-center justify-center rounded-[14px] bg-[#F7F6F2] text-tn-ink transition-colors group-hover:bg-[#F0EEE6]">
                    <Icon name={cat.icon} size={24} />
                  </span>
                  <span className="font-tn-mono text-xs font-semibold text-tn-mute">
                    {formatCount(count)} listings
                  </span>
                </div>

                <h3 className="mt-4 text-[21px] font-extrabold tracking-[-0.02em] text-tn-ink">
                  {cat.label}
                </h3>
                <p className="mt-1 text-[13px] text-tn-mute line-clamp-1">{cat.subtitle}</p>

                <div className="mt-4 pt-3.5 border-t border-tn-hair2 flex items-center justify-between">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-[10.5px] font-bold tracking-[0.04em] uppercase text-tn-mute">
                      From
                    </span>
                    <span className="font-tn-mono text-[15px] font-semibold text-tn-red">
                      {formatETB(minPrice)}
                    </span>
                  </span>
                  <Icon
                    name="arrow"
                    size={17}
                    className="text-tn-ink transition-transform group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </div>
              </Link>
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
              More marketplaces, coming to Addis
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
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-[13px] bg-[#F7F6F2]">
                    {cat.icon}
                  </span>
                  <span className="font-tn-mono text-[10.5px] font-bold tracking-[0.06em] text-tn-mute">
                    {cat.eta}
                  </span>
                </div>

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
