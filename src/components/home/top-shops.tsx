import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { SectionHead } from "./section-head";

export type TopShopItem = {
  name: string;
  slug: string;
  hood: string;
  city?: string;
  rating: number;
  ratings: number;
  listings: number;
  reply: number;
  dist: number;
  color: string;
  isVerified?: boolean;
};

// Design block 6. Static demo data from the design deck — fallback when backend is unavailable.
const SHOPS: TopShopItem[] = [
  { name: "Almeda Electronics", slug: "almeda-electronics", hood: "Atlas", rating: 4.9, ratings: 312, listings: 142, reply: 14, dist: 0.6, color: "#0F2A4D", isVerified: true },
  { name: "Sheba Computers", slug: "sheba-computers", hood: "Japan", rating: 4.9, ratings: 188, listings: 96, reply: 16, dist: 1.1, color: "#2D4A5E", isVerified: true },
  { name: "Axum Digital Store", slug: "axum-digital-store", hood: "Olympia", rating: 4.8, ratings: 251, listings: 104, reply: 22, dist: 1.4, color: "#3B5742", isVerified: true },
  { name: "Mosaic Tech Hub", slug: "mosaic-tech-hub", hood: "Friendship", rating: 4.8, ratings: 204, listings: 88, reply: 20, dist: 0.9, color: "#5A3E6E", isVerified: true },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function Stars({ r }: { r: number }) {
  const full = Math.round(r);
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={i < full ? "text-[#E8A317]" : "text-[#E2DFD6]"}
          aria-hidden
        >
          <Icon name="star" size={12} />
        </span>
      ))}
      <span className="text-tn-ink ml-1 text-[12.5px] font-extrabold">{r.toFixed(1)}</span>
    </span>
  );
}

export function TopShops({ shops }: { shops?: TopShopItem[] }) {
  const items = shops && shops.length > 0 ? shops.slice(0, 4) : SHOPS;

  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-[88px] lg:px-7">
      <SectionHead
        eyebrow="Verified sellers"
        title="Top-rated shops in Bole"
        href="/shops"
        link="All shops"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
        {items.map((s) => (
          <Link
            key={s.slug || s.name}
            href={`/shops/${s.slug}`}
            className="overflow-hidden rounded-[18px] border border-tn-hair bg-white transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]"
          >
            <div
              className="relative h-[62px]"
              style={{ background: `linear-gradient(120deg, ${s.color} 0%, ${s.color}cc 100%)` }}
            >
              <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, transparent 0 9px, rgba(255,255,255,0.4) 9px 10px)",
                }}
              />
            </div>
            <div className="-mt-[22px] px-[18px] pb-[18px]">
              <div
                className="inline-flex size-12 items-center justify-center rounded-[13px] border-[3px] border-white text-base font-extrabold text-white shadow-[0_4px_12px_rgba(11,11,11,0.12)]"
                style={{ background: s.color }}
              >
                {initials(s.name)}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-tn-ink truncate text-base font-extrabold tracking-[-0.02em]">
                  {s.name}
                </span>
                {s.isVerified !== false && <VerifiedBadge size={12} />}
              </div>
              <div className="mt-[7px] flex items-center gap-2">
                <Stars r={s.rating} />
                <span className="font-tn-mono text-tn-mute text-xs">({s.ratings})</span>
              </div>
              <div className="text-tn-ink2 mt-2 flex items-center gap-1.5 text-[13px]">
                <Icon name="pin" size={14} className="text-tn-mute" />
                {s.city ? `${s.city} · ${s.hood}` : `Bole · ${s.hood}`}
                <span className="text-tn-mute">· {s.dist} km</span>
              </div>
              <div className="font-tn-mono text-tn-ink2 mt-3.5 flex items-center gap-3.5 border-t border-tn-hair2 pt-3.5 text-xs">
                <span>
                  <b className="text-tn-ink">{s.listings}</b> listings
                </span>
                <span className="text-tn-hair">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-tn-green size-1.5 rounded-full" />
                  ~{s.reply}m reply
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
