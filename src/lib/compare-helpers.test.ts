import { describe, expect, it } from "vitest";
import { buildSpecRows, specMagnitude, type CompareItem } from "./compare-helpers";
import type { CategorySchema } from "./specs/schema";
import type { Product } from "./types";

const phones: CategorySchema = {
  productType: "smartphone",
  brands: [],
  fields: [
    {
      key: "storage",
      label: "Storage",
      type: "enum",
      options: [
        { value: "512gb", label: "512 GB" },
        { value: "1tb", label: "1 TB" },
      ],
    },
    { key: "color", label: "Color", type: "enum", options: [{ value: "black", label: "Black" }] },
  ],
};

const item = (slug: string, specs: Record<string, unknown>): CompareItem => ({
  isAvailable: true,
  product: { slug, specs, category: { slug: "phones" } } as unknown as Product,
});

describe("specMagnitude", () => {
  it("normalises sizes so TB compares above GB", () => {
    expect(specMagnitude("1 TB")).toBe(1024);
    expect(specMagnitude("512 GB")).toBe(512);
    expect(specMagnitude("4,422 mAh")).toBe(4422);
    expect(specMagnitude("Black")).toBeNull();
  });
});

describe("buildSpecRows", () => {
  it("labels rows from the schema and marks the better value", () => {
    const rows = buildSpecRows(
      [item("a", { storage: "512gb", color: "black" }), item("b", { storage: "1tb" })],
      { phones },
    );
    const storage = rows.find((r) => r.id === "spec-storage")!;
    expect(storage.label).toBe("Storage");
    expect(storage.cells.map((c) => c?.value)).toEqual(["512 GB", "1 TB"]);
    expect(storage.cells.map((c) => c?.isBest)).toEqual([false, true]);
  });

  it("shows a dash for a missing value instead of inventing one", () => {
    const rows = buildSpecRows(
      [item("a", { storage: "512gb", color: "black" }), item("b", { storage: "1tb" })],
      { phones },
    );
    const color = rows.find((r) => r.id === "spec-color")!;
    expect(color.cells[1]).toEqual({ value: "—", badge: "dash" });
  });

  it("marks no best when the values are equal", () => {
    const rows = buildSpecRows(
      [item("a", { storage: "512gb" }), item("b", { storage: "512gb" })],
      { phones },
    );
    expect(rows[0].cells.every((c) => !c?.isBest)).toBe(true);
  });
});
