"use client";

import { Icon, type IconName } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth/types";

const OPTIONS: { role: Role; icon: IconName; title: string; sub: string }[] = [
  {
    role: "buyer",
    icon: "heart",
    title: "Buy electronics",
    sub: "Save listings, get price alerts",
  },
  {
    role: "owner",
    icon: "shield",
    title: "Sell on Tinsae",
    sub: "List stock, get verified, reach buyers",
  },
];

/**
 * "I want to…" — sign-up only. The choice decides where the user lands after
 * verifying, and (for owners) that shop onboarding follows.
 *
 * Radios rather than buttons: this is one choice from a fixed set, so arrow
 * keys should move between the options and a screen reader should announce
 * "2 of 2 selected", neither of which a pair of buttons gives you.
 */
export function RolePicker({
  value,
  onChange,
  disabled,
}: {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="mb-5" disabled={disabled}>
      <legend className="mb-2.25 text-[12.5px] font-bold text-tn-ink2">I want to…</legend>

      <div className="grid grid-cols-2 gap-2.5">
        {OPTIONS.map((option) => {
          const selected = value === option.role;
          return (
            <label
              key={option.role}
              className={cn(
                "cursor-pointer rounded-[14px] border-[1.5px] p-3.75 transition-colors",
                "focus-within:ring-3 focus-within:ring-tn-red/20",
                selected
                  ? "border-tn-red bg-tn-red-soft"
                  : "border-tn-hair bg-white hover:border-tn-mute/40",
              )}
            >
              <input
                type="radio"
                name="role"
                value={option.role}
                checked={selected}
                onChange={() => onChange(option.role)}
                className="sr-only"
              />
              <span
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-[10px] border",
                  selected ? "border-tn-red/20 bg-white" : "border-tn-hair bg-tn-paper",
                )}
              >
                <Icon
                  name={option.icon}
                  size={18}
                  className={selected ? "text-tn-red" : "text-tn-ink2"}
                />
              </span>
              <span className="mt-2.5 block text-sm font-extrabold tracking-[-0.01em] text-tn-ink">
                {option.title}
              </span>
              <span className="mt-0.75 block text-[11.5px] leading-[1.35] text-tn-mute">
                {option.sub}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
