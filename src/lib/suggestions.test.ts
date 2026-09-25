import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  extractBrand,
  getPriceBracket,
  getInitialSuggestions,
  getNextSuggestions,
} from "./suggestions";
import type { Product } from "./types";
import * as api from "./api/public";

vi.mock("./api/public", () => ({
  getProducts: vi.fn(),
}));

const mockProduct: Product = {
  id: 1,
  title: "Apple iPhone 15 Pro",
  description: "Test description",
  price: "100000.00",
  currency: "ETB",
  shop_name: "Test Shop",
  shop_verified: true,
  category: { id: 10, name: "Phones", slug: "phones", parent: null, display_order: 1 },
  images: [],
  last_confirmed_at: "2026-09-01T12:00:00Z",
  confirmation_status: "fresh",
  slug: "apple-iphone-15-pro",
  specs: { brand: "Apple", storage: "256GB" },
};

describe("extractBrand", () => {
  it("extracts brand from specs when present", () => {
    expect(extractBrand(mockProduct)).toBe("Apple");
  });

  it("extracts brand from title first word when specs brand is missing", () => {
    const prod = { ...mockProduct, specs: {} };
    expect(extractBrand(prod)).toBe("Apple");
  });

  it("returns null when title starts with a number and specs brand is missing", () => {
    const prod = { ...mockProduct, title: "20W Charger", specs: {} };
    expect(extractBrand(prod)).toBe(null);
  });
});

describe("getPriceBracket", () => {
  it("calculates 65% - 135% range", () => {
    const bracket = getPriceBracket("100000.00");
    expect(bracket.minPrice).toBe(65000);
    expect(bracket.maxPrice).toBe(135000);
  });

  it("handles non-numeric or zero price gracefully", () => {
    expect(getPriceBracket("0")).toEqual({});
    expect(getPriceBracket("invalid")).toEqual({});
  });
});

describe("getInitialSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("excludes current product and deduplicates results", async () => {
    const p1: Product = { ...mockProduct, id: 1 }; // current product
    const p2: Product = { ...mockProduct, id: 2, title: "Apple iPhone 14" };
    const p3: Product = { ...mockProduct, id: 3, title: "Apple iPhone 13" };

    const getProductsMock = vi.mocked(api.getProducts);
    getProductsMock.mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [p1, p2, p3],
    });

    const suggestions = await getInitialSuggestions(mockProduct, 4);

    expect(suggestions).toHaveLength(2);
    expect(suggestions.find((p) => p.id === 1)).toBeUndefined();
    expect(suggestions.map((p) => p.id)).toEqual([2, 3]);
  });
});

