import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { normalizeImageUrl } from "@/lib/format";
import { getInitials, getShopColor } from "@/lib/shops-data";
import type { Shop } from "@/lib/types";
import { SectionHead } from "./section-head";

// Design block 6: verified shops with the most products. Real data only — the
// design's stars, reply time and distance have nothing behind them yet — and
// the section hides itself when there are no verified shops to show.

export function TopShops({ shops }: { shops: Shop[] }) {
  if (shops.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-[1480px] px-6 sm:px-8 lg:mt-[88px] lg:px-12 xl:px-16">
      <SectionHead
        eyebrow="Verified sellers"
        title="Verified shops with the most in stock"
        href="/shops"
        link="See all verified shops"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
        {shops.slice(0, 4).map((shop) => {
          const color = getShopColor(shop.name);
          const logo = normalizeImageUrl(shop.logo);
          const products = shop.active_listings_count ?? 0;
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
                {shop.city && (
                  <div className="text-tn-ink2 mt-2 flex items-center gap-1.5 text-[13px]">
                    <Icon name="pin" size={14} className="text-tn-mute" />
                    <span className="truncate">{shop.city}</span>
                  </div>
                )}
                <div className="font-tn-mono text-tn-ink2 mt-3.5 border-t border-tn-hair2 pt-3.5 text-xs">
                  <b className="text-tn-ink">{products.toLocaleString()}</b>{" "}
                  {products === 1 ? "product" : "products"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
