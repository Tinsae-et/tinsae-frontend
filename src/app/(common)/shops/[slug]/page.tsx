import type { Metadata } from 'next';
import React from 'react'
import { Icon } from '../../../../../public/assets/icons/Icon'
import { Share, Star } from 'lucide-react'
import { VerifiedBadge } from '@/components/tinsae/verified-badge';
import TabsBar from '@/components/shop-profile/tabs-bar';
import { getPublicShopProducts, getShop } from '@/lib/api'
import { Pill } from '@/components/tinsae/pill'

type Stat = {
  value: string;
  label: string;
  sublabel: string;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShop(slug).catch(() => null);

  if (!shop) {
    return {
      title: 'Shop not found — Tinsae',
      description: 'The requested shop profile could not be found.',
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
      type: 'website',
      url: `/shops/${slug}`,
    },
  };
}

function initials(name: string | undefined) {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function getTimeSince(timeString:string|undefined) {
  if (!timeString) return ""
  const past = new Date(timeString);
  const now = new Date();
  const msPerMonth = 60 * 60 * 1000 * 24 * 30; // number of miliseconds in a month
  const msPerYear = 60 * 60 * 1000 * 24 * 30 * 365; // number of miliseconds in a year

  const elapsed = now.getTime() - past.getTime();

  if (elapsed < msPerYear) {
      return + Math.round(elapsed / msPerMonth) + ' mon';   
  } else {
      return + Math.round(elapsed / msPerYear ) + ' yrs ago';   
  }
}

async function ShopProfilePage({ params }: Props) {
  const { slug } = await params;
  const shop = await getShop(slug).catch((error) => {
    console.error(error);
    return null;
  });

  const listings = await getPublicShopProducts(slug, {}).then(res=>res.count).catch((error) => {
    console.error(error);
    return null;
  });


  const STATS: Stat[] = [
    { value: "98%", label: "Response rate", sublabel: "last 30 days" },
    { value: "~12 min", label: "Avg. response", sublabel: "open hours" },
    { value: listings?.toLocaleString() || "0", label: "Active listings", sublabel: "138 today" },
    { value: getTimeSince(shop?.created_at), label: "On Tinsae", sublabel: "since " + `${shop?.created_at && new Date(shop?.created_at).getFullYear()}` },
    { value: "4.9", label: "Buyer rating", sublabel: "296 reviews" },
  ];
  return (
    <section className="mx-auto min-h-screen bg-gray-50 w-full">
      <div
        className="relative h-[150px] w-full"
        style={{ background: `linear-gradient(120deg, ${"#0f2a4d"} 0%, ${"#0f2a4d"}cc 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent 0 9px, rgba(255,255,255,0.4) 9px 10px)",
          }}
        />
      </div>
      <div className="px-6 max-w-6xl mx-auto lg:px-7">
        <div className="relative flex flex-wrap max-w-6xl mx-auto items-end justify-between gap-4 pb-1">
          <div className="flex items-end gap-5">
            <div className="-mt-14 flex h-24 w-24 uppercase shrink-0 items-center justify-center self-start translate-y-5 rounded-2xl border-4 border-white bg-[#0f2a4d] text-3xl font-bold text-white shadow-lg">
              {initials(shop?.name)}
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold capitalize text-neutral-900">
                  {shop?.name}
                </h1>
                {shop?.is_verified && <VerifiedBadge/>}
                <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                  <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                  Top-rated shop
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="pin" className="h-4 w-4 text-neutral-400" />
                  Atlas Building, 2nd floor · Bole
                </span>
                <span className="text-neutral-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" className="h-4 w-4 text-neutral-400" />
                  Open today 9:00 - 19:30
                </span>
                <span className="text-neutral-300">|</span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active now
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-1">
            <Pill className="flex items-center gap-2 rounded-full border bg-white border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
              <Share className="h-4 w-4" />   
              Share
            </Pill>

            <Pill icon="tg" className="flex items-center gap-2 rounded-full  px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">
              Contact on Telegram
            </Pill>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 mx-auto max-w-6xl sm:grid-cols-5">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-r">
              <div className="font-mono text-2xl font-bold text-neutral-900">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-semibold text-neutral-800">
                {stat.label}
              </div>
              <div className="text-xs text-neutral-400">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <TabsBar/>
          
      </div>
    </section>
  )
}

export default ShopProfilePage