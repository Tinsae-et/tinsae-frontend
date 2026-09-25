"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";

export type CategoryOption = {
  value: string;
  label: string;
};

const ALL_OPTION: CategoryOption = { value: "", label: "All categories" };

export function CategoryDropdown({
  value,
  onChange,
  options: optionsProp,
  size = "sm",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options?: readonly CategoryOption[];
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const categories = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);

  const options = optionsProp ?? [
    ALL_OPTION,
    ...categories.map((c) => ({ value: c.slug, label: c.label })),
  ];

  const selectedOption = options.find((o) => o.value === value) ?? options[0];
  const label = selectedOption?.label ?? "All categories";
  const isSmall = size === "sm";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "group inline-flex cursor-pointer items-center gap-2 rounded-full border border-tn-hair bg-white outline-none transition-[border-color,background] duration-150 hover:border-tn-ink/25 focus-visible:ring-2 focus-visible:ring-tn-red/30",
          open && "border-tn-ink/25 bg-tn-paper",
          isSmall ? "h-9 px-3.5 text-[13px]" : "h-11 px-3.5 text-[13.5px]",
        )}
      >
        <Icon name="sliders" size={isSmall ? 13 : 15} className="shrink-0 text-tn-mute" />
        <span className="sr-only">Filter by category</span>
        <span className="text-tn-ink whitespace-nowrap font-bold">
          {label}
        </span>
        <Icon
          name="chevd"
          size={isSmall ? 11 : 13}
          className={cn(
            "text-tn-mute shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-50 min-w-[210px] max-h-[320px] overflow-y-auto rounded-2xl border border-tn-hair bg-white p-1.5 shadow-[0_18px_46px_rgba(11,11,11,0.15)] outline-none"
          role="listbox"
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 font-semibold text-left outline-none transition-colors duration-100",
                  isSmall ? "h-9 text-[12.5px]" : "h-10 text-[13.5px]",
                  selected
                    ? "bg-tn-red-soft text-tn-red-dark"
                    : "text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink",
                )}
              >
                <span>{opt.label}</span>
                {selected && (
                  <Icon
                    name="check"
                    size={isSmall ? 13 : 14}
                    className="shrink-0 text-tn-red"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
