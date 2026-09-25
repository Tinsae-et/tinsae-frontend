import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { RotatingEyebrow } from "./rotating-eyebrow";
import { OrbitRing } from "./orbit-ring";
import { DashboardMock } from "./dashboard-mock";
import { TrustStrip } from "./trust-strip";
import type { NavCategory } from "@/lib/nav-categories";

import { hasShop } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/auth/types";
import type { ShopMetrics } from "@/lib/types";
import { formatCount } from "@/lib/format";

const POPULAR_SLUGS = ["phones", "laptops", "audio", "cameras"];

// PLACEHOLDER: decorative shop avatars. Replace with real verified shops.
const SHOP_AVATARS = [
  { initial: "A", color: "#0F2A4D" },
  { initial: "M", color: "#3B5742" },
  { initial: "K", color: "#7A2E2E" },
  { initial: "X", color: "#2D4A5E" },
  { initial: "G", color: "#5A4A2E" },
];

export function Hero({
  user,
  stats,
  categories,
}: {
  user?: AuthUser | null;
  stats?: ShopMetrics | null;
  categories: NavCategory[];
}) {
  const popular = categories.filter((c) => POPULAR_SLUGS.includes(c.slug));
  const isOwner = Boolean(user && hasShop(user));

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_85%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_55%)]">
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 items-center gap-12 px-6 pt-12 pb-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-12 xl:px-16 lg:pt-[80px]">
        <div className="min-w-0">
          <RotatingEyebrow />

          <h1 className="text-tn-ink mt-6 text-[40px] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[52px] lg:text-[68px] lg:leading-[0.99]">
            Find it.
            <br />
            Confirm it&rsquo;s
            <br />
            <span className="text-tn-red">in stock.</span> Buy it.
          </h1>

          <p className="text-tn-mute mt-6 max-w-[500px] text-[17px] leading-relaxed font-medium sm:text-[18.5px]">
            Compare electronics prices across verified Bole shops that reconfirm their stock every
            single day. No more wasted trips.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">
              Start browsing
            </Pill>
            {isOwner ? (
              <Pill kind="outline" size="lg" icon="pulse" href="/shop/dashboard/overview">
                Dashboard
              </Pill>
            ) : (
              <Pill
                kind="outline"
                size="lg"
                icon="tg"
                href={user ? "/shop/onboarding" : "/signup"}
              >
                List your shop
              </Pill>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-tn-mute text-[12.5px] font-bold">Popular:</span>
            {popular.map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="border-tn-hair text-tn-ink2 hover:border-tn-ink inline-flex h-[34px] items-center gap-1.5 rounded-full border bg-white px-3 text-[13px] font-bold transition-colors"
              >
                <Icon name={c.icon} size={15} className="text-tn-red" />
                {c.label}
              </Link>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-[18px]">
            <div className="flex">
              {SHOP_AVATARS.map((s, i) => (
                <span
                  key={s.initial}
                  className="flex size-[34px] items-center justify-center rounded-full border-[2.5px] border-white text-[11px] font-bold text-white"
                  style={{ background: s.color, marginLeft: i ? -10 : 0 }}
                >
                  {s.initial}
                </span>
              ))}
            </div>
            <p className="text-tn-ink2 text-[13.5px] leading-snug">
              {stats?.verified_shops != null && stats.verified_shops > 0 ? (
                <b className="text-tn-ink">{formatCount(stats.verified_shops)} verified shops</b>
              ) : (
                <b className="text-tn-ink">Verified shops</b>
              )}{" "}
              in Bole
              <br />
              <span className="text-tn-mute">Stock reconfirmed daily</span>
            </p>
          </div>
        </div>

        <OrbitRing />
      </div>

      <DashboardMock />
      <TrustStrip />
    </section>
  );
}
