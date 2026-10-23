import { afterEach, describe, expect, it, vi } from "vitest";

import { RATE_LIMITED_MESSAGE, replyToInquiry, startInquiry } from "./inquiries";
import { ApiError } from "./public";

function respond(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("inquiry client errors", () => {
  it("turns a 429 into a friendly message instead of DRF's throttle text", async () => {
    respond(429, { detail: "Request was throttled. Expected available in 42 seconds." });

    const error = await replyToInquiry("buyer", 7, "Hello").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(429);
    expect((error as ApiError).message).toBe(RATE_LIMITED_MESSAGE);
  });

  it("does the same when starting a conversation", async () => {
    respond(429, { detail: "Request was throttled." });
    await expect(startInquiry({ shop: 3, body: "Hi" })).rejects.toThrow(RATE_LIMITED_MESSAGE);
  });

  it("keeps Django's detail for other errors", async () => {
    respond(400, { detail: "This conversation is closed." });
    await expect(replyToInquiry("shop", 7, "Hi")).rejects.toThrow("This conversation is closed.");
  });
});
