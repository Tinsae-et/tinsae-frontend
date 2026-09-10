import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { type DirectoryShop, getInitials } from "@/lib/shops-data";
import { cn } from "@/lib/utils";

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const isFilled = i < full || (i === full && half);
        return (
          <span
            key={i}
            className={isFilled ? "text-[#E8A317]" : "text-[#E2DFD6]"}
            aria-hidden
          >
            <Icon name="star" size={size} />
          </span>
        );
      })}
      <span className="text-tn-ink ml-1 text-[13px] font-extrabold">{rating.toFixed(1)}</span>
    </span>
  );
}

export function ShopCard({
  shop,
  featured = false,
}: {
  shop: DirectoryShop;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] bg-white border transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(11,11,11,0.08)]",
        featured ? "border-[#FBD9C7]" : "border-tn-hair hover:border-[#E0DDD4]",
      )}
    >
      {/* Banner */}
      <div
        className="relative h-[74px] w-full"
        style={{
          background: `linear-gradient(120deg, ${shop.color} 0%, ${shop.color}cc 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 9px, rgba(255,255,255,0.4) 9px, rgba(255,255,255,0.4) 10px)",
          }}
        />
        {featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[10.5px] font-bold text-white backdrop-blur-xs">
              <Icon name="star" size={11} className="text-yellow-400" />
              Top rated
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="-mt-[26px] flex flex-1 flex-col p-5 pt-0">
        {/* Avatar and Confirmation Badge */}
        <div className="flex items-end justify-between">
          <div
            className="flex size-[58px] shrink-0 items-center justify-center rounded-[15px] border-[3px] border-white text-[19px] font-extrabold text-white shadow-[0_4px_12px_rgba(11,11,11,0.12)]"
            style={{ backgroundColor: shop.color }}
          >
            {getInitials(shop.name)}
          </div>

          {shop.isVerified ? (
            <span className="bg-tn-green-soft text-tn-green mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold">
              <span className="bg-tn-green size-1.5 rounded-full" />
              Confirmed today
            </span>
          ) : (
            <span className="bg-tn-paper text-tn-mute border-tn-hair mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-bold">
              <span className="size-1.5 rounded-full bg-[#9A9A99]" />
              Unverified
            </span>
          )}
        </div>

        {/* Shop Name & Verified Badge */}
        <div className="mt-3.5 flex items-center gap-1.5">
          <Link
            href={`/shops/${shop.slug}`}
            className="text-tn-ink hover:text-tn-red truncate text-[18px] font-extrabold tracking-[-0.02em] transition-colors"
          >
            {shop.name}
          </Link>
          {shop.isVerified && <VerifiedBadge size={13} />}
        </div>

        {/* Ratings */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars rating={shop.rating} />
          <span className="font-tn-mono text-tn-mute text-[12.5px]">({shop.ratings})</span>
        </div>

        {/* Location */}
        <div className="text-tn-ink2 mt-2 flex items-center gap-1.5 text-[13px]">
          <Icon name="pin" size={14} className="text-tn-mute shrink-0" />
          <span>
            {shop.city} · {shop.hood} <span className="text-tn-mute">· {shop.dist} km away</span>
          </span>
        </div>

        {/* Categories & Since Year */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {shop.cats.map((cat) => (
            <span
              key={cat}
              className="bg-tn-paper text-tn-ink2 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
            >
              {cat}
            </span>
          ))}
          <span className="bg-tn-paper text-tn-ink2 rounded-full px-2.5 py-1 text-[11.5px] font-medium">
            Since {shop.memberSince}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="bg-tn-paper border-tn-hair mt-4 grid grid-cols-3 rounded-[14px] border p-3">
          <div className="border-tn-hair2 pr-2 border-r text-center">
            <p className="font-tn-mono text-tn-ink text-[15px] font-bold tracking-tight">
              {shop.listings}
            </p>
            <p className="text-tn-mute mt-0.5 text-[10.5px] font-medium tracking-wide">Listings</p>
          </div>
          <div className="border-tn-hair2 px-2 border-r text-center">
            <p className="font-tn-mono text-tn-ink text-[15px] font-bold tracking-tight">
              {shop.replyRate}%
            </p>
            <p className="text-tn-mute mt-0.5 text-[10.5px] font-medium tracking-wide">Reply rate</p>
          </div>
          <div className="pl-2 text-center">
            <p className="font-tn-mono text-tn-ink text-[15px] font-bold tracking-tight">
              ~{shop.responseTime}m
            </p>
            <p className="text-tn-mute mt-0.5 text-[10.5px] font-medium tracking-wide">Response</p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-4.5 flex items-center gap-2">
          <Pill
            kind="outline"
            size="sm"
            icon="eye"
            href={`/shops/${shop.slug}`}
            className="flex-1"
          >
            View shop
          </Pill>
          <Pill
            kind="solid"
            size="sm"
            icon={shop.telegramUsername ? "tg" : "phone"}
            href={
              shop.telegramUsername
                ? `https://t.me/${shop.telegramUsername}`
                : shop.phone
                  ? `tel:${shop.phone}`
                  : "#"
            }
            className="flex-1"
          >
            {shop.telegramUsername ? "Contact" : shop.phone ? "Call" : "Contact"}
          </Pill>
        </div>
      </div>
    </div>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="border-tn-hair overflow-hidden rounded-[20px] border bg-white">
      <div className="bg-tn-hair2 h-[74px] animate-pulse" />
      <div className="-mt-[26px] p-5 pt-0">
        <div className="flex items-end justify-between">
          <div className="bg-tn-hair2 size-[58px] animate-pulse rounded-[15px] border-[3px] border-white" />
          <div className="bg-tn-hair2 h-6 w-28 animate-pulse rounded-full" />
        </div>
        <div className="bg-tn-hair2 mt-4 h-5 w-44 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-2 h-4 w-28 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-2.5 h-4 w-36 animate-pulse rounded" />
        <div className="mt-3 flex gap-1.5">
          <div className="bg-tn-hair2 h-6 w-16 animate-pulse rounded-full" />
          <div className="bg-tn-hair2 h-6 w-16 animate-pulse rounded-full" />
        </div>
        <div className="bg-tn-hair2 mt-4 h-14 animate-pulse rounded-[14px]" />
        <div className="mt-4 flex gap-2">
          <div className="bg-tn-hair2 h-10 flex-1 animate-pulse rounded-full" />
          <div className="bg-tn-hair2 h-10 flex-1 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
