"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon, IconName } from "@/components/tinsae/icon";

type CategoryItem = {
  id: string;
  label: string;
  icon: IconName;
  initialSelected: boolean;
};

const CATEGORIES: CategoryItem[] = [
  { id: "phones", label: "Phones", icon: "phone", initialSelected: true },
  { id: "laptops", label: "Laptops", icon: "laptop", initialSelected: true },
  { id: "audio", label: "Audio", icon: "audio", initialSelected: true },
  { id: "tablets", label: "Tablets", icon: "tablet", initialSelected: true },
  { id: "cameras", label: "Cameras", icon: "camera", initialSelected: false },
  { id: "accessories", label: "Accessories", icon: "plug", initialSelected: true },
  { id: "components", label: "Components", icon: "spec", initialSelected: false },
  { id: "gaming", label: "Gaming", icon: "box", initialSelected: false },
];

export default function CategoriesPanel() {
  const [selectedCats, setSelectedCats] = useState<Record<string, boolean>>(
    CATEGORIES.reduce(
      (acc, c) => ({ ...acc, [c.id]: c.initialSelected }),
      {}
    )
  );
  const [saved, setSaved] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCats((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="border border-tn-hair rounded-[18px] bg-white overflow-hidden shadow-xs">
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair2">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
          Categories sold
        </h2>
        <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
          Pick what you stock — buyers filter shops by category.
        </p>
      </div>

      <div className="px-[22px] py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = Boolean(selectedCats[cat.id]);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-3.5 p-3.5 sm:px-4 rounded-xl cursor-pointer text-left transition-colors border-[1.5px] ${
                  isSelected
                    ? "bg-tn-red-soft border-tn-red"
                    : "bg-white border-tn-hair hover:border-tn-ink/20"
                }`}
              >
                <span className="w-[38px] h-[38px] rounded-xl bg-white border border-tn-hair flex items-center justify-center shrink-0 shadow-2xs">
                  <Icon
                    name={cat.icon}
                    size={18}
                    className={isSelected ? "text-tn-red" : "text-tn-ink2"}
                  />
                </span>

                <span className="flex-1 text-sm font-bold text-tn-ink">
                  {cat.label}
                </span>

                <span
                  className={`w-[22px] h-[22px] rounded-md shrink-0 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-tn-red border-none"
                      : "border-[1.5px] border-tn-hair bg-white"
                  }`}
                >
                  {isSelected && (
                    <Icon name="check" size={13} className="text-white" strokeWidth={3} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-[22px] py-3.5 border-t border-tn-hair2 bg-tn-paper flex justify-end items-center">
        <Pill
          kind="solid"
          size="sm"
          icon="check"
          type="button"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        >
          {saved ? "Saved" : "Save categories"}
        </Pill>
      </div>
    </div>
  );
}
