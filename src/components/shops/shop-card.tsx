import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { TrackedContactAction } from "@/components/shops/tracked-contact-action";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { normalizeImageUrl } from "@/lib/format";
import { getInitials, getShopColor } from "@/lib/shops-data";
import type { Shop } from "@/lib/types";

// Only what the API actually knows about a shop. The design's stars, reply
// rate, response time, distance and "confirmed today" have no data behind
// them yet, so they are left out rather than invented.

export function ShopCard({
  shop,
  isAuthenticated = false,
}: {
  shop: Shop;
  /** Without it the contact dialog asks a signed-in buyer to sign in. */
  isAuthenticated?: boolean;
}) {
  const color = getShopColor(shop.name);
  const logo = normalizeImageUrl(shop.logo);
  const products = shop.active_listings_count ?? 0;
  const since = shop.created_at ? new Date(shop.created_at).getFullYear() : null;

  return (
    <article className="group border-tn-hair relative flex flex-col overflow-hidden rounded-[20px] border bg-white transition-all duration-150 hover:-translate-y-1 hover:border-[#E0DDD4] hover:shadow-[0_16px_40px_rgba(11,11,11,0.08)]">
      <div
        className="relative h-[74px] w-full"
        style={{ background: `linear-gradient(120deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 9px, rgba(255,255,255,0.4) 9px, rgba(255,255,255,0.4) 10px)",
          }}
        />
      </div>

      <div className="-mt-[26px] flex flex-1 flex-col p-5 pt-0">
        <div
          className="relative flex size-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[15px] border-[3px] border-white text-[19px] font-extrabold text-white shadow-[0_4px_12px_rgba(11,11,11,0.12)]"
          style={{ backgroundColor: color }}
        >
          {logo ? (
            <Image src={logo} alt="" fill unoptimized sizes="58px" className="object-cover" />
          ) : (
            getInitials(shop.name)
          )}
        </div>

        <h2 className="mt-3.5 flex min-w-0 items-center gap-1.5">
          {/* The whole card is clickable through this link's ::after. */}
          <Link
            href={`/shops/${shop.slug}`}
            className="text-tn-ink truncate text-[18px] font-extrabold tracking-[-0.02em] transition-colors after:absolute after:inset-0 group-hover:text-tn-red"
          >
            {shop.name}
          </Link>
          <VerifiedBadge size={16} />
        </h2>

        {shop.city && (
          <p className="text-tn-ink2 mt-1.5 flex items-center gap-1 text-[13px]">
            <Icon name="pin" size={13} className="text-tn-mute shrink-0" />
            <span className="truncate">{shop.city}</span>
          </p>
        )}

        <div className="bg-tn-paper mt-4 grid grid-cols-2 rounded-[14px] px-4 py-3">
          <div>
            <p className="font-tn-mono text-tn-ink text-[17px] font-semibold">{products.toLocaleString()}</p>
            <p className="text-tn-mute mt-0.5 text-[11px] font-medium">
              {products === 1 ? "Product" : "Products"}
            </p>
          </div>
          {since && (
            <div className="border-tn-hair border-l pl-4">
              <p className="font-tn-mono text-tn-ink text-[17px] font-semibold">{since}</p>
              <p className="text-tn-mute mt-0.5 text-[11px] font-medium">On Tinsae since</p>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-4.5 flex items-center gap-2">
          <Pill kind="outline" size="sm" icon="eye" href={`/shops/${shop.slug}`} className="flex-1">
            View shop
          </Pill>
          {(shop.phone || shop.has_phone || shop.telegram_username) && (
            <TrackedContactAction
              shop={shop}
              isAuthenticated={isAuthenticated}
              size="sm"
              kind="solid"
              className="flex-1"
              label={shop.telegram_username ? "Telegram" : "Contact"}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="border-tn-hair overflow-hidden rounded-[20px] border bg-white" aria-hidden="true">
      <div className="bg-tn-hair2 h-[74px] animate-pulse" />
      <div className="-mt-[26px] p-5 pt-0">
        <div className="bg-tn-hair2 size-[58px] animate-pulse rounded-[15px] border-[3px] border-white" />
        <div className="bg-tn-hair2 mt-4 h-5 w-44 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-2.5 h-4 w-28 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-4 h-[58px] animate-pulse rounded-[14px]" />
        <div className="mt-4 flex gap-2">
          <div className="bg-tn-hair2 h-10 flex-1 animate-pulse rounded-full" />
          <div className="bg-tn-hair2 h-10 flex-1 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
