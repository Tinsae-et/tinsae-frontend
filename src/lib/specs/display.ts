import { asText, formatGb, type CategorySchema, type SpecField } from "./schema";

/** One spec as buyers see it. */
export type SpecRow = { key: string; label: string; value: string };

/** The product page's three blocks. */
export type SpecSections = {
  /** Key specs plus the recommended spec-sheet fields: the scannable card. */
  key: SpecRow[];
  /** Facts about this unit: warranty, lock, version, battery health... */
  item: SpecRow[];
  /** The rest of the spec sheet, and any older keys not yet converted. */
  more: SpecRow[];
};

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

// An older key is hidden once one of the fields that replaced it has a value,
// so the page never shows the same fact twice ("Network 5G" and "5G Yes").
const SUPERSEDED: Record<string, string[]> = {
  display: ["screen_size", "display_panel"],
  chip: ["chipset"],
  camera: ["main_camera"],
  battery: ["battery_capacity", "battery_life"],
  year: ["release_year"],
  n5g: ["network"],
  weigth: ["weight"],
};

/**
 * Lines shown as one: stored as separate fields (so each stays filterable),
 * read as one spec-sheet line. Placed where the first key sits; only used when
 * at least two parts have values. A yes/no part shows its word only on "yes".
 */
const COMBINED: { label: string; keys: string[]; yesWords?: Record<string, string> }[] = [
  { label: "Display", keys: ["screen_size", "resolution", "display_panel", "refresh_rate"] },
  { label: "Main camera", keys: ["main_camera", "camera_setup"] },
  {
    label: "Battery",
    keys: ["battery_capacity", "fast_charging", "wireless_charging"],
    yesWords: { wireless_charging: "wireless charging" },
  },
  { label: "RAM", keys: ["ram", "ram_type"] },
  { label: "Storage", keys: ["storage", "storage_type", "storage_interface"] },
  { label: "Graphics", keys: ["gpu", "gpu_type", "vram"] },
  {
    label: "Keyboard",
    keys: ["keyboard_layout", "backlit_keyboard"],
    yesWords: { backlit_keyboard: "backlit" },
  },
];

function titleCase(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "" && typeof value !== "object";
}

const grouped = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** A spec value as text: option labels, units, thousands separators. */
export function formatSpecValue(field: SpecField, value: unknown): string {
  if (field.type === "enum") {
    return field.options?.find((o) => o.value === value)?.label ?? String(value);
  }
  if (field.type === "number" && typeof value === "number") {
    switch (field.unit) {
      case "GB":
        return formatGb(value);
      case "g":
        return value >= 1000 ? `${grouped(value / 1000)} kg` : `${grouped(value)} g`;
      case "in":
        return `${value}″`;
      case "%":
        return `${value}%`;
      case undefined:
      case null:
      case "":
        // Years read as years, not "2,024".
        return field.key === "release_year" ? String(value) : grouped(value);
      default:
        return `${grouped(value)} ${field.unit}`;
    }
  }
  return asText(field, String(value));
}

/**
 * The listing's specs in the product page's three blocks. Recommended
 * spec-sheet fields join the key specs, so the card reads like a spec sheet's
 * summary; combined lines are placed where their first part sits.
 */
export function formatSpecSections(
  schema: CategorySchema | null,
  specs: Record<string, unknown> | null | undefined,
): SpecSections {
  const sections: SpecSections = { key: [], item: [], more: [] };
  if (!specs) return sections;

  const fields = new Map((schema?.fields ?? []).map((f) => [f.key, f]));
  const filled = (key: string) => fields.has(key) && present(specs[key]);
  const consumed = new Set<string>();
  const combinedAt = new Map<string, SpecRow>();

  for (const line of COMBINED) {
    const parts = line.keys.filter(filled);
    if (parts.length < 2) continue;
    const words = parts
      .map((key) => {
        const value = specs[key];
        if (line.yesWords?.[key]) return value === "yes" ? line.yesWords[key] : "";
        return formatSpecValue(fields.get(key)!, value);
      })
      .filter(Boolean);
    combinedAt.set(parts[0], { key: parts[0], label: line.label, value: words.join(" · ") });
    parts.forEach((key) => consumed.add(key));
  }

  for (const field of schema?.fields ?? []) {
    const row =
      combinedAt.get(field.key) ??
      (consumed.has(field.key) || !present(specs[field.key])
        ? null
        : { key: field.key, label: field.label, value: formatSpecValue(field, specs[field.key]) });
    if (!row) continue;
    const section = field.section ?? "key";
    if (section === "item") sections.item.push(row);
    else if (section === "key" || field.recommended) sections.key.push(row);
    else sections.more.push(row);
  }

  const rank = (key: string) => {
    const i = LEGACY_ORDER.indexOf(key);
    return i === -1 ? LEGACY_ORDER.length : i;
  };
  Object.entries(specs)
    .filter(
      ([key, value]) =>
        !fields.has(key) &&
        !HIDDEN_KEYS.has(key) &&
        present(value) &&
        !(SUPERSEDED[key] ?? []).some((newer) => present(specs[newer])),
    )
    .sort((a, b) => rank(a[0]) - rank(b[0]))
    .forEach(([key, value]) =>
      sections.more.push({ key, label: LEGACY_LABELS[key] ?? titleCase(key), value: String(value) }),
    );

  return sections;
}

/** All the listing's specs as one list: key card, this item, then the rest. */
export function formatSpecs(
  schema: CategorySchema | null,
  specs: Record<string, unknown> | null | undefined,
): SpecRow[] {
  const { key, item, more } = formatSpecSections(schema, specs);
  return [...key, ...item, ...more];
}
