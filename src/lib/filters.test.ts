import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  filtersFromSearchParams,
  filtersToProductQuery,
  filtersToSearchParams,
} from "./filters";

describe("filters.ts", () => {
  it("defaults to newest sort", () => {
    expect(DEFAULT_FILTERS.sort).toBe("newest");
  });

  it("contains the four standardized sort options", () => {
    expect(SORT_OPTIONS).toEqual([
      { value: "newest", label: "Newest" },
      { value: "oldest", label: "Oldest" },
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
    ]);
  });

  describe("filtersToProductQuery", () => {
    it("maps sort keys to backend ordering parameters", () => {
      expect(filtersToProductQuery({ ...DEFAULT_FILTERS, sort: "newest" }).ordering).toBe(
        "-created_at",
      );
      expect(filtersToProductQuery({ ...DEFAULT_FILTERS, sort: "oldest" }).ordering).toBe(
        "created_at",
      );
      expect(filtersToProductQuery({ ...DEFAULT_FILTERS, sort: "price-asc" }).ordering).toBe(
        "price",
      );
      expect(filtersToProductQuery({ ...DEFAULT_FILTERS, sort: "price-desc" }).ordering).toBe(
        "-price",
      );
    });
  });

  describe("filtersToSearchParams & filtersFromSearchParams", () => {
    it("omits sort in URL params if default ('newest')", () => {
      const params = filtersToSearchParams({ ...DEFAULT_FILTERS, sort: "newest" });
      expect(params.get("sort")).toBeNull();
    });

    it("includes sort in URL params if non-default", () => {
      const params = filtersToSearchParams({ ...DEFAULT_FILTERS, sort: "price-asc" });
      expect(params.get("sort")).toBe("price-asc");
    });

    it("round-trips sort successfully", () => {
      const original = { ...DEFAULT_FILTERS, sort: "price-desc" as const };
      const params = filtersToSearchParams(original);
      const parsed = filtersFromSearchParams(params);
      expect(parsed.sort).toBe("price-desc");
    });

    it("falls back to newest if sort param is unknown or missing", () => {
      const parsedMissing = filtersFromSearchParams(new URLSearchParams(""));
      expect(parsedMissing.sort).toBe("newest");

      const parsedUnknown = filtersFromSearchParams(new URLSearchParams("sort=unknown_value"));
      expect(parsedUnknown.sort).toBe("newest");
    });
  });

  describe("activeFilterCount", () => {
    it("does not count sort when it is default ('newest')", () => {
      expect(activeFilterCount({ ...DEFAULT_FILTERS, sort: "newest" })).toBe(0);
    });

    it("counts sort when non-default", () => {
      expect(activeFilterCount({ ...DEFAULT_FILTERS, sort: "oldest" })).toBe(1);
      expect(activeFilterCount({ ...DEFAULT_FILTERS, sort: "price-asc" })).toBe(1);
    });
  });
});
