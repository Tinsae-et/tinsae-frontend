import { describe, expect, it } from "vitest";
import {
  buildSpecs,
  controlFor,
  formatGb,
  fromApiSchema,
  initialSpecValues,
  parseSizeGb,
  validateSpecs,
  type CategorySchema,
  type SpecOption,
} from "./schema";

// Trimmed copies of the backend's schemas (catalog/taxonomy/electronics.py).
const sizes = (...s: string[]): SpecOption[] =>
  s.map((v) => ({ value: v.toLowerCase(), label: v.replace(/(\d)([A-Z])/, "$1 $2") }));
const USED = { condition: ["used"] };
const warranty = {
  key: "warranty",
  label: "Warranty",
  type: "enum" as const,
  control: "select" as const,
  required: true,
  options: [
    { value: "none", label: "No warranty" },
    { value: "brand_1y", label: "Brand · 1 year" },
  ],
};

const phones: CategorySchema = {
  productType: "smartphone",
  brands: ["Apple"],
  fields: [
    { key: "storage", label: "Storage", type: "enum", required: true, control: "chips",
      options: sizes("64GB", "128GB", "256GB", "512GB", "1TB") },
    { key: "ram", label: "RAM", type: "enum", required: true, control: "chips",
      options: sizes("4GB", "8GB", "16GB") },
    { key: "color", label: "Color", type: "enum", required: true,
      options: ["black", "white", "blue", "red", "gold", "silver"].map((v) => ({ value: v, label: v })) },
    { key: "sim", label: "SIM", type: "enum", required: true,
      options: [{ value: "single", label: "Single" }, { value: "dual", label: "Dual" }] },
    warranty,
    { key: "battery_health", label: "Battery health", type: "number", unit: "%", min: 0, max: 100,
      showIf: USED, requiredIf: USED },
  ],
};

const laptops: CategorySchema = {
  productType: "laptop",
  brands: [],
  fields: [
    { key: "processor", label: "Processor", type: "enum", required: true,
      options: [{ value: "apple_m3", label: "Apple M3" }] },
    { key: "ram", label: "RAM", type: "enum", required: true, options: sizes("8GB", "16GB") },
    { key: "storage", label: "Storage", type: "enum", required: true, options: sizes("256GB", "512GB") },
    { key: "screen_size", label: "Screen size", type: "number", unit: "in", required: true },
  ],
};

const cameras: CategorySchema = {
  productType: "camera",
  brands: [],
  fields: [
    { key: "camera_type", label: "Type", type: "enum", required: true,
      options: [{ value: "mirrorless", label: "Mirrorless" }, { value: "dslr", label: "DSLR" },
        { value: "compact", label: "Compact" }] },
    { key: "kit", label: "Kit", type: "enum", required: true,
      options: [{ value: "body_only", label: "Body only" }, { value: "with_lens", label: "With lens" }],
      showIf: { camera_type: ["mirrorless", "dslr"] } },
    warranty,
  ],
};

const completePhone = {
  storage: "256gb",
  ram: "8gb",
  color: "black",
  sim: "dual",
  warranty: "brand_1y",
  condition: "new",
};

describe("validateSpecs", () => {
  it("requires every required field", () => {
    const errors = validateSpecs(phones, { condition: "new" });
    expect(Object.keys(errors).sort()).toEqual(["color", "ram", "sim", "storage", "warranty"]);
  });

  it("passes a complete new phone", () => {
    expect(validateSpecs(phones, completePhone)).toEqual({});
  });

  it("requires battery health only when the phone is used", () => {
    expect(validateSpecs(phones, { ...completePhone, condition: "used" })).toEqual({
      battery_health: "Battery health is required",
    });
  });

  it("rejects values outside the option list and number range", () => {
    const errors = validateSpecs(phones, {
      ...completePhone,
      storage: "300gb",
      condition: "used",
      battery_health: "140",
    });
    expect(errors.storage).toMatch(/from the list/);
    expect(errors.battery_health).toMatch(/at most 100/);
  });

  it("ignores fields hidden by the current type", () => {
    // A compact camera has no kit or lens mount.
    expect(validateSpecs(cameras, { camera_type: "compact", warranty: "none" })).toEqual({});
    expect(validateSpecs(cameras, { camera_type: "dslr", warranty: "none" })).toHaveProperty("kit");
  });
});

