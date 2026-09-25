"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon, IconName } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./settings-card";

type CategoryItem = {
  id: string;
  label: string;
  icon: IconName;
};

// PLACEHOLDER: shop categories are not saved to the API yet, and this list
// (from the design) has Components and Gaming, which the buyer side lacks.
const CATEGORIES: CategoryItem[] = [
  { id: "phones", label: "Phones", icon: "phone" },
  { id: "laptops", label: "Laptops", icon: "laptop" },
  { id: "audio", label: "Audio", icon: "audio" },
  { id: "tablets", label: "Tablets", icon: "tablet" },
  { id: "cameras", label: "Cameras", icon: "camera" },
  { id: "accessories", label: "Accessories", icon: "plug" },
  { id: "components", label: "Components", icon: "spec" },
  { id: "gaming", label: "Gaming", icon: "gallery" },
];
const INITIAL_SELECTED = ["phones", "laptops", "audio", "tablets", "accessories"];

export default function CategoriesPanel() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(INITIAL_SELECTED));
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <SettingsCard
      title="Categories sold"
      sub="Pick what you stock — buyers filter shops by category."
      footer={
        <Pill
          kind="solid"
          size="sm"
          icon="check"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        >
          {saved ? "Saved" : "Save categories"}
        </Pill>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[11px]">
        {CATEGORIES.map((cat) => {
          const on = selected.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(cat.id)}
              className={cn(
                "flex items-center gap-[13px] px-4 py-3.5 rounded-[13px] cursor-pointer text-left transition-colors border-[1.5px]",
                on ? "bg-tn-red-soft border-tn-red" : "bg-white border-tn-hair hover:border-tn-ink/20",
              )}
            >
              <span className="size-[38px] rounded-[10px] bg-white border border-tn-hair flex items-center justify-center shrink-0">
                <Icon name={cat.icon} size={18} className={on ? "text-tn-red" : "text-tn-ink2"} />
              </span>
              <span className="flex-1 text-sm font-bold text-tn-ink">{cat.label}</span>
              <span
                className={cn(
                  "size-[22px] rounded-[7px] shrink-0 flex items-center justify-center transition-colors",
                  on ? "bg-tn-red" : "border-[1.5px] border-tn-hair bg-white",
                )}
              >
                {on && <Icon name="check" size={13} className="text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}
