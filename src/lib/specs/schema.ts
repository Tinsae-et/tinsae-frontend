/**
 * Category spec schemas: which specs a listing in a category must carry, and
 * how the owner form renders them.
 *
 * The backend owns them (`catalog/taxonomy/`, served by
 * `GET /api/v1/catalog/categories/{slug}/schema/`) and enforces the same rules
 * on save; these functions mirror `catalog/specs.py` so the form can show the
 * errors before submitting.
 */

export type SpecOption = { value: string; label: string };

/** A condition over other values: every key must hold one of its listed values. */
export type SpecCondition = Record<string, string[]>;

export type SpecField = {
  /** Stable snake_case key stored in `product.specs`. Never rename it. */
  key: string;
  label: string;
  type: "enum" | "text" | "number";
  /** Enum: the allowed values. Text: suggestions to type from, not a limit. */
  options?: SpecOption[];
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  /** Required only while this condition holds (e.g. battery health when used). */
  requiredIf?: SpecCondition;
  /** Shown (and saved) only while this condition holds. */
  showIf?: SpecCondition;
  /**
   * Enum: chips for 5 or fewer options, otherwise a select, unless set.
   * Number: "size" adds a GB / TB switch to a value stored in GB.
   */
  control?: "chips" | "select" | "size" | "weight";
  /**
   * Where the field sits: key specs, the collapsible spec sheet ("details")
   * or facts about this unit ("item"). Defaults to "key".
   */
  section?: SpecSection;
  /** Not required, but counted by the completeness meter and shown first. */
  recommended?: boolean;
};

export type SpecSection = "key" | "details" | "item";

/**
 * Number inputs with a unit switch, stored in the first unit: storage in GB
 * (1 TB = 1024), weight in grams (1 kg = 1000).
 */
export const UNIT_SWITCHES: Record<"size" | "weight", { label: string; factor: number }[]> = {
  size: [
    { label: "GB", factor: 1 },
    { label: "TB", factor: 1024 },
  ],
  weight: [
    { label: "g", factor: 1 },
    { label: "kg", factor: 1000 },
  ],
};

export type CategorySchema = {
  productType: string;
  brands: string[];
  /** False for goods usually sold unbranded (furniture, décor); the form marks it optional. */
  brandRequired?: boolean;
  /** The category's own example name and variant for the listing form's placeholders. */
  listingExamples?: { name?: string; variant?: string };
  fields: SpecField[];
};

/** The schema endpoint's payload, as Django serialises it. */
export type ApiCategorySchema = {
  category: string;
  product_type: string;
  brands: string[];
  brand_required?: boolean;
  listing_examples?: { name?: string; variant?: string };
  fields: {
    key: string;
    label: string;
    type: SpecField["type"];
    unit: string | null;
    min: number | null;
    max: number | null;
    placeholder: string | null;
    hint: string | null;
    required: boolean;
    required_if: SpecCondition | null;
    show_if: SpecCondition | null;
    control: "chips" | "select" | "size" | "weight" | null;
    section: SpecSection;
    recommended: boolean;
    options: SpecOption[] | null;
  }[];
};

export function fromApiSchema(raw: ApiCategorySchema): CategorySchema {
  return {
    productType: raw.product_type,
    brands: raw.brands,
    // Older payloads predate both: brand required, no examples.
    brandRequired: raw.brand_required ?? true,
    listingExamples: raw.listing_examples ?? {},
    fields: raw.fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      options: f.options ?? undefined,
      unit: f.unit ?? undefined,
      min: f.min ?? undefined,
      max: f.max ?? undefined,
      placeholder: f.placeholder ?? undefined,
      hint: f.hint ?? undefined,
      required: f.required,
      requiredIf: f.required_if ?? undefined,
      showIf: f.show_if ?? undefined,
      control: f.control ?? undefined,
      section: f.section,
      recommended: f.recommended,
    })),
  };
}

/**
 * Values the conditions can read: the specs plus the product fields a
 * condition may depend on (`condition` today).
 */
export type SpecValues = Record<string, string>;

/** Longest text value the backend accepts (catalog/specs.py TEXT_MAX_LENGTH). */
export const TEXT_MAX_LENGTH = 120;

/**
 * A text field's stored value as it should read: an option value from before
 * the field was typed ("apple_m3") becomes its label ("Apple M3").
 */
export function asText(field: SpecField, value: string): string {
  if (field.type !== "text" || !field.options) return value;
  return field.options.find((o) => o.value === value)?.label ?? value;
}

/** "512GB SSD" / "1 TB" / "512MB" -> GB; null without a size unit. */
export function parseSizeGb(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(tb|gb|mb)\b/i);
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  return unit === "tb" ? n * 1024 : unit === "mb" ? n / 1024 : n;
}

