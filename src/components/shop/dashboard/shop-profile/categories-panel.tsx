"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import { SettingsCard } from "./settings-card";

// PLACEHOLDER: the shop API has no "categories sold" field yet, so selections
// here are local only. The list itself is the backend's categories.
export default function CategoriesPanel() {
  const categories = useCategories();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useState(false);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
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
      {categories.length === 0 ? (
        <p className="text-[13.5px] text-tn-mute">Loading categories…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[11px]">
          {categories.map((cat) => {
            const on = selected.has(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(cat.slug)}
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
      )}
    </SettingsCard>
  );
}
