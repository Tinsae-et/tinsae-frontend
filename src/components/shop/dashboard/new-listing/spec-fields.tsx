"use client";

import { useState } from "react";
import { FormCombobox, FormSelect, fieldClass } from "@/components/tinsae/form-select";
import { cn } from "@/lib/utils";
import {
  controlFor,
  isRequired,
  isVisible,
  TEXT_MAX_LENGTH,
  type CategorySchema,
  type SpecField,
  type SpecValues,
} from "@/lib/specs/schema";

/**
 * The Specifications card body: one field per schema entry that is visible for
 * the current values, in the design's two-column grid (chip groups wrap).
 */
export function SpecFields({
  schema,
  values,
  errors,
  onChange,
}: {
  schema: CategorySchema;
  /** Spec values plus the product fields conditions read (`condition`). */
  values: SpecValues;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const fields = schema.fields.filter((f) => isVisible(f, values));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5 gap-y-[18px]">
      {fields.map((field) => (
        <div key={field.key}>
          <FieldLabel field={field} required={isRequired(field, values)} />
          <FieldControl field={field} value={values[field.key] ?? ""} onChange={(v) => onChange(field.key, v)} />
          {errors[field.key] ? (
            <span className="text-xs text-tn-red mt-1 block">{errors[field.key]}</span>
          ) : (
            field.hint && <span className="text-[11.5px] text-tn-mute mt-1 block">{field.hint}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ field, required }: { field: SpecField; required: boolean }) {
  return (
    <label htmlFor={`spec-${field.key}`} className="text-[12.5px] font-bold text-tn-ink2 mb-[7px] block">
      {field.label}
      {!required && <span className="ml-1 font-medium text-tn-mute">(optional)</span>}
    </label>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: string;
  onChange: (value: string) => void;
}) {
  const control = controlFor(field);

  if (control === "size") {
    return <SizeInput field={field} value={value} onChange={onChange} />;
  }

  if (control === "chips") {
    return (
      <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-[7px]">
        {field.options!.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              // Clicking the selected chip clears an optional choice.
              onClick={() => onChange(on ? "" : o.value)}
              className={cn(
                "h-[38px] px-3.5 rounded-full text-[13px] font-bold border-[1.5px] transition-colors cursor-pointer",
                on ? "border-tn-ink bg-tn-ink text-white" : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (control === "select") {
    return (
      <FormSelect
        id={`spec-${field.key}`}
        value={value}
        onChange={onChange}
        options={field.options!}
        placeholder={`Select ${field.label.toLowerCase()}`}
      />
    );
  }

  // Text with options is typed, with the options offered as suggestions:
  // "Intel Core i5-1135G7" is as valid as the suggested "Intel Core i5".
  if (field.type === "text" && field.options?.length) {
    return (
      <FormCombobox
        id={`spec-${field.key}`}
        value={value}
        onChange={onChange}
        suggestions={field.options.map((o) => o.label)}
        placeholder={field.placeholder}
        maxLength={TEXT_MAX_LENGTH}
      />
    );
  }

  return (
    <div className="relative">
      <input
        id={`spec-${field.key}`}
        type="text"
        inputMode={field.type === "number" ? "decimal" : undefined}
        autoComplete="off"
        maxLength={field.type === "text" ? TEXT_MAX_LENGTH : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={cn(fieldClass, field.type === "number" && "font-tn-mono", field.unit && "pr-12")}
      />
      {field.unit && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-tn-mono text-xs font-bold text-tn-mute select-none">
          {field.unit}
        </span>
      )}
    </div>
  );
}

const TB = 1024;

/**
 * A capacity typed as a number with a GB / TB switch, stored in GB -- so
 * 480 GB, 1.5 TB and 3 TB are all enterable, and 1 TB compares above 512 GB.
 * Keeps its own text so a half-typed "1." is not rewritten while typing.
 */
function SizeInput({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: string;
  onChange: (gb: string) => void;
}) {
  const stored = value === "" ? null : Number(value);
  const [unit, setUnit] = useState<"GB" | "TB">(() =>
    stored !== null && stored >= TB && stored % TB === 0 ? "TB" : "GB",
  );
  const [text, setText] = useState(() =>
    stored === null || !Number.isFinite(stored) ? value : unit === "TB" ? String(stored / TB) : value,
  );

  const emit = (typed: string, inUnit: "GB" | "TB") => {
    const n = Number(typed);
    if (typed.trim() === "" || !Number.isFinite(n)) {
      onChange(typed.trim()); // left for validation to flag
      return;
    }
    onChange(String(inUnit === "TB" ? Number((n * TB).toFixed(2)) : n));
  };

  return (
    <div className="flex">
      <input
        id={`spec-${field.key}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          emit(e.target.value, unit);
        }}
        placeholder={field.placeholder}
        className={cn(fieldClass, "font-tn-mono rounded-r-none")}
      />
      <div
        role="radiogroup"
        aria-label={`${field.label} unit`}
        className="flex shrink-0 rounded-r-[11px] border border-l-0 border-tn-hair bg-tn-paper p-1"
      >
        {(["GB", "TB"] as const).map((u) => (
          <button
            key={u}
            type="button"
            role="radio"
            aria-checked={unit === u}
            onClick={() => {
              setUnit(u);
              emit(text, u);
            }}
            className={cn(
              "h-full px-3 rounded-[8px] font-tn-mono text-xs font-bold transition-colors cursor-pointer",
              unit === u ? "bg-tn-ink text-white" : "text-tn-mute hover:text-tn-ink",
            )}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
