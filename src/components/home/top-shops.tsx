import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { normalizeImageUrl } from "@/lib/format";
import { getInitials, getShopColor, mapShopToDirectoryShop } from "@/lib/shops-data";
import type { Shop } from "@/lib/types";
import { SectionHead } from "./section-head";
import { RotatingGrid } from "./rotating-grid";

// Design block 6: top-rated shops. PLACEHOLDER: the API doesn't serve ratings,
// reply time or distance yet, so those come from mapShopToDirectoryShop's
// stand-ins until the backend does. The section hides itself when there are no
// verified shops to show.

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="flex gap-px" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="star"
          size={12}
          className={i < filled ? "text-[#E8A317]" : "text-[#E2DFD6]"}
        />
      ))}
    </span>
  );
}

export function TopShops({ shops }: { shops: Shop[] }) {
  if (shops.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-[1480px] px-6 sm:px-8 lg:mt-[88px] lg:px-12 xl:px-16">
      <SectionHead
        eyebrow="Verified sellers"
        title="Top-rated shops across Ethiopia"
        href="/shops"
        link="All shops"
      />
      <RotatingGrid
        label="top shops"
        pageSize={{ base: 1, sm: 2, lg: 4 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]"
        items={shops.map((shop) => {
          const color = getShopColor(shop.name);
          const logo = normalizeImageUrl(shop.logo);
          const products = shop.active_listings_count ?? 0;
          const placeholder = mapShopToDirectoryShop(shop);
          return (
            <Link
              key={shop.id}
              href={`/shops/${shop.slug}`}
              className="overflow-hidden rounded-[18px] border border-tn-hair bg-white transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]"
            >
              <div
                className="relative h-[62px]"
                style={{ background: `linear-gradient(120deg, ${color} 0%, ${color}cc 100%)` }}
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
                  className="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-[13px] border-[3px] border-white text-base font-extrabold text-white shadow-[0_4px_12px_rgba(11,11,11,0.12)]"
                  style={{ background: color }}
                >
                  {logo ? (
                    <Image src={logo} alt="" fill unoptimized sizes="48px" className="object-cover" />
                  ) : (
                    getInitials(shop.name)
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-tn-ink truncate text-base font-extrabold tracking-[-0.02em]">
                    {shop.name}
                  </span>
                  <VerifiedBadge size={12} />
                </div>
                <div
                  className="mt-[7px] flex items-center gap-2.5"
                  aria-label={`Rated ${placeholder.rating.toFixed(1)} out of 5 from ${placeholder.ratings} reviews`}
                >
                  <Stars rating={placeholder.rating} />
                  <span className="text-tn-ink text-[12.5px] font-extrabold">
                    {placeholder.rating.toFixed(1)}
                  </span>
                  <span className="font-tn-mono text-tn-mute text-xs">({placeholder.ratings})</span>
                </div>
                <div className="text-tn-ink2 mt-2 flex items-center gap-1.5 text-[13px]">
                  <Icon name="pin" size={14} className="text-tn-mute shrink-0" />
                  <span className="truncate">{shop.city || "Ethiopia"}</span>
                  <span className="text-tn-mute shrink-0">· {placeholder.dist} km</span>
                </div>
                <div className="font-tn-mono text-tn-ink2 mt-[13px] flex items-center gap-3.5 border-t border-tn-hair2 pt-[13px] text-xs">
                  <span>
                    <b className="text-tn-ink">{products.toLocaleString()}</b>{" "}
                    {products === 1 ? "listing" : "listings"}
                  </span>
                  <span className="bg-tn-hair h-3 w-px" aria-hidden />
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#1F8A5B]" aria-hidden />~
                    {placeholder.responseTime}m reply
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      />
    </section>
  );
}
