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

const { POST } = await import("@/app/api/inquiries/contact/route");

function makeRequest(init: {
  origin?: string;
  body?: string;
  contentType?: string;
} = {}) {
  const headers = new Headers({ host: "tinsae.test" });
  if (init.origin) headers.set("origin", init.origin);
  if (init.contentType) headers.set("content-type", init.contentType);

  return new Request("https://tinsae.test/api/inquiries/contact", {
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

describe("POST /api/inquiries/contact", () => {
  it("rejects cross-origin mutations with 403", async () => {
    headersMock.mockResolvedValue(new Headers());
    const req = makeRequest({
      origin: "https://malicious-site.example",
      body: JSON.stringify({ channel: "telegram", shop: "test-shop" }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(authedFetch).not.toHaveBeenCalled();
  });

  it("answers a malformed JSON body with 400, not a crash", async () => {
    headersMock.mockResolvedValue(new Headers());
    const req = makeRequest({
      origin: "https://tinsae.test",
      body: "{invalid-json",
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.detail).toContain("Malformed request body");
  });

  it("forwards authenticated request using authedFetch", async () => {
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
          channel: "phone",
          target: "tel:+251911223344",
          phone: "+251911223344",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    });

    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({
        channel: "phone",
        shop: 12,
        product: 42,
      }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.channel).toBe("phone");
    expect(data.target).toBe("tel:+251911223344");
    expect(authedFetch).toHaveBeenCalled();
  });

  it("falls back to server fetch for unauthenticated users", async () => {
    headersMock.mockResolvedValue(
      new Headers({
        "x-forwarded-for": "197.156.100.2",
        "user-agent": "Mozilla/5.0 Test",
      }),
    );

    authedFetch.mockResolvedValue({
      ok: false,
      reason: "no-session",
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          channel: "telegram",
          target: "https://t.me/test_merchant",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({
        channel: "telegram",
        shop: "test-shop",
      }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.channel).toBe("telegram");
    expect(data.target).toBe("https://t.me/test_merchant");
    expect(fetchSpy).toHaveBeenCalled();
  });
});

