import { asText, formatGb, type CategorySchema, type SpecField } from "./schema";

/** One spec as buyers see it. */
export type SpecRow = { key: string; label: string; value: string };

// Keys the form writes that are not specs to show.
const HIDDEN_KEYS = new Set(["variant"]);

// Labels and order for keys that predate the schemas (seeded model-level data
// such as `display` and `chip`). Schema keys never reach these.
const LEGACY_LABELS: Record<string, string> = {
  display: "Display",
  chip: "Chip",
  camera: "Camera",
  battery: "Battery",
  n5g: "5G",
  year: "Year",
  weigth: "Weight",
  weight: "Weight",
  capacity: "Capacity",
  power: "Power",
  type: "Type",
  length: "Length",
  material: "Material",
  port: "Port",
  driver: "Driver",
  bluetooth: "Bluetooth",
};
const LEGACY_ORDER = ["display", "chip", "camera", "battery", "n5g", "year", "weight"];

function titleCase(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "" && typeof value !== "object";
}

/** A spec value as text: option labels for enums, units for numbers. */
export function formatSpecValue(field: SpecField, value: unknown): string {
  if (field.type === "enum") {
    return field.options?.find((o) => o.value === value)?.label ?? String(value);
  }
  if (field.type === "number" && field.unit === "GB" && typeof value === "number") {
    return formatGb(value);
  }
  if (field.type === "number" && field.unit) {
    return field.unit === "%" ? `${value}%` : `${value} ${field.unit}`;
  }
  return asText(field, String(value));
}

/**
 * The listing's specs, ready to render: the schema's fields first, in schema
 * order and with its labels, then any keys the schema does not know, so data
 * from before the schemas still shows until it is migrated.
 */
export function formatSpecs(
  schema: CategorySchema | null,
  specs: Record<string, unknown> | null | undefined,
): SpecRow[] {
  if (!specs) return [];
  const rows: SpecRow[] = [];
  const seen = new Set<string>();

  for (const field of schema?.fields ?? []) {
    seen.add(field.key);
    const value = specs[field.key];
    if (!present(value)) continue;
    rows.push({ key: field.key, label: field.label, value: formatSpecValue(field, value) });
  }

  const rank = (key: string) => {
    const i = LEGACY_ORDER.indexOf(key);
    return i === -1 ? LEGACY_ORDER.length : i;
  };
  const legacy = Object.entries(specs)
    .filter(([key, value]) => !seen.has(key) && !HIDDEN_KEYS.has(key) && present(value))
    .sort((a, b) => rank(a[0]) - rank(b[0]));
  for (const [key, value] of legacy) {
    rows.push({ key, label: LEGACY_LABELS[key] ?? titleCase(key), value: String(value) });
  }
  return rows;
}
