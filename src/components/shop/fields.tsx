"use client";

import { cn } from "@/lib/utils";

/**
 * The funnel's form primitives.
 *
 * `components/auth/form.tsx` covers the auth screens, but those fields carry a
 * phone prefix and an OTP layout this form has no use for, and these sit on
 * white cards rather than the auth card. Same tokens, different shape.
 */

const CONTROL =
  "border-tn-hair text-tn-ink placeholder:text-tn-mute h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2";

const INVALID = "border-tn-red focus:border-tn-red";

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="text-tn-ink text-[13px] font-bold">
        {children}
      </label>
      {hint ? <span className="text-tn-mute text-xs font-semibold">{hint}</span> : null}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="text-tn-red mt-1.5 text-[12.5px] font-semibold">
      {children}
    </p>
  );
}

export function TextField({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
} & React.ComponentProps<"input">) {
  return (
    <div>
      <FieldLabel htmlFor={id} hint={hint}>
        {label}
      </FieldLabel>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL, error && INVALID, className)}
        {...props}
      />
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  children,
  className,
  ...props
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
} & React.ComponentProps<"select">) {
  return (
    <div>
      <FieldLabel htmlFor={id} hint={hint}>
        {label}
      </FieldLabel>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL, error && INVALID, className)}
        {...props}
      >
        {children}
      </select>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}

/**
 * A multi-select chip.
 *
 * `aria-pressed` is what makes this announce as "Phones, pressed" rather than
 * an anonymous button — the funnel's chips previously carried no state at all
 * for anyone not looking at the colour.
 */
export function Chip({
  selected,
  onToggle,
  children,
  className,
}: {
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-bold transition-colors",
        selected
          ? "bg-tn-ink border-tn-ink text-white"
          : "border-tn-hair text-tn-ink2 hover:border-tn-mute bg-white",
        className,
      )}
    >
      {children}
    </button>
  );
}
