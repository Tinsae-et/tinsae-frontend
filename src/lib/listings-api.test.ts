import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  confirmFreshness,
  confirmSelectedFreshness,
  createListing,
  deleteListingImage,
  deleteProduct,
  getShopProduct,
  getShopProducts,
  markSold,
  pauseProduct,
  resumeProduct,
  updateListing,
  updateListingImage,
  uploadListingImage,
} from "./api";
import { clearShopProductsCache, getShopProductsCacheKey } from "@/hooks/use-products";

describe("Shop Product Listings API client", () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("getShopProducts builds query with fresh filter and pagination params", async () => {
    const mockResponse = {
      count: 42,
      next: "/api/shop/test-shop/products?page=2",
      previous: null,
      results: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const res = await getShopProducts("test-shop", {
      page: 2,
      pageSize: 20,
      fresh: "false",
      ordering: "last_confirmed_at",
      q: "iphone",
      category: "phones",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("/api/shop/test-shop/products?");
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("page_size=20");
    expect(calledUrl).toContain("fresh=false");
    expect(calledUrl).toContain("ordering=last_confirmed_at");
    expect(calledUrl).toContain("q=iphone");
    expect(calledUrl).toContain("category=phones");
    expect(res).toEqual(mockResponse);
  });

  it("confirmFreshness calls same-origin confirm action route with POST", async () => {
    const mockProduct = { id: 1, slug: "iphone-15", is_available: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    const res = await confirmFreshness("test-shop", "iphone-15");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/shop/test-shop/products/iphone-15/confirm",
      { method: "POST" },
    );
    expect(res).toEqual(mockProduct);
  });

  it("confirmSelectedFreshness calls confirm-all route with slug list", async () => {
    const mockResult = { confirmed: ["p-1", "p-2"], not_found: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    const res = await confirmSelectedFreshness("test-shop", ["p-1", "p-2"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/shop/test-shop/products/confirm-all",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: ["p-1", "p-2"] }),
      },
    );
    expect(res).toEqual(mockResult);
  });

  it("markSold calls mark-sold route with POST", async () => {
    const mockProduct = { id: 2, slug: "galaxy-s24", is_available: false, status: "sold" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    const res = await markSold("test-shop", "galaxy-s24");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/shop/test-shop/products/galaxy-s24/mark-sold",
      { method: "POST" },
    );
    expect(res).toEqual(mockProduct);
  });

  it("pauseProduct and resumeProduct call pause and resume routes", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, is_available: false, status: "paused" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, is_available: true, status: "live" }),
      });

    await pauseProduct("test-shop", "macbook");
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "/api/shop/test-shop/products/macbook/pause",
      { method: "POST" },
    );

    await resumeProduct("test-shop", "macbook");
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "/api/shop/test-shop/products/macbook/resume",
      { method: "POST" },
    );
  });

  it("deleteProduct sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    await deleteProduct("test-shop", "old-item");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/shop/test-shop/products/old-item",
      { method: "DELETE" },
    );
  });

  it("throws descriptive error when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(confirmFreshness("test-shop", "failing-item")).rejects.toThrow(
      "Couldn't confirm freshness (500)",
    );
  });

  it("normalizes default query params so Overview and ListingsTable share the same cache key", () => {
    const keyFromOverview = getShopProductsCacheKey("shewa-electronics", {});
    const keyFromListings = getShopProductsCacheKey("shewa-electronics", {
      page: 1,
      pageSize: 20,
      ordering: "-created_at",
    });

    expect(keyFromOverview).toBe(keyFromListings);
    expect(keyFromOverview).toContain("shewa-electronics");
  });

  it("distinguishes different queries and shops in cache keys", () => {
    const key1 = getShopProductsCacheKey("shewa-electronics", { page: 1 });
    const key2 = getShopProductsCacheKey("shewa-electronics", { page: 2 });
    const keyOtherShop = getShopProductsCacheKey("other-shop", { page: 1 });

    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(keyOtherShop);
  });

  it("clears shop cache without throwing", () => {
    expect(() => clearShopProductsCache("shewa-electronics")).not.toThrow();
    expect(() => clearShopProductsCache()).not.toThrow();
  });

  it("createListing sends POST request with decimal price string and auth header", async () => {
    const mockProduct = {
      name: "iPhone 15",
      brand: "Apple",
      description: "Like new",
      price: "125000.50",
      currency: "ETB",
      category: "phones",
      condition: "new",
      is_available: true,
      stock: 3,
      specs: {},
      status: "live",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, slug: "iphone-15", ...mockProduct }),
    });

    const res = await createListing(mockProduct, "test-shop", "mock-token");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/shops/test-shop/products/");
    expect(options.method).toBe("POST");
    expect(options.headers["Authorization"]).toBe("Bearer mock-token");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const sentBody = JSON.parse(options.body);
    expect(sentBody.price).toBe("125000.50");
    expect(typeof sentBody.price).toBe("string");
    expect(res.slug).toBe("iphone-15");
  });

  it("createListing throws ApiError with field validation details on 400", async () => {
    const mockErrors = {
      price: ["Ensure that there are no more than 2 decimal places."],
      name: ["This field is required."],
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrors,
    });

    try {
      await createListing({} as unknown as Parameters<typeof createListing>[0], "test-shop", "mock-token");
      expect.fail("Should have thrown ApiError");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.data).toEqual(mockErrors);
    }
  });

  it("updateListing sends PATCH request to product slug endpoint", async () => {
    const updateData = {
      name: "iPhone 15 Updated",
      brand: "Apple",
      description: "Updated desc",
      price: "130000",
      currency: "ETB",
      category: "phones",
      condition: "used",
      is_available: false,
      stock: 0,
      specs: {},
      status: "sold",
      slug: "iphone-15",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ...updateData }),
    });

    const res = await updateListing(updateData, "test-shop", "mock-token");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/shops/test-shop/products/iphone-15/");
    expect(options.method).toBe("PATCH");
    expect(res.name).toBe("iPhone 15 Updated");
  });

  it("uploadListingImage sends FormData with file, display_order and is_primary", async () => {
    const mockFile = new File(["dummy content"], "cover.jpg", { type: "image/jpeg" });
    const imagePayload = {
      image: mockFile,
      display_order: 0,
      is_primary: true,
      preview: "blob:http://localhost/mock",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 10, url: "/media/cover.jpg", is_primary: true, display_order: 0 }),
    });

    const res = await uploadListingImage("iphone-15", "test-shop", imagePayload, "mock-token");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/shops/test-shop/products/iphone-15/images/");
    expect(options.method).toBe("POST");
    expect(options.headers["Authorization"]).toBe("Bearer mock-token");
    expect(options.body).toBeInstanceOf(FormData);
    expect(res.id).toBe(10);
  });

  it("updateListingImage sends PATCH request to reorder existing images", async () => {
    const imagePayload = {
      id: 15,
      image: "/media/old.jpg",
      display_order: 2,
      is_primary: false,
      preview: "/media/old.jpg",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 15, url: "/media/old.jpg", is_primary: false, display_order: 2 }),
    });

    const res = await updateListingImage("iphone-15", "test-shop", imagePayload, "mock-token");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/shops/test-shop/products/iphone-15/images/15/");
    expect(options.method).toBe("PATCH");
    expect(res.display_order).toBe(2);
  });

  it("deleteListingImage sends DELETE request to image endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await deleteListingImage("iphone-15", "test-shop", 22, "mock-token");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/shops/test-shop/products/iphone-15/images/22/");
    expect(options.method).toBe("DELETE");
  });

  it("getShopProduct fetches product and throws ApiError on 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Not found." }),
    });

    await expect(getShopProduct("non-existent", "test-shop", "mock-token")).rejects.toThrow(
      ApiError,
    );
  });
});
