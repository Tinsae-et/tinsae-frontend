import React from "react";
import { Icon } from "@/components/tinsae/icon";
import { getInitials } from "@/lib/shops-data";
import type { Shop } from "@/lib/types";
import Map from "./map";

// PLACEHOLDER: the API has no opening hours yet; these are the same for every
// shop. Hide until Shop serves real hours.
const HOURS = [
  { day: "Mon – Fri", time: "9:00 – 19:30" },
  { day: "Saturday", time: "9:00 – 18:00" },
  { day: "Sunday", time: "Closed" },
];

export function MapInfoSidebar({ shop }: { shop: Shop }) {
  const queryLocation = encodeURIComponent(
    shop.latitude && shop.longitude
      ? `${shop.latitude},${shop.longitude}`
      : `${shop.name} ${shop.city || "Addis Ababa"}`
  );
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${queryLocation}`;
  const initials = getInitials(shop.name);

  return (
    <aside className="space-y-4 lg:sticky lg:top-[128px] self-start max-h-[calc(100vh-140px)] overflow-y-auto pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Map card (sticky) */}
      <div className="border-tn-hair overflow-hidden rounded-2xl border bg-white shadow-xs">
        <div className="relative h-[220px] overflow-hidden bg-[#E8E1D2]">
          {
            shop.latitude && shop.longitude ?
              <Map lat={Number(shop.latitude)} lng={Number(shop.longitude)} label={initials} /> :
              <div className="flex items-center justify-center p-4 text-tn-mute h-full">
                Location not available
              </div>
          }
        </div>

        <div className="p-4">
          <div className="text-tn-ink text-sm font-bold">{shop.name}</div>
          <div className="text-tn-ink2 mt-1 text-xs leading-relaxed">
            {shop.city ? `${shop.city} · Addis Ababa, Ethiopia` : "Addis Ababa, Ethiopia"}
          </div>

          <div className="mt-3.5 flex gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-tn-hair text-tn-ink hover:bg-tn-paper flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-semibold transition"
            >
              <Icon name="pin" size={13} />
              Directions
            </a>
            {shop.phone ? (
              <a
                href={`tel:${shop.phone}`}
                className="border-tn-hair text-tn-ink hover:bg-tn-paper flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-semibold transition"
              >
                <Icon name="phone" size={13} />
                Call
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="border-tn-hair text-tn-mute flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-semibold opacity-50"
              >
                <Icon name="phone" size={13} />
                Call
              </button>
            )}
          </div>
        </div>

        {/* Hours */}
        <div className="border-tn-hair2 border-t p-4">
          <p className="text-tn-mute text-[11px] font-bold tracking-wider uppercase">
            Hours
          </p>
          <div className="mt-2.5 space-y-2">
            {HOURS.map((h, i) => (
              <div key={h.day} className="flex items-center justify-between text-xs">
                <span className={i === 0 ? "font-bold text-tn-ink" : "text-tn-ink2"}>
                  {h.day}
                </span>
                <span
                  className={`font-tn-mono ${
                    h.time === "Closed" ? "text-tn-mute" : "text-tn-ink2"
                  }`}
                >
                  {h.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About this shop */}
      <div className="border-tn-hair rounded-2xl border bg-white p-5">
        <p className="text-tn-mute text-[11px] font-bold tracking-wider uppercase">
          About this shop
        </p>

        <p className="text-tn-ink2 mt-3 text-[13.5px] leading-relaxed">
          {shop.description && shop.description.trim()
            ? shop.description
            : `${shop.name} is an electronics merchant in ${
                shop.city || "Bole, Addis Ababa"
              }. All listings are confirmed and in stock.`}
        </p>

        <div className="mt-4 flex flex-col gap-2.5">
          {shop.is_verified ? (
            <div className="flex items-center gap-2">
              <Icon name="shield" size={16} className="text-tn-green shrink-0" />
              <span className="text-tn-ink text-sm font-bold">Tinsae verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#9A9A99]" />
              <span className="text-tn-mute text-sm font-bold">Unverified shop</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} className="text-tn-ink2 shrink-0" />
            <span className="text-tn-ink text-sm font-bold">In-person pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="bolt" size={16} className="text-tn-ink2 shrink-0" />
            <span className="text-tn-ink text-sm font-bold">Fast responder</span>
          </div>
        </div>
      </div>

      {/* Buyer Protection & Safety */}
      <div className="border-tn-hair rounded-2xl border bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-tn-green-soft flex size-7 shrink-0 items-center justify-center rounded-lg text-tn-green">
            <Icon name="shield" size={15} />
          </div>
          <div>
            <p className="text-tn-ink text-[12.5px] font-extrabold tracking-tight">
              Tinsae Buyer Protection
            </p>
            <p className="text-tn-mute text-[10.5px]">Safe, verified local trade</p>
          </div>
        </div>

        <ul className="mt-3.5 space-y-2.5 border-t border-tn-hair2 pt-3.5 text-xs text-tn-ink2">
          <li className="flex items-start gap-2">
            <Icon name="check" size={13} className="text-tn-green mt-0.5 shrink-0" />
            <span>Daily stock confirmation by merchant</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check" size={13} className="text-tn-green mt-0.5 shrink-0" />
            <span>Inspect and test product in person before payment</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check" size={13} className="text-tn-green mt-0.5 shrink-0" />
            <span>Direct seller pricing — zero broker fees</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default MapInfoSidebar;