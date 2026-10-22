import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthedResult } from "@/lib/auth/authed-fetch";

const authedFetch = vi.fn<(url: string, init?: RequestInit) => Promise<AuthedResult>>();
const headersMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));
vi.mock("@/lib/auth/authed-fetch", () => ({
  authedFetch: (url: string, init?: RequestInit) => authedFetch(url, init),
}));

const { POST } = await import("@/app/api/inquiries/message/route");

function makeRequest(init: {
  origin?: string;
  body?: string;
  contentType?: string;
} = {}) {
  const headers = new Headers({ host: "tinsae.test" });
  if (init.origin) headers.set("origin", init.origin);
  if (init.contentType) headers.set("content-type", init.contentType);

  return new Request("https://tinsae.test/api/inquiries/message", {
    method: "POST",
    headers,
    body: init.body,
  });
}

afterEach(() => {
  authedFetch.mockReset();
  headersMock.mockReset();
  vi.restoreAllMocks();
});

describe("POST /api/inquiries/message", () => {
  it("rejects cross-origin message requests with 403", async () => {
    headersMock.mockResolvedValue(new Headers());
    const req = makeRequest({
      origin: "https://evil.example",
      body: JSON.stringify({ shop: "test-shop", body: "Hello" }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(authedFetch).not.toHaveBeenCalled();
  });

  it("rejects empty message body with 400", async () => {
    headersMock.mockResolvedValue(new Headers());
    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({ shop: "test-shop", body: "   " }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.detail).toContain("Please enter a message");
  });

  it("rejects unauthenticated buyer with 401", async () => {
    headersMock.mockResolvedValue(new Headers());
    authedFetch.mockResolvedValue({
      ok: false,
      reason: "no-session",
    });

    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({ shop: "test-shop", body: "Is this available?" }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.detail).toContain("Please sign in");
  });

  it("forwards message successfully when authenticated", async () => {
    headersMock.mockResolvedValue(
      new Headers({
        "x-forwarded-for": "197.156.100.1",
        "user-agent": "Mozilla/5.0 Test",
      }),
    );

    authedFetch.mockResolvedValue({
      ok: true,
      response: new Response(
        JSON.stringify({
          id: 101,
          body: "Is this available?",
          status: "open",
        }),
        {
          status: 201,
          headers: { "content-type": "application/json" },
        },
      ),
    });

    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({
        shop: "test-shop",
        product: "iphone-15",
        body: "Is this available?",
      }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe(101);
    expect(data.body).toBe("Is this available?");
  });
});

