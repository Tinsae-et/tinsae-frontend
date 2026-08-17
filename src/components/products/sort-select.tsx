"use client";

import { Select } from "@base-ui/react/select";
import { Icon } from "@/components/tinsae/icon";
import { SORT_OPTIONS, type SortKey } from "@/lib/filters";
import { cn } from "@/lib/utils";

// Custom sort dropdown for the /products hero band (design_handoff_search:
// a 44px pill with the sort icon + a transparent select). We render our own
// popup instead of the OS menu so it matches the app's design language.

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? SORT_OPTIONS[0].label;

  return (
    <Select.Root value={value} onValueChange={(v) => onChange(v as SortKey)}>
      <Select.Trigger className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-tn-hair bg-white px-3.5 outline-none transition-[border-color,background] duration-150 hover:border-tn-ink/25 focus-visible:ring-2 focus-visible:ring-tn-red/30 data-[popup-open]:border-tn-ink/25 data-[popup-open]:bg-tn-paper">
        <Icon name="sort" size={15} className="shrink-0 text-tn-mute" />
        <span className="sr-only">Sort results</span>
        <span className="text-tn-ink whitespace-nowrap text-[13.5px] font-bold">{label}</span>
        <Icon
          name="chevd"
          size={13}
          className="text-tn-mute shrink-0 transition-transform duration-200 group-data-[popup-open]:rotate-180"
        />
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={7} align="end" alignOffset={-8}>
          <Select.Popup className="z-50 min-w-[214px] origin-top-right rounded-2xl border border-tn-hair bg-white p-1.5 shadow-[0_18px_46px_rgba(11,11,11,0.15)] outline-none data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95">
            {SORT_OPTIONS.map((opt) => {
              const selected = opt.value === value;
              return (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "flex h-10 cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 text-[13.5px] font-semibold outline-none transition-colors duration-100",
                    selected
                      ? "bg-tn-red-soft text-tn-red-dark"
                      : "text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink",
                  )}
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  {selected && <Icon name="check" size={14} className="shrink-0 text-tn-red" />}
                </Select.Item>
              );
            })}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
