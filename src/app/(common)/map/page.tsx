"use client";

import { useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { SegToggle } from "@/components/shops/seg-toggle";
import ShopItem, { ShopMapPopUp } from "@/components/home/shopmap";
import { SHOPS_RICH, getInitials } from "@/lib/shops-data";

function BoleMap({ children }: { children?: React.ReactNode }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 block h-full w-full"
    >
      <rect width="1000" height="800" fill="#EAEDE7" />
      {/* Parks / green spaces */}
      <rect x="60" y="90" width="190" height="130" rx="14" fill="#DDE7D6" />
      <rect x="700" y="540" width="240" height="180" rx="16" fill="#DDE7D6" />
      <circle cx="840" cy="170" r="74" fill="#DDE7D6" />
      {/* City blocks */}
      {[
        [330, 120, 150, 90],
        [540, 210, 120, 80],
        [120, 330, 140, 100],
        [420, 420, 130, 90],
        [640, 360, 120, 80],
        [250, 560, 150, 100],
        [520, 600, 130, 90],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="10" fill="#E2E0D8" />
      ))}
      {/* Roads */}
      <g stroke="#FFFFFF" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-20 300 C 250 240, 520 360, 1020 250" />
        <path d="M120 -20 C 200 250, 360 520, 520 820" />
        <path d="M-20 620 C 300 560, 640 660, 1020 560" />
        <path d="M760 -20 C 720 300, 800 560, 860 820" />
      </g>
      {/* Bole Road artery */}
      <path
        d="M-20 480 C 280 420, 560 520, 1020 360"
        stroke="#FFFFFF"
        strokeWidth="30"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-20 480 C 280 420, 560 520, 1020 360"
        stroke="#F7CDB9"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      {/* Connectors */}
      <g stroke="#FFFFFF" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M250 160 L470 420" />
        <path d="M640 200 L520 600" />
        <path d="M180 420 L420 460" />
      </g>
      {children}
    </svg>
  );
}

const CATEGORIES = ["All", "Phones", "Laptops", "Audio", "Cameras"];

export default function MapPage() {
  const [selectedId, setSelectedId] = useState<string>("al");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const shops = SHOPS_RICH.filter((s) => {
    const matchesCategory =
      selectedCategory === "All" || s.cats.some((c) => c.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hood.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedShop = shops.find((s) => s.id === selectedId) || shops[0];

  return (
    <div className="flex flex-col bg-white min-h-[calc(100vh-68px)]">
      {/* Header bar */}
      <div className="border-b border-tn-hair2 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-7">
          <div>
            <h1 className="text-tn-ink text-2xl font-extrabold tracking-[-0.03em]">
              Verified shops in Bole
            </h1>
            <p className="text-tn-mute mt-0.5 text-[13px] font-medium">
              <b className="text-tn-ink2">{shops.length} shops</b> on the map · all reconfirmed within 24h
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="border-tn-hair flex h-10 w-64 items-center gap-2 rounded-xl border bg-white px-3 shadow-2xs">
              <Icon name="search" size={15} className="text-tn-mute shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops or area"
                className="text-tn-ink placeholder:text-tn-mute w-full bg-transparent text-sm outline-none"
              />
            </div>
            <SegToggle active="Map" />
          </div>
        </div>
      </div>

      {/* Main split: Sidebar + Map */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[380px_1fr] h-[calc(100vh-140px)]">
        {/* Left Rail */}
        <div className="border-tn-hair flex flex-col overflow-hidden border-r bg-white">
          {/* Category Filter Pills */}
          <div className="border-b border-tn-hair2 flex gap-1.5 overflow-x-auto p-3.5 px-4 bg-white/95">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-tn-ink text-white"
                      : "border-tn-hair text-tn-ink2 hover:border-tn-ink border bg-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Shop List */}
          <div className="flex-1 overflow-y-auto">
            {shops.length > 0 ? (
              shops.map((shop) => (
                <ShopItem
                  key={shop.id}
                  item={shop}
                  isSelected={selectedShop?.id === shop.id}
                  onSelect={() => setSelectedId(shop.id)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-tn-mute text-sm">
                No shops match your criteria
              </div>
            )}
          </div>
        </div>

        {/* Right Map Canvas */}
        <div className="relative overflow-hidden bg-[#EAEDE7]">
          <BoleMap />

          {/* Neighborhood Labels */}
          {[
            ["Atlas", 54, 30],
            ["Friendship", 40, 72],
            ["Olympia", 70, 66],
            ["Japan", 33, 22],
            ["Medhanialem", 22, 46],
          ].map(([label, x, y]) => (
            <div
              key={label}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold tracking-[0.06em] text-[#9EA198] uppercase select-none"
            >
              {label}
            </div>
          ))}

          {/* Shop Pins */}
          {shops.map((shop) => {
            const isSelected = selectedShop?.id === shop.id;
            const isHovered = hoveredId === shop.id;
            const posX = shop.x ?? 50;
            const posY = shop.y ?? 50;

            return (
              <button
                key={shop.id}
                type="button"
                onMouseEnter={() => setHoveredId(shop.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedId(shop.id)}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: `translate(-50%, -100%) scale(${isSelected ? 1.15 : 1})`,
                }}
                className={`absolute cursor-pointer transition-transform duration-150 ${
                  isSelected ? "z-30" : isHovered ? "z-20" : "z-10"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center shadow-md transition-colors ${
                      isSelected
                        ? "bg-tn-red text-white rounded-full px-3 py-1 gap-1.5 h-9 shadow-[0_8px_20px_rgba(204,48,0,0.35)]"
                        : "bg-white border border-tn-hair rounded-full size-9 text-xs font-bold"
                    }`}
                    style={isSelected ? undefined : { color: shop.color }}
                  >
                    <span className="font-extrabold text-[12px]">{getInitials(shop.name)}</span>
                    {isSelected && (
                      <span className="font-tn-mono text-xs font-bold text-white/90">
                        {shop.dist} km
                      </span>
                    )}
                  </div>
                  {!isSelected && <div className="size-1.5 rounded-full bg-black/20 mt-1" />}
                </div>
              </button>
            );
          })}

          {/* Docked Detail Card for Selected Shop */}
          {selectedShop && (
            <div className="absolute bottom-5 left-5 z-40">
              <ShopMapPopUp item={selectedShop} />
            </div>
          )}

          {/* Map Top Status Pill */}
          <div className="absolute top-5 left-5 z-20 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold text-tn-ink shadow-[0_4px_14px_rgba(11,11,11,0.08)] backdrop-blur-xs">
            <span className="bg-tn-green size-2 rounded-full" />
            Confirmed stock today · live
          </div>
        </div>
      </div>
    </div>
  );
}