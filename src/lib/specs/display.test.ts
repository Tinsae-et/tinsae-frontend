import { describe, expect, it } from "vitest";
import { formatSpecs } from "./display";
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
      { key: "screen_size", label: "Screen size", value: "6.1 in" },
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
