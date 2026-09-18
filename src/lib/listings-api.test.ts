import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmFreshness,
  confirmSelectedFreshness,
  deleteProduct,
  getShopProducts,
  markSold,
  pauseProduct,
  resumeProduct,
} from "./api";

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
});
