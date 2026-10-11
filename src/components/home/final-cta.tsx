import { Pill } from "@/components/tinsae/pill";
import { hasShop } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/auth/types";
import type { ShopMetrics } from "@/lib/types";
import { formatCount } from "@/lib/format";

export function FinalCTA({
  user,
  stats,
}: {
  user?: AuthUser | null;
  stats?: ShopMetrics | null;
}) {
  const isOwner = Boolean(user && hasShop(user));
  const hasCounts =
    stats?.verified_shop_products != null &&
    stats.verified_shop_products > 0 &&
    stats?.verified_shops != null &&
    stats.verified_shops > 0;

  return (
    <section className="mx-auto mt-16 max-w-[1480px] px-6 sm:px-8 lg:mt-24 lg:px-12 xl:px-16">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-7 py-14 text-center sm:px-12 lg:py-16">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 text-[340px] leading-none font-bold text-white/[0.08]"
        >
          ትንሳኤ
        </span>
        <div className="relative">
          <h2 className="text-[32px] leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-[50px]">
            Stop guessing. Start with stock
            <br className="hidden sm:block" /> you can trust.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
            {hasCounts ? (
              <>
                Browse {formatCount(stats.verified_shop_products)} live listings from{" "}
                {formatCount(stats.verified_shops)} verified shops across Ethiopia.
              </>
            ) : (
              <>Browse live listings from verified shops across Ethiopia.</>
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Pill kind="light" size="lg" iconAfter="arrow" href="/products">
              Browse listings
            </Pill>
            {isOwner ? (
              <Pill
                kind="ghost"
                size="lg"
                icon="pulse"
                href="/shop/dashboard/overview"
                className="border-white/60 text-white hover:bg-white/10"
              >
                Shop dashboard
              </Pill>
            ) : (
              <Pill
                kind="ghost"
                size="lg"
                href={user ? "/shop/onboarding" : "/signup"}
                className="border-white/60 text-white hover:bg-white/10"
              >
                List your shop
              </Pill>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
