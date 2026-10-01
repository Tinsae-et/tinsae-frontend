import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectTelegram, disconnectTelegram, getTelegramState } from "./client";

describe("Telegram API client helpers", () => {
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

  describe("getTelegramState", () => {
    it("calls GET /api/shop/{slug}/telegram and returns TelegramState", async () => {
      const mockState = {
        status: "connected",
        linked_at: "2026-09-30T10:00:00Z",
        blocked_at: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockState,
      });

      const res = await getTelegramState("almeda-store");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/shop/almeda-store/telegram");
      expect(init?.method).toBe("GET");
      expect(res).toEqual(mockState);
    });

    it("throws ApiError when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: "Shop not found." }),
      });

      await expect(getTelegramState("unknown-shop")).rejects.toThrow(
        "Shop not found.",
      );
    });
  });

  describe("connectTelegram", () => {
    it("calls POST /api/shop/{slug}/telegram/connect and returns connection details", async () => {
      const mockConnect = {
        code: "TIN-ABC1234",
        deep_link: "https://t.me/tinsae_bot?start=TIN-ABC1234",
        bot_username: "tinsae_bot",
        expires_at: "2026-10-02T10:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConnect,
      });

      const res = await connectTelegram("almeda-store");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/shop/almeda-store/telegram/connect");
      expect(init?.method).toBe("POST");
      expect(res).toEqual(mockConnect);
    });

    it("throws ApiError when connect endpoint fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: "Server error" }),
      });

      await expect(connectTelegram("almeda-store")).rejects.toThrow(
        "Server error",
      );
    });
  });

  describe("disconnectTelegram", () => {
    it("calls POST /api/shop/{slug}/telegram/disconnect", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(disconnectTelegram("almeda-store")).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/shop/almeda-store/telegram/disconnect");
      expect(init?.method).toBe("POST");
    });

    it("throws ApiError when disconnect fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ detail: "Permission denied." }),
      });

      await expect(disconnectTelegram("almeda-store")).rejects.toThrow(
        "Permission denied.",
      );
    });
  });
});
