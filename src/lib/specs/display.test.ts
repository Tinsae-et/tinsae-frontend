import { describe, expect, it } from "vitest";
import { formatSpecSections, formatSpecs } from "./display";
import type { CategorySchema } from "./schema";

const schema: CategorySchema = {
  productType: "smartphone",
  brands: [],
  fields: [
    {
      key: "storage",
      label: "Storage",
      type: "enum",
      options: [{ value: "256gb", label: "256 GB" }],
    },
    {
      key: "sim",
      label: "SIM",
      type: "enum",
      options: [{ value: "sim_esim", label: "SIM + eSIM" }],
    },
    { key: "battery_health", label: "Battery health", type: "number", unit: "%" },
    { key: "screen_size", label: "Screen size", type: "number", unit: "in" },
  ],
};

describe("formatSpecs", () => {
  it("uses schema labels, option labels and units, in schema order", () => {
    const rows = formatSpecs(schema, {
      sim: "sim_esim",
      storage: "256gb",
      battery_health: 92,
      screen_size: 6.1,
    });
    expect(rows).toEqual([
      { key: "storage", label: "Storage", value: "256 GB" },
      { key: "sim", label: "SIM", value: "SIM + eSIM" },
      { key: "battery_health", label: "Battery health", value: "92%" },
      { key: "screen_size", label: "Screen size", value: "6.1″" },
    ]);
  });

  it("keeps older keys after the schema's, and hides the form's variant text", () => {
    const rows = formatSpecs(schema, {
      storage: "256gb",
      chip: "A17 Pro",
      display: '6.1" OLED',
      variant: "256GB · Black",
    });
    expect(rows.map((r) => r.label)).toEqual(["Storage", "Display", "Chip"]);
  });

  it("shows an unrecognised stored value as-is rather than dropping it", () => {
    expect(formatSpecs(schema, { storage: "256GB" })[0].value).toBe("256GB");
  });

  it("works without a schema", () => {
    expect(formatSpecs(null, { n5g: "Yes" })).toEqual([{ key: "n5g", label: "5G", value: "Yes" }]);
  });
});

describe("formatSpecs with typed fields", () => {
  it("shows a stored suggestion value as its label and free text as written", () => {
    const laptop: CategorySchema = {
      productType: "laptop",
      brands: [],
      fields: [
        { key: "processor", label: "Processor", type: "text", options: [{ value: "apple_m3", label: "Apple M3" }] },
        { key: "gpu", label: "Graphics", type: "text", options: [] },
      ],
    };
    expect(formatSpecs(laptop, { processor: "apple_m3", gpu: "RTX 3050 4GB" }).map((r) => r.value)).toEqual([
      "Apple M3",
      "RTX 3050 4GB",
    ]);
  });
});

describe("formatSpecs with sizes", () => {
  it("shows GB numbers as GB / TB", () => {
    const schema: CategorySchema = {
      productType: "laptop",
      brands: [],
      fields: [
        { key: "storage", label: "Storage", type: "number", unit: "GB", control: "size" },
        { key: "ram", label: "RAM", type: "number", unit: "GB" },
      ],
    };
    expect(formatSpecs(schema, { storage: 1024, ram: 16 }).map((r) => r.value)).toEqual(["1 TB", "16 GB"]);
  });
});

describe("formatSpecSections", () => {
  const phone: CategorySchema = {
    productType: "smartphone",
    brands: [],
    fields: [
      { key: "storage", label: "Storage", type: "number", unit: "GB", control: "size", required: true },
      { key: "network", label: "Network", type: "enum", required: true, options: [{ value: "5g", label: "5G" }] },
      { key: "screen_size", label: "Screen size", type: "number", unit: "in", section: "details", recommended: true },
      { key: "display_panel", label: "Display type", type: "text", section: "details", recommended: true },
      { key: "refresh_rate", label: "Refresh rate", type: "number", unit: "Hz", section: "details", recommended: true },
      { key: "battery_capacity", label: "Battery", type: "number", unit: "mAh", section: "details", recommended: true },
      { key: "fast_charging", label: "Charging speed", type: "number", unit: "W", section: "details", recommended: true },
      { key: "weight", label: "Weight", type: "number", unit: "g", section: "details", recommended: true },
      { key: "nfc", label: "NFC", type: "enum", section: "details", options: [{ value: "yes", label: "Yes" }] },
      { key: "carrier_lock", label: "Network lock", type: "enum", section: "item", required: true,
        options: [{ value: "unlocked", label: "Unlocked" }] },
    ],
  };

  it("builds the key card with combined lines, this item, and the rest", () => {
    const { key, item, more } = formatSpecSections(phone, {
      storage: 128,
      network: "5g",
      screen_size: 6.2,
      display_panel: "Dynamic AMOLED 2X",
      refresh_rate: 120,
      battery_capacity: 4000,
      fast_charging: 25,
      weight: 167,
      nfc: "yes",
      carrier_lock: "unlocked",
      n5g: "Yes", // older key, replaced by network
    });
    expect(key.map((r) => [r.label, r.value])).toEqual([
      ["Storage", "128 GB"],
      ["Network", "5G"],
      ["Display", "6.2″ · Dynamic AMOLED 2X · 120 Hz"],
      ["Battery", "4,000 mAh · 25 W"],
      ["Weight", "167 g"],
    ]);
    expect(item.map((r) => r.value)).toEqual(["Unlocked"]);
    // Optional spec-sheet fields go below; the superseded "5G: Yes" is gone.
    expect(more.map((r) => r.label)).toEqual(["NFC"]);
  });

  it("shows a single part under its own label, and kilograms for heavy things", () => {
    const { key } = formatSpecSections(phone, { screen_size: 15.6, weight: 1400 });
    expect(key).toEqual([
      { key: "screen_size", label: "Screen size", value: "15.6″" },
      { key: "weight", label: "Weight", value: "1.4 kg" },
    ]);
  });
});
