"use client";

import { useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { FormCombobox, FormSelect, fieldClass } from "@/components/tinsae/form-select";
import { cn } from "@/lib/utils";
import {
  controlFor,
  hasValue,
  isRequired,
  isVisible,
  listValue,
  MAX_VALUES,
  TEXT_MAX_LENGTH,
  UNIT_SWITCHES,
  type CategorySchema,
  type SpecField,
  type SpecSection,
  type SpecValues,
} from "@/lib/specs/schema";

const SECTION_TITLES: Record<SpecSection, string> = {
  key: "Key specifications",
  details: "Full specifications",
  item: "This item",
};

/**
 * The Specifications card body, in three parts: key specs (what buyers filter
 * on), the full spec sheet (collapsible, with a completeness meter for the
 * recommended fields) and facts about this unit.
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
  onChange: (key: string, value: string | string[]) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const visible = schema.fields.filter((f) => isVisible(f, values));
  const inSection = (section: SpecSection) =>
    visible.filter((f) => (f.section ?? "key") === section);

  const details = inSection("details");
  const recommended = details.filter((f) => f.recommended);
  const filled = recommended.filter((f) => hasValue(f, values[f.key])).length;
  // An error inside the spec sheet must never be hidden behind the fold.
  const showDetails = detailsOpen || details.some((f) => errors[f.key]);

  const grid = (fields: SpecField[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5 gap-y-[18px]">
      {fields.map((field) => (
        <div key={field.key}>
          <FieldLabel field={field} required={isRequired(field, values)} />
          {field.multiple ? (
            <MultiControl
              field={field}
              value={listValue(values[field.key])}
              onChange={(v) => onChange(field.key, v)}
            />
          ) : (
            <FieldControl
              field={field}
              value={String(values[field.key] ?? "")}
              onChange={(v) => onChange(field.key, v)}
            />
          )}
          {errors[field.key] ? (
            <span className="text-xs text-tn-red mt-1 block">{errors[field.key]}</span>
          ) : (
            field.hint && <span className="text-[11.5px] text-tn-mute mt-1 block">{field.hint}</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {inSection("key").length > 0 && (
        <section>
          {(details.length > 0 || inSection("item").length > 0) && (
            <SectionTitle>{SECTION_TITLES.key}</SectionTitle>
          )}
          {grid(inSection("key"))}
        </section>
      )}

      {details.length > 0 && (
        <section className="rounded-[14px] border border-tn-hair">
          <button
            type="button"
            aria-expanded={showDetails}
            onClick={() => setDetailsOpen((open) => !open)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
          >
            <span className="flex-1">
              <span className="block text-[13.5px] font-extrabold text-tn-ink">
                {SECTION_TITLES.details}
              </span>
              <span className="block text-xs text-tn-mute">
                Recommended — complete listings rank higher and answer buyers&rsquo; questions.
              </span>
            </span>
            {recommended.length > 0 && (
              <span className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:block h-1.5 w-20 rounded-full bg-tn-hair2 overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-tn-green transition-[width]"
                    style={{ width: `${Math.round((filled / recommended.length) * 100)}%` }}
                  />
                </span>
                <span className="font-tn-mono text-xs font-bold text-tn-ink2">
                  {filled}/{recommended.length}
                </span>
              </span>
            )}
            <Icon
              name="chevd"
              size={14}
              className={cn("shrink-0 text-tn-mute transition-transform", showDetails && "rotate-180")}
            />
          </button>
          {showDetails && <div className="border-t border-tn-hair2 p-4">{grid(details)}</div>}
        </section>
      )}

      {inSection("item").length > 0 && (
        <section>
          <SectionTitle>{SECTION_TITLES.item}</SectionTitle>
          {grid(inSection("item"))}
        </section>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-tn-mute">
      {children}
    </h4>
  );
}

function FieldLabel({ field, required }: { field: SpecField; required: boolean }) {
  return (
    <label htmlFor={`spec-${field.key}`} className="text-[12.5px] font-bold text-tn-ink2 mb-[7px] block">
      {field.label}
      {!required && !field.recommended && <span className="ml-1 font-medium text-tn-mute">(optional)</span>}
    </label>
  );
}

const chipClass = (on: boolean) =>
  cn(
    "h-[38px] px-3.5 rounded-full text-[13px] font-bold border-[1.5px] transition-colors cursor-pointer",
    on ? "border-tn-ink bg-tn-ink text-white" : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper",
  );

/**
 * A field holding several values: every option a toggle chip. Text fields
 * (sizes, colours) also take a typed value, added on Enter, since their
 * options are suggestions rather than the full list.
 */
function MultiControl({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const options = field.options ?? [];
  const isText = field.type === "text";
  // Text stores labels (what a person types); enums store option values.
  const stored = (o: { value: string; label: string }) => (isText ? o.label : o.value);
  const has = (v: string) => value.some((x) => x.toLowerCase() === v.toLowerCase());
  const toggle = (v: string) =>
    onChange(has(v) ? value.filter((x) => x.toLowerCase() !== v.toLowerCase()) : [...value, v]);
  // Typed values that are not among the suggestions, shown as removable chips.
  const typed = isText ? value.filter((v) => !options.some((o) => o.label.toLowerCase() === v.toLowerCase())) : [];
  const full = value.length >= MAX_VALUES;

  const add = () => {
    const v = draft.trim().replace(/\s+/g, " ");
    if (!v) return;
    const suggestion = options.find((o) => [o.label, o.value].some((x) => x.toLowerCase() === v.toLowerCase()));
    const item = suggestion ? suggestion.label : v.slice(0, TEXT_MAX_LENGTH);
    if (!has(item) && !full) onChange([...value, item]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div role="group" aria-label={field.label} className="flex flex-wrap gap-[7px]">
        {options.map((o) => {
          const on = has(stored(o));
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => toggle(stored(o))}
              className={cn(chipClass(on), "inline-flex items-center gap-1.5 disabled:opacity-50")}
            >
              {on && <Icon name="check" size={12} />}
              {o.label}
            </button>
          );
        })}
        {typed.map((v) => (
          <button
            key={v}
            type="button"
            aria-label={`Remove ${v}`}
            onClick={() => toggle(v)}
            className={cn(chipClass(true), "inline-flex items-center gap-1.5")}
          >
            {v}
            <Icon name="close" size={12} />
          </button>
        ))}
      </div>
      {isText && (
        <div className="flex gap-2">
          <input
            id={`spec-${field.key}`}
            type="text"
            autoComplete="off"
            maxLength={TEXT_MAX_LENGTH}
            value={draft}
            disabled={full}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // never submits the listing
                add();
              }
            }}
            placeholder={field.placeholder ?? `Add a ${field.label.toLowerCase()}`}
            className={fieldClass}
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim() || full}
            className="shrink-0 h-[46px] px-4 rounded-[11px] border border-tn-hair bg-white text-[13px] font-bold text-tn-ink2 hover:bg-tn-paper disabled:opacity-50 cursor-pointer"
          >
            Add
          </button>
        </div>
      )}
    </div>
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

  if (control === "unit") {
    return <UnitInput field={field} value={value} onChange={onChange} />;
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
              className={chipClass(on)}
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

/**
 * A number with a unit switch (GB / TB, g / kg), stored in the base unit --
 * so 480 GB, 1.5 TB and 1.4 kg are all enterable and still compare correctly.
 * Keeps its own text so a half-typed "1." is not rewritten while typing.
 */
function UnitInput({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: string;
  onChange: (base: string) => void;
}) {
  const units = UNIT_SWITCHES[field.control === "weight" ? "weight" : "size"];
  const stored = value === "" ? null : Number(value);
  // Open in the largest unit the stored value is a whole multiple of.
  const [unitIndex, setUnitIndex] = useState(() => {
    if (stored === null || !Number.isFinite(stored)) return 0;
    for (let i = units.length - 1; i > 0; i--) {
      if (stored >= units[i].factor && stored % units[i].factor === 0) return i;
    }
    return 0;
  });
  const [text, setText] = useState(() =>
    stored === null || !Number.isFinite(stored) ? value : String(stored / units[unitIndex].factor),
  );

  const emit = (typed: string, index: number) => {
    const n = Number(typed);
    if (typed.trim() === "" || !Number.isFinite(n)) {
      onChange(typed.trim()); // left for validation to flag
      return;
    }
    onChange(String(Number((n * units[index].factor).toFixed(2))));
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
          emit(e.target.value, unitIndex);
        }}
        placeholder={field.placeholder}
        className={cn(fieldClass, "font-tn-mono rounded-r-none")}
      />
      <div
        role="radiogroup"
        aria-label={`${field.label} unit`}
        className="flex shrink-0 rounded-r-[11px] border border-l-0 border-tn-hair bg-tn-paper p-1"
      >
        {units.map((u, i) => (
          <button
            key={u.label}
            type="button"
            role="radio"
            aria-checked={unitIndex === i}
            onClick={() => {
              setUnitIndex(i);
              emit(text, i);
            }}
            className={cn(
              "h-full px-3 rounded-[8px] font-tn-mono text-xs font-bold transition-colors cursor-pointer",
              unitIndex === i ? "bg-tn-ink text-white" : "text-tn-mute hover:text-tn-ink",
            )}
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
