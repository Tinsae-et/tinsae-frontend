import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  filtersFromSearchParams,
  filtersToProductQuery,
  filtersToSearchParams,
  withCategory,
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

  describe("spec filters", () => {
    it("round-trip option values and number ranges through the URL", () => {
      const original = {
        ...DEFAULT_FILTERS,
        category: "cars",
        specs: { fuel: ["diesel", "petrol"] },
        ranges: { year: { min: 2015, max: 2020 }, mileage: { max: 90000 } },
      };
      const params = filtersToSearchParams(original);
      expect(params.get("spec_fuel")).toBe("diesel,petrol");
      expect(params.get("spec_year_min")).toBe("2015");
      expect(params.get("spec_mileage_max")).toBe("90000");
      expect(params.has("spec_mileage_min")).toBe(false);

      const parsed = filtersFromSearchParams(params);
      expect(parsed.specs).toEqual({ fuel: ["diesel", "petrol"] });
      expect(parsed.ranges).toEqual({ year: { min: 2015, max: 2020 }, mileage: { max: 90000 } });
    });

    it("are sent to the API as spec_ params", () => {
      const query = filtersToProductQuery({
        ...DEFAULT_FILTERS,
        specs: { fuel: ["diesel"] },
        ranges: { year: { min: 2015 } },
      });
      expect(query.specParams).toEqual({ spec_fuel: "diesel", spec_year_min: "2015" });
    });

    it("count once per filtered spec", () => {
      expect(
        activeFilterCount({
          ...DEFAULT_FILTERS,
          specs: { fuel: ["diesel", "petrol"], color: ["White"] },
          ranges: { year: { min: 2015 } },
        }),
      ).toBe(3);
    });

    it("are cleared with brands and conditions when the category changes", () => {
      const inCars = {
        ...DEFAULT_FILTERS,
        category: "cars",
        minPrice: 1000,
        brands: ["Toyota"],
        conditions: ["used"],
        specs: { fuel: ["diesel"] },
        ranges: { year: { min: 2015 } },
      };
      const inBikes = withCategory(inCars, "motorcycles");
      expect(inBikes).toMatchObject({
        category: "motorcycles",
        minPrice: 1000,
        brands: [],
        conditions: [],
        specs: {},
        ranges: {},
      });
      expect(withCategory(inCars, "cars")).toBe(inCars);
    });
  });
});
