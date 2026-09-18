import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { TabsBar } from "@/components/shop-profile/tabs-bar";
import { getPublicShopProducts, getShop } from "@/lib/api";
import { Pill } from "@/components/tinsae/pill";
import { getInitials, getShopColor, SHOPS_RICH } from "@/lib/shops-data";
import type { Shop } from "@/lib/types";

type Stat = {
  value: string;
  label: string;
  sublabel: string;
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShop(slug).catch(() => null);

  if (!shop) {
    return {
      title: "Shop not found — Tinsae",
      description: "The requested shop profile could not be found.",
    };
  }

  return {
    title: `${shop.name} — Tinsae`,
    description:
      shop.description && shop.description.trim()
        ? shop.description
        : `Browse listings from ${shop.name} on Tinsae and discover verified products from this shop.`,
    alternates: {
      canonical: `/shops/${slug}`,
    },
    openGraph: {
      title: `${shop.name} — Tinsae`,
      description:
        shop.description && shop.description.trim()
          ? shop.description
          : `Browse listings from ${shop.name} on Tinsae and discover verified products from this shop.`,
      type: "website",
      url: `/shops/${slug}`,
    },
  };
}

function getTimeSince(timeString: string | undefined) {
  if (!timeString) return "1.0 yrs";
  const past = new Date(timeString);
  const now = new Date();
  const msPerMonth = 60 * 60 * 1000 * 24 * 30;
  const msPerYear = 60 * 60 * 1000 * 24 * 365;
  const elapsed = Math.max(0, now.getTime() - past.getTime());

  if (elapsed < msPerYear) {
    const mon = Math.max(1, Math.round(elapsed / msPerMonth));
    return `${mon} mon`;
  }
  const yrs = (elapsed / msPerYear).toFixed(1);
  return `${yrs} yrs`;
}

export default async function ShopProfilePage({ params }: Props) {
  const { slug } = await params;

  let shop: Shop;
  try {
    shop = await getShop(slug);
  } catch {
    notFound();
  }

  if (!shop || shop.slug !== slug) {
    notFound();
  }

  // Fetch initial page of listings server-side for indexing & fast FCP
  const initialProducts = await getPublicShopProducts(slug, {
    page: 1,
    pageSize: 12,
    ordering: "-created_at",
  }).catch(() => null);

  const matchedRich = SHOPS_RICH.find((s) => s.slug === slug);
  const brandColor = matchedRich?.color || getShopColor(shop.name);
  const initials = getInitials(shop.name);
  const totalCount = initialProducts?.count ?? 0;

  const rating = matchedRich?.rating ?? 4.9;
  const reviewsCount = matchedRich?.ratings ?? 296;
  const replyRate = matchedRich?.replyRate ?? 98;
  const responseTime = matchedRich?.responseTime ?? 12;

  const telegramUsername = matchedRich?.telegramUsername;
  const phone = shop.phone || matchedRich?.phone;

  let contactHref = "#";
  let contactLabel = "Contact on Telegram";
  let contactIcon: "tg" | "phone" = "tg";

  if (telegramUsername) {
    contactHref = `https://t.me/${telegramUsername}`;
  } else if (phone && phone.startsWith("@")) {
    contactHref = `https://t.me/${phone.slice(1)}`;
  } else if (phone) {
    contactHref = `tel:${phone}`;
    contactLabel = "Call shop";
    contactIcon = "phone";
  }

  const memberYear = shop.created_at
    ? new Date(shop.created_at).getFullYear()
    : matchedRich?.memberSince || new Date().getFullYear();

  const STATS: Stat[] = [
    { value: `${replyRate}%`, label: "Response rate", sublabel: "last 30 days" },
    { value: `~${responseTime} min`, label: "Avg. response", sublabel: "open hours" },
    {
      value: totalCount.toLocaleString(),
      label: "Active listings",
      sublabel: `${totalCount} confirmed`,
    },
    {
      value: getTimeSince(shop.created_at),
      label: "On Tinsae",
      sublabel: `since ${memberYear}`,
    },
    {
      value: rating.toFixed(1),
      label: "Buyer rating",
      sublabel: `${reviewsCount} reviews`,
    },
  ];

  return (
    <section className="bg-tn-white text-tn-ink min-h-screen w-full">
      {/* ── Cover ── */}
      <div
        className="relative h-[172px] w-full overflow-hidden"
        style={{
          background: `linear-gradient(120deg, ${brandColor} 0%, #1A4178 65%, #2D5A9E 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 16px)",
          }}
        />
        {/* Ethiopic watermark per design */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 right-8 select-none text-[114px] font-bold leading-none text-white/10"
        >
          አልመዳ
        </div>
      </div>

      {/* ── Identity Header ── */}
      <div className="mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="flex items-end gap-5">
            <div
              className="-mt-11 flex size-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white text-3xl font-extrabold text-white shadow-[0_12px_32px_rgba(11,11,11,0.14)] sm:size-28 sm:text-4xl"
              style={{ backgroundColor: brandColor }}
            >
              {initials}
            </div>

            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-tn-ink text-2xl font-extrabold tracking-[-0.03em] capitalize sm:text-[32px]">
                  {shop.name}
                </h1>
                {shop.is_verified ? (
                  <VerifiedBadge size={16} />
                ) : (
                  <span
                    className="border-tn-hair bg-tn-paper text-tn-mute inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold"
                    title="Unverified shop"
                  >
                    <span className="size-1.5 rounded-full bg-[#9A9A99]" />
                    Unverified
                  </span>
                )}
                <span className="bg-tn-red-soft text-tn-red inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold">
                  <Icon name="star" size={11} className="fill-tn-red text-tn-red" />
                  Top-rated shop
                </span>
              </div>

              <div className="text-tn-ink2 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px]">
                <span className="flex items-center gap-1.5">
                  <Icon name="pin" size={14} className="text-tn-mute shrink-0" />
                  {shop.city ? `${shop.city} · Addis Ababa` : "Bole · Addis Ababa"}
                </span>
                <span className="text-tn-hair">|</span>
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" size={14} className="text-tn-mute shrink-0" />
                  Open today 9:00 – 19:30
                </span>
                <span className="text-tn-hair">|</span>
                <span className="text-tn-green flex items-center gap-1.5 font-bold">
                  <span className="bg-tn-green size-1.5 rounded-full" />
                  Active now
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pb-1">
            <Pill
              kind="outline"
              size="md"
              icon="arrow"
              href={`/shops/${slug}`}
            >
              Share
            </Pill>

            <Pill
              kind="solid"
              size="md"
              icon={contactIcon}
              href={contactHref}
            >
              {contactLabel}
            </Pill>
          </div>
        </div>

        {/* ── Stat Strip ── */}
        <div className="border-tn-hair2 mt-7 grid grid-cols-2 gap-4 border-t py-4 sm:grid-cols-5 sm:gap-0 sm:py-5">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-3 sm:px-5 ${
                i !== 0 ? "sm:border-tn-hair2 sm:border-l" : ""
              }`}
            >
              <div className="font-tn-mono text-tn-ink text-2xl font-bold tracking-tight sm:text-[26px]">
                {stat.value}
              </div>
              <div className="text-tn-ink mt-1 text-[13px] font-extrabold tracking-tight">
                {stat.label}
              </div>
              <div className="text-tn-mute mt-0.5 text-xs">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs & Content ── */}
        <TabsBar shop={shop} initialProducts={initialProducts} />
      </div>
    </section>
  );
}