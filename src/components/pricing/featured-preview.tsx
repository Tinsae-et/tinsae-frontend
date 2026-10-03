import { Zap } from "lucide-react";

import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { PREVIEW_SHOPS } from "./data";

export function FeaturedPreview() {
  const featuredShop = PREVIEW_SHOPS.find((s) => s.featured);
  const standardShops = PREVIEW_SHOPS.filter((s) => !s.featured);

  return (
    <section className="px-4 sm:px-6">
      <div className="bg-tn-paper mx-auto grid max-w-[1020px] items-center gap-8 rounded-2xl border border-tn-hair/80 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-10">
        {/* Left copy */}
        <div>
          <p className="text-tn-red mb-3 text-[11px] font-extrabold tracking-[0.14em] uppercase">
            What Featured looks like
          </p>
          <h2 className="text-tn-ink max-w-md text-2xl leading-[1.12] font-extrabold tracking-[-0.03em] sm:text-[28px] lg:text-[31px]">
            Top of the results, with a ribbon that earns trust.
          </h2>
          <p className="text-tn-mute mt-4 max-w-md text-sm leading-relaxed sm:text-[14.5px]">
            Featured shops appear above standard listings on the exact searches
            buyers are already making — clearly marked, never disguised as
            anything but a verified shop putting its best price forward.
          </p>
        </div>

        {/* Right mockup */}
        <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_12px_28px_rgba(11,11,11,0.06)] sm:p-5">
          <p className="font-tn-mono text-tn-mute mb-3 text-[10px] sm:text-[11px]">
            iPhone 15 Pro · 256GB · 5 shops
          </p>

          {/* Featured Shop Card */}
          {featuredShop && (
            <div className="relative mb-2.5 rounded-xl border border-[#FCD8CD] bg-[#FFF8F5] p-3 sm:p-3.5">
              <div className="mb-2 flex items-center gap-1 text-[9px] font-extrabold tracking-[0.06em] uppercase text-tn-red">
                <Zap className="size-2.5 fill-tn-red" />
                <span>FEATURED</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <span
                    className="flex size-7.5 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold text-white sm:size-8"
                    style={{ backgroundColor: featuredShop.initialsBg }}
                  >
                    {featuredShop.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-bold sm:text-[13px]">
                        {featuredShop.name}
                      </span>
                      <VerifiedBadge size={13} />
                    </div>
                    <p className="font-tn-mono text-tn-mute text-[10px] sm:text-[11px]">
                      • {featuredShop.location}
                    </p>
                  </div>
                </div>
                <span className="font-tn-mono text-tn-red text-xs font-bold whitespace-nowrap sm:text-[13px]">
                  {featuredShop.price}
                </span>
              </div>
            </div>
          )}

          {/* Standard Shops */}
          {standardShops.map((shop) => (
            <div
              key={shop.name}
              className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-tn-hair2 bg-white p-3 last:mb-0 sm:p-3.5"
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <span
                  className="flex size-7.5 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold text-white sm:size-8"
                  style={{ backgroundColor: shop.initialsBg }}
                >
                  {shop.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold sm:text-[13px]">
                      {shop.name}
                    </span>
                    <VerifiedBadge size={13} />
                  </div>
                  <p className="font-tn-mono text-tn-mute text-[10px] sm:text-[11px]">
                    • {shop.location}
                  </p>
                </div>
              </div>
              <span className="font-tn-mono text-tn-ink text-xs font-bold whitespace-nowrap sm:text-[13px]">
                {shop.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
