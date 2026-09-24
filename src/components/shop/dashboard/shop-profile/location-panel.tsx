"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import type { Shop } from "@/lib/types";

type Props = {
  shop: Shop | null;
  slug: string;
};

const DEFAULT_DAYS = [
  { day: "Monday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Tuesday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Wednesday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Thursday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Friday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Saturday", open: true, from: "9:00 AM", to: "8:00 PM" },
  { day: "Sunday", open: false, from: "—", to: "—" },
];

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "SH";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export default function LocationPanel({ shop }: Props) {
  const [neighborhood, setNeighborhood] = useState(shop?.city || "Bole · Atlas");
  const [landmark, setLandmark] = useState("Behind Atlas Hotel");
  const [hours, setHours] = useState(DEFAULT_DAYS);
  const [locSaved, setLocSaved] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);

  const toggleDay = (index: number) => {
    setHours((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const nextOpen = !item.open;
        return {
          ...item,
          open: nextOpen,
          from: nextOpen ? "9:00 AM" : "—",
          to: nextOpen ? "7:00 PM" : "—",
        };
      })
    );
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setLocSaved(true);
    setTimeout(() => setLocSaved(false), 2500);
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    setHoursSaved(true);
    setTimeout(() => setHoursSaved(false), 2500);
  };

  const initials = getInitials(shop?.name || "Almeda Electronics");

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Location Card */}
      <form
        onSubmit={handleSaveLocation}
        className="border border-tn-hair rounded-[18px] bg-white overflow-hidden shadow-xs"
      >
        <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair2">
          <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
            Location
          </h2>
          <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
            Pin your physical shop so buyers can find and visit you.
          </p>
        </div>

        <div className="px-[22px] py-5">
          {/* Stylized Map View */}
          <div className="h-[200px] rounded-2xl overflow-hidden border border-tn-hair relative bg-[#E8EDE6]">
            <svg
              width="100%"
              height="200"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 800 200"
              className="w-full h-full"
            >
              <rect width="800" height="200" fill="#E8EDE6" />
              <rect x="40" y="30" width="150" height="60" rx="8" fill="#E1E9DD" />
              <rect x="560" y="120" width="190" height="64" rx="8" fill="#E1E9DD" />
              <g stroke="#fff" strokeWidth="14" strokeLinecap="round">
                <path d="M-20 110 L820 150" />
                <path d="M300 -20 L350 220" />
                <path d="M560 -20 L610 220" />
              </g>
              <g stroke="#F6CBB8" strokeWidth="5">
                <path d="M-20 110 L820 150" />
              </g>
            </svg>

            {/* Red Teardrop Pin */}
            <div className="absolute left-[46%] top-[52%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
              <div className="w-[38px] h-[38px] rounded-[50%_50%_50%_2px] bg-tn-red rotate-45 flex items-center justify-center shadow-[0_6px_16px_rgba(204,48,0,0.4)]">
                <span className="-rotate-45 text-white font-extrabold text-[13px]">
                  {initials}
                </span>
              </div>
            </div>

            {/* Move Pin Button */}
            <button
              type="button"
              className="absolute right-3 bottom-3 h-9 px-3.5 rounded-xl border-none bg-white shadow-sm cursor-pointer text-[12.5px] font-bold text-tn-ink inline-flex items-center gap-1.5 hover:bg-tn-paper transition-colors"
            >
              <Icon name="pin" size={14} className="text-tn-red" />
              <span>Move pin</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
                Neighborhood
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Bole · Atlas"
                className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink transition-colors"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Behind Atlas Hotel"
                className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="px-[22px] py-3.5 border-t border-tn-hair2 bg-tn-paper flex justify-end items-center">
          <Pill kind="solid" size="sm" icon="check" type="submit">
            {locSaved ? "Saved" : "Save location"}
          </Pill>
        </div>
      </form>

      {/* Opening Hours Card */}
      <form
        onSubmit={handleSaveHours}
        className="border border-tn-hair rounded-[18px] bg-white overflow-hidden shadow-xs"
      >
        <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair2">
          <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
            Opening hours
          </h2>
          <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
            Shown on your shop and listings. Buyers see &ldquo;Open now&rdquo; in real time.
          </p>
        </div>

        <div className="px-[22px] py-3">
          {hours.map((item, index) => (
            <div
              key={item.day}
              className="flex items-center gap-3.5 py-3 border-t border-tn-hair2 first:border-t-0"
            >
              <span className="w-[104px] text-[13.5px] font-bold text-tn-ink shrink-0">
                {item.day}
              </span>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={() => toggleDay(index)}
                className="shrink-0 p-0 border-none bg-transparent cursor-pointer"
                aria-label={`Toggle ${item.day} hours`}
              >
                <span
                  className={`w-[38px] h-[22px] rounded-full relative block transition-colors ${
                    item.open ? "bg-emerald-600" : "bg-[#D8D6CE]"
                  }`}
                >
                  <span
                    className={`absolute top-[2.5px] w-[17px] h-[17px] rounded-full bg-white shadow-xs transition-all duration-150 ${
                      item.open ? "left-[18.5px]" : "left-[2.5px]"
                    }`}
                  />
                </span>
              </button>

              {item.open ? (
                <div className="flex items-center gap-2">
                  <span className="h-[38px] px-3 inline-flex items-center border border-tn-hair rounded-xl text-[13px] font-tn-mono text-tn-ink bg-white font-medium">
                    {item.from}
                  </span>
                  <span className="text-tn-mute text-xs">–</span>
                  <span className="h-[38px] px-3 inline-flex items-center border border-tn-hair rounded-xl text-[13px] font-tn-mono text-tn-ink bg-white font-medium">
                    {item.to}
                  </span>
                </div>
              ) : (
                <span className="text-[13px] font-semibold text-tn-mute">
                  Closed
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="px-[22px] py-3.5 border-t border-tn-hair2 bg-tn-paper flex justify-end items-center">
          <Pill kind="solid" size="sm" icon="check" type="submit">
            {hoursSaved ? "Saved" : "Save hours"}
          </Pill>
        </div>
      </form>
    </div>
  );
}
