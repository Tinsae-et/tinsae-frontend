"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import type { Shop } from "@/lib/types";
import { Field, SettingsCard, getInitials, inputClass } from "./settings-card";

// PLACEHOLDER: landmark and opening hours are not saved to the API yet, and
// the map is the design's static illustration, not a real pin picker.
const DEFAULT_DAYS = [
  { day: "Monday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Tuesday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Wednesday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Thursday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Friday", open: true, from: "8:30 AM", to: "7:30 PM" },
  { day: "Saturday", open: true, from: "9:00 AM", to: "8:00 PM" },
  { day: "Sunday", open: false, from: "9:00 AM", to: "7:00 PM" },
];

function useFlash() {
  const [on, setOn] = useState(false);
  const flash = (e: React.FormEvent) => {
    e.preventDefault();
    setOn(true);
    setTimeout(() => setOn(false), 2500);
  };
  return [on, flash] as const;
}

export default function LocationPanel({ shop }: { shop: Shop }) {
  const [neighborhood, setNeighborhood] = useState(shop.city || "");
  const [landmark, setLandmark] = useState("");
  const [hours, setHours] = useState(DEFAULT_DAYS);
  const [locSaved, saveLocation] = useFlash();
  const [hoursSaved, saveHours] = useFlash();

  const toggleDay = (index: number) => {
    setHours((prev) => prev.map((item, i) => (i === index ? { ...item, open: !item.open } : item)));
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <SettingsCard
        title="Location"
        sub="Pin your physical shop so buyers can find and visit you."
        onSubmit={saveLocation}
        footer={
          <Pill kind="solid" size="sm" icon="check" type="submit">
            {locSaved ? "Saved" : "Save location"}
          </Pill>
        }
      >
        <div className="h-[200px] rounded-[14px] overflow-hidden border border-tn-hair relative bg-[#E8EDE6]">
          <svg
            width="100%"
            height="200"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 800 200"
            className="w-full h-full"
            aria-hidden="true"
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

          <div className="absolute left-[46%] top-[52%] -translate-x-1/2 -translate-y-full">
            <div className="size-[38px] rounded-[50%_50%_50%_2px] bg-tn-red rotate-45 flex items-center justify-center shadow-[0_6px_16px_rgba(204,48,0,0.4)]">
              <span className="-rotate-45 text-white font-extrabold text-[13px]">
                {getInitials(shop.name)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="absolute right-3 bottom-3 h-9 px-3.5 rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] cursor-pointer text-[12.5px] font-bold text-tn-ink inline-flex items-center gap-1.5 hover:bg-tn-paper transition-colors"
          >
            <Icon name="pin" size={14} className="text-tn-red" />
            Move pin
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Neighborhood">
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="e.g. Bole · Atlas"
              className={inputClass}
            />
          </Field>
          <Field label="Landmark">
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Behind Atlas Hotel"
              className={inputClass}
            />
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Opening hours"
        sub="Shown on your shop and listings. Buyers see “Open now” in real time."
        onSubmit={saveHours}
        footer={
          <Pill kind="solid" size="sm" icon="check" type="submit">
            {hoursSaved ? "Saved" : "Save hours"}
          </Pill>
        }
      >
        {hours.map((item, index) => (
          <div key={item.day} className="flex items-center gap-3.5 py-3 border-t border-tn-hair2">
            <span className="w-[104px] text-[13.5px] font-bold text-tn-ink shrink-0">{item.day}</span>

            <button
              type="button"
              role="switch"
              aria-checked={item.open}
              aria-label={`${item.day} open`}
              onClick={() => toggleDay(index)}
              className="shrink-0 cursor-pointer"
            >
              <span
                className={cn(
                  "w-[38px] h-[22px] rounded-full relative block transition-colors",
                  item.open ? "bg-tn-green" : "bg-[#D8D6CE]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-[2.5px] size-[17px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-[left] duration-150",
                    item.open ? "left-[18.5px]" : "left-[2.5px]",
                  )}
                />
              </span>
            </button>

            {item.open ? (
              <div className="flex items-center gap-[9px]">
                <span className="h-[38px] px-[13px] inline-flex items-center border border-tn-hair rounded-[10px] text-[13px] font-tn-mono text-tn-ink bg-white">
                  {item.from}
                </span>
                <span className="text-tn-mute text-[13px]">–</span>
                <span className="h-[38px] px-[13px] inline-flex items-center border border-tn-hair rounded-[10px] text-[13px] font-tn-mono text-tn-ink bg-white">
                  {item.to}
                </span>
              </div>
            ) : (
              <span className="text-[13px] font-semibold text-tn-mute">Closed</span>
            )}
          </div>
        ))}
      </SettingsCard>
    </div>
  );
}
