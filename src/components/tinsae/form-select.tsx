"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

// Form-field counterparts of SortDropdown: the same menu (white panel, soft
// shadow, red-soft selection with a check), sized as a 46px form input. Native
// <select> and <datalist> popups are drawn by the OS -- black in dark mode --
// and cannot be styled to match.

export type FormOption = { value: string; label: string };

/** The 46px form-field look shared by every listing-form input. */
export const fieldClass =
  "w-full h-[46px] px-3.5 rounded-[11px] border border-tn-hair bg-white text-sm text-tn-ink placeholder:text-tn-mute/50 transition-colors focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink";

const menuClass =
  "absolute left-0 right-0 top-full mt-1.5 z-50 max-h-[280px] overflow-y-auto rounded-2xl border border-tn-hair bg-white p-1.5 shadow-[0_18px_46px_rgba(11,11,11,0.15)]";

function optionClass(selected: boolean, active: boolean) {
  return cn(
    "flex w-full h-10 cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 text-[13.5px] font-semibold text-left transition-colors duration-100",
    selected
      ? "bg-tn-red-soft text-tn-red-dark"
      : active
        ? "bg-tn-paper text-tn-ink"
        : "text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink",
  );
}

/** Close on outside click; shared by both controls. */
function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);
  return ref;
}

/** Arrow keys move, Enter picks, Escape closes. Returns the key handler. */
function useListKeys(
  count: number,
  open: boolean,
  setOpen: (v: boolean) => void,
  pick: (index: number) => void,
) {
  const [active, setActive] = useState(-1);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (count === 0 ? -1 : (i + step + count) % count));
    } else if (e.key === "Enter" && open && active >= 0 && active < count) {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };
  return { active, setActive, onKeyDown };
}

/** A dropdown in form-field size, styled like the site's sort menu. */
export function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select",
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: FormOption[];
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const ref = useOutsideClose(open, () => setOpen(false));
  const pick = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
  };
  const { active, setActive, onKeyDown } = useListKeys(options.length, open, setOpen, pick);
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => {
          setOpen((v) => !v);
          setActive(options.findIndex((o) => o.value === value));
        }}
        onKeyDown={onKeyDown}
        className={cn(
          fieldClass,
          "flex items-center justify-between gap-2 text-left font-semibold cursor-pointer",
          open && "border-tn-ink",
          !selected && "font-normal text-tn-mute",
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <Icon
          name="chevd"
          size={13}
          className={cn("shrink-0 text-tn-mute transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div id={listId} role="listbox" className={menuClass}>
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(i)}
                className={optionClass(isSelected, i === active)}
              >
                <span>{o.label}</span>
                {isSelected && <Icon name="check" size={14} className="shrink-0 text-tn-red" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * A text input whose suggestions open in the same menu. Anything can be
 * typed; the suggestions only filter by what is typed so far.
 */
export function FormCombobox({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  maxLength,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const ref = useOutsideClose(open, () => setOpen(false));

  const query = value.trim().toLowerCase();
  const shown = suggestions
    .filter((s) => !query || s.toLowerCase().includes(query))
    // Hide the list once the value is exactly a suggestion.
    .filter((s) => s.toLowerCase() !== query)
    .slice(0, 12);

  const pick = (index: number) => {
    onChange(shown[index]);
    setOpen(false);
  };
  const { active, setActive, onKeyDown } = useListKeys(shown.length, open, setOpen, pick);
  const expanded = open && shown.length > 0;

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        className={cn(fieldClass, className)}
      />
      {expanded && (
        <div id={listId} role="listbox" className={menuClass}>
          {shown.map((s, i) => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              // mousedown, so the input does not blur and close the menu first
              onMouseDown={(e) => {
                e.preventDefault();
                pick(i);
              }}
              className={optionClass(false, i === active)}
            >
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