/** 1024 -> "1 TB", 256 -> "256 GB", 0.5 -> "512 MB". */
export function formatGb(gb: number): string {
  const trim = (n: number) => String(Number(n.toFixed(2)));
  if (gb >= 1024) return `${trim(gb / 1024)} TB`;
  if (gb < 1) return `${trim(gb * 1024)} MB`;
  return `${trim(gb)} GB`;
}

function matches(cond: SpecCondition | undefined, values: SpecValues): boolean {
  if (!cond) return true;
  return Object.entries(cond).every(([key, allowed]) => allowed.includes(values[key] ?? ""));
}

export function isVisible(field: SpecField, values: SpecValues): boolean {
  return matches(field.showIf, values);
}

export function isRequired(field: SpecField, values: SpecValues): boolean {
  if (!isVisible(field, values)) return false;
  if (field.required) return true;
  return field.requiredIf ? matches(field.requiredIf, values) : false;
}

export function controlFor(field: SpecField): "chips" | "select" | "unit" | "input" {
  if (field.type === "number" && (field.control === "size" || field.control === "weight")) {
    return "unit";
  }
  if (field.type !== "enum") return "input";
  if (field.control === "chips" || field.control === "select") return field.control;
  return (field.options?.length ?? 0) <= 5 ? "chips" : "select";
}

/** Field errors keyed by spec key; empty when the specs are complete and valid. */
export function validateSpecs(schema: CategorySchema, values: SpecValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of schema.fields) {
    if (!isVisible(field, values)) continue;
    const raw = (values[field.key] ?? "").trim();

    if (!raw) {
      if (isRequired(field, values)) errors[field.key] = `${field.label} is required`;
      continue;
    }
    if (field.type === "enum" && !field.options?.some((o) => o.value === raw)) {
      errors[field.key] = `Choose a ${field.label.toLowerCase()} from the list`;
    }
    if (field.type === "text" && raw.length > TEXT_MAX_LENGTH) {
      errors[field.key] = `${field.label} must be ${TEXT_MAX_LENGTH} characters or fewer`;
    }
    if (field.type === "number") {
      const n = Number(raw);
      if (!Number.isFinite(n)) errors[field.key] = `${field.label} must be a number`;
      else if (field.min !== undefined && n < field.min)
        errors[field.key] = `${field.label} must be at least ${field.min}`;
      else if (field.max !== undefined && n > field.max)
        errors[field.key] = `${field.label} must be at most ${field.max}`;
    }
  }
  return errors;
}

/**
 * The `specs` payload for a save. Keys this schema does not define are carried
 * over from `existing` untouched (older listings hold keys the migration has
 * not mapped yet); keys it does define are replaced by the visible, non-empty
 * values, with numbers stored as numbers.
 */
export function buildSpecs(
  schema: CategorySchema,
  values: SpecValues,
  existing: Record<string, unknown> = {},
): Record<string, unknown> {
  const defined = new Set(schema.fields.map((f) => f.key));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(existing)) {
    if (!defined.has(key)) out[key] = value;
  }
  for (const field of schema.fields) {
    if (!isVisible(field, values)) continue;
    const raw = (values[field.key] ?? "").trim();
    if (!raw) continue;
    out[field.key] = field.type === "number" ? Number(raw) : raw;
  }
  return out;
}

const squash = (s: string) => s.toLowerCase().replace(/[\s_\-·]+/g, "");

/**
 * Form values from a saved product's specs. Older listings stored free text
 * ("256GB", "512GB SSD"), so an enum value is matched to an option by value or
 * label, ignoring case and spacing, or by a leading match; anything that does
 * not match is left blank for the owner to pick.
 */
export function initialSpecValues(
  schema: CategorySchema | null,
  specs: Record<string, unknown> | undefined,
): SpecValues {
  const values: SpecValues = {};
  if (!schema || !specs) return values;
  for (const field of schema.fields) {
    const raw = specs[field.key];
    if (raw === undefined || raw === null || raw === "") continue;
    const text = String(raw);
    if (field.type === "number" && field.unit === "GB" && typeof raw === "string") {
      // Sizes stored as text before they were numbers ("256GB").
      const gb = parseSizeGb(raw);
      values[field.key] = gb === null ? raw : String(gb);
      continue;
    }
    if (field.type !== "enum") {
      values[field.key] = asText(field, text);
      continue;
    }
    const target = squash(text);
    const hit =
      field.options?.find((o) => squash(o.value) === target || squash(o.label) === target) ??
      field.options?.find((o) => target.startsWith(squash(o.label)));
    if (hit) values[field.key] = hit.value;
  }
  return values;
}
