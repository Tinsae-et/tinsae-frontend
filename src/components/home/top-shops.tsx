import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { SectionHead } from "./section-head";
import { getShops } from "@/lib/api";
import { ShopMetrics } from "@/lib/types";

// Design block 6. Static demo data from the design deck — the shops API doesn't
// expose rating/reply-time/dist yet, so this stays on the design's dataset
// until the backend can answer it.
// const SHOPS = [
//   { name: "Almeda Electronics", hood: "Atlas", rating: 4.9, ratings: 312, listings: 142, reply: 14, dist: 0.6, color: "#0F2A4D" },
//   { name: "Sheba Computers", hood: "Japan", rating: 4.9, ratings: 188, listings: 96, reply: 16, dist: 1.1, color: "#2D4A5E" },
//   { name: "Axum Digital Store", hood: "Olympia", rating: 4.8, ratings: 251, listings: 104, reply: 22, dist: 1.4, color: "#3B5742" },
//   { name: "Mosaic Tech Hub", hood: "Friendship", rating: 4.8, ratings: 204, listings: 88, reply: 20, dist: 0.9, color: "#5A3E6E" },
// ];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("").toUpperCase();
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

export async function TopShops({statCounts}:{statCounts: ShopMetrics}) {
  const shopProductCounts = statCounts?.shop_product_count;
  const shops = await getShops()
    .then(s=>s.results.map(d=>({...d, listings: shopProductCounts?.[d.slug]})))
    .catch(()=>[])
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-[88px] lg:px-7">
      <SectionHead
        eyebrow="Verified sellers"
        title="Top-rated shops in Bole"
        href="/products"
        link="All shops"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
        {shops.map((s) => (
          <Link
            key={s.name}
            href="/products"
            className="overflow-hidden rounded-[18px] border border-tn-hair bg-white transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]"
          >
            <div
              className="relative h-[62px]"
              style={{ background: `linear-gradient(120deg, ${"#0F2A4D"} 0%, ${"#0F2A4D"}cc 100%)` }}
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
                style={{ background: "#0F2A4D" }}
              >
                {initials(s.name)}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-tn-ink truncate text-base font-extrabold capitalize tracking-[-0.02em]">
                  {s.name}
                </span>
                <VerifiedBadge size={12} />
              </div>
              <div className="mt-[7px] flex items-center gap-2">
                <Stars r={4.9} />
                <span className="font-tn-mono text-tn-mute text-xs">({4.9})</span>
              </div>
              <div className="text-tn-ink2 mt-2 flex items-center gap-1.5 text-[13px]">
                <Icon name="pin" size={14} className="text-tn-mute" />
                Bole · Atlas
                <span className="text-tn-mute">· {2.5} km</span>
              </div>
              <div className="font-tn-mono text-tn-ink2 mt-3.5 flex items-center gap-3.5 border-t border-tn-hair2 pt-3.5 text-xs">
                <span>
                  <b className="text-tn-ink">{s.listings}</b> listings
                </span>
                <span className="text-tn-hair">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-tn-green size-1.5 rounded-full" />
                  ~{34}m reply
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