describe("getNextSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips seen IDs and increments page", async () => {
    const p2: Product = { ...mockProduct, id: 2 };
    const p4: Product = { ...mockProduct, id: 4 };
    const p5: Product = { ...mockProduct, id: 5 };

    const getProductsMock = vi.mocked(api.getProducts);
    getProductsMock.mockResolvedValueOnce({
      count: 10,
      next: "http://test/next",
      previous: null,
      results: [p2, p4, p5],
    });

    const res = await getNextSuggestions(mockProduct, {
      categoryPage: 2,
      seenIds: [2], // p2 was already seen
      mode: "category",
      pageSize: 4,
    });

    expect(res.products.map((p) => p.id)).toEqual([4, 5]);
    expect(res.nextCategoryPage).toBe(3);
    expect(res.mode).toBe("category");
    expect(res.hasMore).toBe(true);
  });

  it("fetches next category page if current category page only contains seen items", async () => {
    const p2: Product = { ...mockProduct, id: 2 };
    const p3: Product = { ...mockProduct, id: 3 };
    const p4: Product = { ...mockProduct, id: 4 };

    const getProductsMock = vi.mocked(api.getProducts);
    // Page 2: only p2 (already seen)
    getProductsMock.mockResolvedValueOnce({
      count: 10,
      next: "http://test/next-3",
      previous: null,
      results: [p2],
    });
    // Page 3: p3, p4 (fresh)
    getProductsMock.mockResolvedValueOnce({
      count: 10,
      next: "http://test/next-4",
      previous: null,
      results: [p3, p4],
    });

    const res = await getNextSuggestions(mockProduct, {
      categoryPage: 2,
      seenIds: [2],
      mode: "category",
      pageSize: 4,
    });

    expect(res.products.map((p) => p.id)).toEqual([3, 4]);
    expect(res.nextCategoryPage).toBe(4);
    expect(res.mode).toBe("category");
    expect(res.hasMore).toBe(true);
  });

  it("transitions to discovery mode when category has no more pages", async () => {
    const p6: Product = { ...mockProduct, id: 6 };
    const p7: Product = { ...mockProduct, id: 7 };

    const getProductsMock = vi.mocked(api.getProducts);
    // Category page with no next
    getProductsMock.mockResolvedValueOnce({
      count: 3,
      next: null,
      previous: null,
      results: [p6],
    });
    // Discovery page
    getProductsMock.mockResolvedValueOnce({
      count: 50,
      next: "http://test/discovery-next",
      previous: null,
      results: [p7],
    });

    const res = await getNextSuggestions(mockProduct, {
      categoryPage: 5,
      seenIds: [],
      mode: "category",
      pageSize: 4,
    });

    expect(res.mode).toBe("discovery");
    expect(res.products.map((p) => p.id)).toEqual([6, 7]);
    expect(res.hasMore).toBe(true);
  });

  it("reports hasMore false once category and discovery are both exhausted", async () => {
    const p6: Product = { ...mockProduct, id: 6 };
    const p7: Product = { ...mockProduct, id: 7 };

    const getProductsMock = vi.mocked(api.getProducts);
    // Last category page.
    getProductsMock.mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [p6],
    });
    // Last discovery page.
    getProductsMock.mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [p7],
    });

    const res = await getNextSuggestions(mockProduct, {
      categoryPage: 5,
      seenIds: [],
      mode: "category",
      pageSize: 4,
    });

    expect(res.mode).toBe("discovery");
    expect(res.hasMore).toBe(false);
  });

  it("keeps hasMore true when the last category page fills the batch on its own", async () => {
    const results = [2, 3, 4, 5].map((id) => ({ ...mockProduct, id }));

    const getProductsMock = vi.mocked(api.getProducts);
    getProductsMock.mockResolvedValueOnce({
      count: 4,
      next: null,
      previous: null,
      results,
    });

    const res = await getNextSuggestions(mockProduct, {
      categoryPage: 3,
      seenIds: [],
      mode: "category",
      pageSize: 4,
    });

    // Category is spent, but discovery has not been touched yet, so the next
    // scroll still has somewhere to go — and no discovery request was made.
    expect(getProductsMock).toHaveBeenCalledTimes(1);
    expect(res.mode).toBe("discovery");
    expect(res.hasMore).toBe(true);
    expect(res.nextDiscoveryPage).toBe(1);
  });

  it("reports hasMore false when a discovery page is the last one", async () => {
    const p9: Product = { ...mockProduct, id: 9 };

    const getProductsMock = vi.mocked(api.getProducts);
    getProductsMock.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [p9],
    });

    const res = await getNextSuggestions(mockProduct, {
      discoveryPage: 4,
      seenIds: [],
      mode: "discovery",
      pageSize: 4,
    });

    expect(res.products.map((p) => p.id)).toEqual([9]);
    expect(res.nextDiscoveryPage).toBe(5);
    expect(res.hasMore).toBe(false);
  });

  it("advances discovery page if first discovery page contains only seen items", async () => {
    const p2: Product = { ...mockProduct, id: 2 };
    const p8: Product = { ...mockProduct, id: 8 };

    const getProductsMock = vi.mocked(api.getProducts);
    // Discovery page 1: only p2 (seen)
    getProductsMock.mockResolvedValueOnce({
      count: 20,
      next: "http://test/discovery-2",
      previous: null,
      results: [p2],
    });
    // Discovery page 2: p8 (fresh)
    getProductsMock.mockResolvedValueOnce({
      count: 20,
      next: "http://test/discovery-3",
      previous: null,
      results: [p8],
    });

    const res = await getNextSuggestions(mockProduct, {
      discoveryPage: 1,
      seenIds: [2],
      mode: "discovery",
      pageSize: 4,
    });

    expect(res.products.map((p) => p.id)).toEqual([8]);
    expect(res.nextDiscoveryPage).toBe(3);
    expect(res.mode).toBe("discovery");
    expect(res.hasMore).toBe(true);
  });
});
