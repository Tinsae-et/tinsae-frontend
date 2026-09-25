import { describe, expect, it, vi, beforeEach } from "vitest";
import { getInitials, getShopColor, mapShopToDirectoryShop } from "./shops-data";
import { getPublicShopProducts, getShops } from "./api/public";

describe("Shop utilities & API", () => {
  it("computes initials correctly", () => {
    expect(getInitials("Almeda Electronics")).toBe("AE");
    expect(getInitials("Sheba Computers")).toBe("SC");
    expect(getInitials("Single")).toBe("S");
  });

  it("assigns stable brand color based on shop name", () => {
    const color1 = getShopColor("Almeda Electronics");
    const color2 = getShopColor("Almeda Electronics");
    expect(color1).toBe(color2);
    expect(color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  describe("getPublicShopProducts", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("constructs URL with category and ordering query params", async () => {
      const mockResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            title: "Test Phone",
            price: "100.00",
            currency: "ETB",
            shop_name: "Test Shop",
            shop_verified: true,
            images: [],
            category: null,
            last_confirmed_at: null,
            slug: "test-phone",
            specs: {},
          },
        ],
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const res = await getPublicShopProducts("test-shop", {
        category: "phones",
        ordering: "-last_confirmed_at",
        page: 2,
        pageSize: 12,
      });

      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/api/v1/shop/test-shop/products/");
      expect(calledUrl).toContain("category=phones");
      expect(calledUrl).toContain("ordering=-last_confirmed_at");
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("page_size=12");
      expect(res.count).toBe(1);
    });

    it("handles 404 on page > 1 gracefully by returning empty results", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const res = await getPublicShopProducts("test-shop", { page: 3 });
      expect(res.count).toBe(0);
      expect(res.results).toEqual([]);
    });
  });

  describe("getShops", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("constructs URL with query params", async () => {
      const mockResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 10,
            name: "Bole Gadgets",
            slug: "bole-gadgets",
            city: "Bole · Atlas",
            is_verified: true,
            active_listings_count: 5,
          },
        ],
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const res = await getShops({
        pageSize: 50,
        verifiedOnly: true,
        city: "Addis Ababa",
      });

      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/api/v1/shops/");
      expect(calledUrl).toContain("page_size=50");
      expect(calledUrl).toContain("verified_only=1");
      expect(calledUrl).toContain("city=Addis+Ababa");
      expect(res.count).toBe(1);
    });
  });

  describe("mapShopToDirectoryShop", () => {
    it("maps a shop matching SHOPS_RICH with preserved rich styling", () => {
      const shop = {
        id: 1,
        name: "Almeda Electronics",
        slug: "almeda-electronics",
        description: "Official store",
        city: "Bole",
        phone: "+251911223344",
        is_verified: true,
        active_listings_count: 12,
        created_at: "2021-05-10T00:00:00Z",
      };

      const mapped = mapShopToDirectoryShop(shop);
      expect(mapped.slug).toBe("almeda-electronics");
      expect(mapped.hood).toBe("Atlas");
      expect(mapped.isVerified).toBe(true);
      expect(mapped.listings).toBe(12);
      expect(mapped.memberSince).toBe("2021");
      expect(mapped.color).toBe("#0F2A4D");
    });

    it("maps a new shop not in SHOPS_RICH with sensible defaults", () => {
      const shop = {
        id: 99,
        name: "New Bole Lab",
        slug: "new-bole-lab",
        description: "Freshly registered shop",
        city: "Bole · Rwanda",
        phone: "+251988776655",
        is_verified: false,
        active_listings_count: 3,
        created_at: "2025-01-15T00:00:00Z",
      };

      const mapped = mapShopToDirectoryShop(shop);
      expect(mapped.id).toBe("99");
      expect(mapped.slug).toBe("new-bole-lab");
      expect(mapped.hood).toBe("Rwanda");
      expect(mapped.city).toBe("Bole");
      expect(mapped.isVerified).toBe(false);
      expect(mapped.listings).toBe(3);
      expect(mapped.memberSince).toBe("2025");
      expect(mapped.phone).toBe("+251988776655");
    });
  });
});
