"use client";

import { Icon } from "@/components/tinsae/icon";

export function CompareEmptySlot({
  onAddClick,
  label = "Add a phone",
}: {
  onAddClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onAddClick}
      aria-label={`${label} to comparison`}
      className="group bg-tn-paper/50 hover:bg-tn-paper border-tn-hair hover:border-tn-mute/50 flex min-h-[220px] w-full flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-6 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="bg-white text-tn-red shadow-[0_2px_8px_rgba(11,11,11,0.06)] group-hover:scale-105 flex size-12 items-center justify-center rounded-full transition-transform">
        <Icon name="plus" size={20} />
      </div>
      <span className="text-tn-ink mt-3.5 text-[14.5px] font-extrabold tracking-[-0.01em]">
        {label}
      </span>
      <span className="text-tn-mute mt-0.5 text-xs font-semibold">
        Up to 4
      </span>
    </button>
  );
}
