"use client";

import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { type DirectoryShop, getInitials } from "@/lib/shops-data";
import { cn } from "@/lib/utils";

interface ShopItemProps {
  item: DirectoryShop;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function ShopItem({ item, isSelected = false, onSelect }: ShopItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3.5 border-b border-tn-hair2 transition-colors cursor-pointer",
        isSelected ? "bg-tn-red-soft border-l-[3px] border-l-tn-red" : "bg-white hover:bg-tn-paper",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="size-11 shrink-0 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs"
          style={{ backgroundColor: item.color }}
        >
          {getInitials(item.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-tn-ink text-[14px] truncate">{item.name}</span>
            {item.isVerified && <VerifiedBadge size={12} />}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-tn-mute">
            <span className="flex items-center font-bold text-tn-ink gap-0.5">
              <Icon name="star" className="text-[#E8A317]" size={13} /> {item.rating.toFixed(1)}
            </span>
            <span className="font-tn-mono">({item.ratings})</span>
            <span className="flex items-center gap-0.5">
              <Icon name="pin" size={12} className="text-tn-mute" />
              {item.dist} km
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] bg-tn-paper text-tn-ink2 px-2 py-0.5 rounded-full font-medium">
              {item.listings} listings
            </span>
            <span className="text-[11px] flex items-center gap-1 bg-tn-green-soft text-tn-green font-bold px-2 py-0.5 rounded-full">
              <span className="size-1.5 bg-tn-green rounded-full inline-block" />
              {item.replyRate}% reply
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function ShopMapPopUp({ item }: { item: DirectoryShop }) {
  return (
    <div className="w-[340px] bg-white rounded-2xl shadow-[0_24px_60px_rgba(11,11,11,0.22)] border border-tn-hair overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="size-12 shrink-0 rounded-xl text-white font-bold flex items-center justify-center text-base"
            style={{ backgroundColor: item.color }}
          >
            {getInitials(item.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-tn-ink text-[15px] truncate">{item.name}</span>
              {item.isVerified && (
                <span className="text-[10.5px] bg-tn-green-soft text-tn-green px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                  <span className="size-1.5 bg-tn-green rounded-full inline-block" /> Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-tn-mute">
              <span className="flex items-center font-bold text-tn-ink gap-0.5">
                <Icon name="star" className="text-[#E8A317]" size={13} /> {item.rating.toFixed(1)}
              </span>
              <span className="font-tn-mono">({item.ratings})</span>
              <span className="flex items-center gap-0.5">
                <Icon name="pin" size={12} className="text-tn-mute" /> {item.hood}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 mt-3.5 pt-3 border-t border-tn-hair2 text-center">
          <div>
            <p className="font-tn-mono font-bold text-tn-ink text-[13.5px]">{item.listings}</p>
            <p className="text-[10px] text-tn-mute">listings</p>
          </div>
          <div className="border-l border-tn-hair2">
            <p className="font-tn-mono font-bold text-tn-ink text-[13.5px]">{item.replyRate}%</p>
            <p className="text-[10px] text-tn-mute">reply rate</p>
          </div>
          <div className="border-l border-tn-hair2">
            <p className="font-tn-mono font-bold text-tn-ink text-[13.5px]">~{item.responseTime}m</p>
            <p className="text-[10px] text-tn-mute">response</p>
          </div>
          <div className="border-l border-tn-hair2">
            <p className="font-tn-mono font-bold text-tn-ink text-[13.5px]">{item.dist} km</p>
            <p className="text-[10px] text-tn-mute">away</p>
          </div>
        </div>
      </div>

      <div className="bg-tn-paper flex gap-2 p-3 px-4 border-t border-tn-hair2">
        <Pill kind="outline" size="sm" icon="eye" href={`/shops/${item.slug}`} className="flex-1">
          View shop
        </Pill>
        <Pill
          kind="solid"
          size="sm"
          icon="tg"
          href={item.telegramUsername ? `https://t.me/${item.telegramUsername}` : "#"}
          className="flex-1"
        >
          Contact
        </Pill>
      </div>
    </div>
  );
}

export { ShopItem as Shops, ShopMapPopUp as ShopMap };