describe("buildSpecs", () => {
  it("keeps unknown legacy keys, replaces schema keys and drops hidden ones", () => {
    const specs = buildSpecs(
      phones,
      { ...completePhone, battery_health: "88" }, // condition is new, so it is hidden
      { display: '6.1" OLED', storage: "128GB", variant: "256GB · Black" },
    );
    expect(specs).toEqual({
      display: '6.1" OLED',
      variant: "256GB · Black",
      storage: "256gb",
      ram: "8gb",
      color: "black",
      sim: "dual",
      warranty: "brand_1y",
    });
  });

  it("stores numbers as numbers", () => {
    const specs = buildSpecs(phones, { ...completePhone, condition: "used", battery_health: "91" });
    expect(specs.battery_health).toBe(91);
  });
});

describe("initialSpecValues", () => {
  it("matches free-text values from older listings to options", () => {
    const values = initialSpecValues(laptops, {
      storage: "512GB SSD",
      ram: "16GB LPDDR5x",
      screen_size: 14,
      processor: "Some unknown chip",
    });
    expect(values).toEqual({ storage: "512gb", ram: "16gb", screen_size: "14" });
  });
});

describe("controlFor", () => {
  it("uses chips for short lists and selects for long ones unless overridden", () => {
    const sim = phones.fields.find((f) => f.key === "sim")!;
    const color = phones.fields.find((f) => f.key === "color")!;
    expect(controlFor(sim)).toBe("chips");
    expect(controlFor(color)).toBe("select");
  });
});

describe("fromApiSchema", () => {
  it("maps the backend's snake_case payload and drops nulls", () => {
    const schema = fromApiSchema({
      category: "phones",
      product_type: "smartphone",
      brands: ["Apple"],
      fields: [
        {
          key: "battery_health",
          label: "Battery health",
          type: "number",
          unit: "%",
          min: 0,
          max: 100,
          placeholder: null,
          hint: null,
          required: false,
          required_if: { condition: ["used"] },
          show_if: { condition: ["used"] },
          control: null,
          options: null,
        },
      ],
    });
    expect(schema.productType).toBe("smartphone");
    expect(schema.fields[0]).toEqual({
      key: "battery_health",
      label: "Battery health",
      type: "number",
      unit: "%",
      min: 0,
      max: 100,
      options: undefined,
      placeholder: undefined,
      hint: undefined,
      required: false,
      requiredIf: { condition: ["used"] },
      showIf: { condition: ["used"] },
      control: undefined,
    });
  });
});

describe("typed fields with suggestions", () => {
  const processor = {
    key: "processor",
    label: "Processor",
    type: "text" as const,
    required: true,
    options: [{ value: "apple_m3", label: "Apple M3" }],
  };
  const laptop: CategorySchema = { productType: "laptop", brands: [], fields: [processor] };

  it("accepts any model, not only the suggestions", () => {
    expect(validateSpecs(laptop, { processor: "Intel Core i5-1135G7" })).toEqual({});
  });

  it("limits the length like the backend does", () => {
    expect(validateSpecs(laptop, { processor: "x".repeat(121) })).toHaveProperty("processor");
  });

  it("shows an old option value as its label when editing", () => {
    expect(initialSpecValues(laptop, { processor: "apple_m3" })).toEqual({ processor: "Apple M3" });
  });
});

describe("sizes", () => {
  it("parses stored and typed sizes to GB", () => {
    expect(parseSizeGb("512GB SSD")).toBe(512);
    expect(parseSizeGb("1 TB")).toBe(1024);
    expect(parseSizeGb("512MB")).toBe(0.5);
    expect(parseSizeGb("Apple M3")).toBeNull();
  });

  it("formats GB the way buyers read it", () => {
    expect(formatGb(256)).toBe("256 GB");
    expect(formatGb(1024)).toBe("1 TB");
    expect(formatGb(1536)).toBe("1.5 TB");
    expect(formatGb(0.5)).toBe("512 MB");
  });

  it("opens an older text size as a number when editing", () => {
    const schema: CategorySchema = {
      productType: "smartphone",
      brands: [],
      fields: [{ key: "storage", label: "Storage", type: "number", unit: "GB", control: "size" }],
    };
    expect(initialSpecValues(schema, { storage: "256GB" })).toEqual({ storage: "256" });
    expect(initialSpecValues(schema, { storage: 1024 })).toEqual({ storage: "1024" });
  });

  it("accepts any size, including ones no list would have", () => {
    const schema: CategorySchema = {
      productType: "laptop",
      brands: [],
      fields: [{ key: "storage", label: "Storage", type: "number", unit: "GB", min: 1, required: true }],
    };
    expect(validateSpecs(schema, { storage: "480" })).toEqual({});
    expect(validateSpecs(schema, { storage: "lots" })).toHaveProperty("storage");
  });
});
