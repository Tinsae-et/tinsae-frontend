import { describe, expect, it } from "vitest";
import { StatBand } from "../components/home/stat-band";

describe("StatBand", () => {
  it("hides the section (returns null) if stats is null or undefined", () => {
    expect(StatBand({ stats: null })).toBeNull();
    expect(StatBand({ stats: undefined })).toBeNull();
  });

  it("hides the section if total_products or verified_shops is missing", () => {
    expect(StatBand({ stats: { total_products: 10 } })).toBeNull();
    expect(StatBand({ stats: { verified_shops: 5 } })).toBeNull();
  });

  it("hides the section if counters are zero", () => {
    expect(StatBand({ stats: { total_products: 0, verified_shops: 0 } })).toBeNull();
  });

  it("renders the section when valid counters are present", () => {
    const result = StatBand({
      stats: {
        total_products: 1250,
        verified_shops: 45,
        verified_shop_products: 1100,
        category_product_count: { phones: 10, laptops: 5 },
      },
    });
    expect(result).not.toBeNull();
    expect(result?.type).toBe("section");
  });
});
