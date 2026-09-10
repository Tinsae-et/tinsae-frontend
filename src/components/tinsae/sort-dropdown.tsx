"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

export type SortDropdownOption<T extends string = string> = {
  value: T;
  label: string;
};

export function SortDropdown<T extends string = string>({
  value,
  onChange,
  options,
  labelPrefix,
  size = "md",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SortDropdownOption<T>[] | readonly { value: T; label: string }[];
  labelPrefix?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];
  const label = selectedOption?.label ?? value;
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
        <Icon name="sort" size={isSmall ? 13 : 15} className="shrink-0 text-tn-mute" />
        <span className="sr-only">Sort results</span>
        <span className="text-tn-ink whitespace-nowrap font-bold">
          {labelPrefix ? `${labelPrefix} ${label}` : label}
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
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] origin-top-right rounded-2xl border border-tn-hair bg-white p-1.5 shadow-[0_18px_46px_rgba(11,11,11,0.15)] outline-none"
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
