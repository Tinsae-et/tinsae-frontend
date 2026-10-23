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
  forwardedFor?: string;
  userAgent?: string;
} = {}) {
  const headers = new Headers({ host: "tinsae.test" });
  if (init.origin) headers.set("origin", init.origin);
  if (init.contentType) headers.set("content-type", init.contentType);
  if (init.forwardedFor) headers.set("x-forwarded-for", init.forwardedFor);
  if (init.userAgent) headers.set("user-agent", init.userAgent);

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

  // Django rate-limits anonymous contact intents per client IP. Without the
  // browser's address every anonymous visitor would share Next's bucket.
  it("forwards the client IP and user agent on the anonymous path", async () => {
    authedFetch.mockResolvedValue({ ok: false, reason: "no-session" });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ channel: "telegram", target: "https://t.me/x_shop" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({ channel: "telegram", shop: "test-shop" }),
      contentType: "application/json",
      forwardedFor: "197.156.100.7",
      userAgent: "Mozilla/5.0 Test",
    });
    await POST(req);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/inquiries\/contact\/$/);
    const sent = init.headers as Record<string, string>;
    expect(sent["X-Forwarded-For"]).toBe("197.156.100.7");
    expect(sent["User-Agent"]).toBe("Mozilla/5.0 Test");
    expect(sent.Authorization).toBeUndefined();
  });

  it("forwards the client IP on the signed-in path too", async () => {
    authedFetch.mockResolvedValue({
      ok: true,
      response: new Response(JSON.stringify({ channel: "phone", target: "tel:+251911223344" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    });

    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({ channel: "phone", shop: 12 }),
      contentType: "application/json",
      forwardedFor: "197.156.100.8",
    });
    await POST(req);

    const init = authedFetch.mock.calls[0][1];
    expect((init?.headers as Record<string, string>)["X-Forwarded-For"]).toBe("197.156.100.8");
  });

  it("answers 502, not a crash, when Django is unreachable", async () => {
    authedFetch.mockRejectedValue(new TypeError("fetch failed"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const req = makeRequest({
      origin: "https://tinsae.test",
      body: JSON.stringify({ channel: "phone", shop: 12 }),
      contentType: "application/json",
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  it("rejects an unknown channel or malformed shop without calling Django", async () => {
    for (const body of [
      { channel: "sms", shop: 12 },
      { channel: "phone", shop: "../admin" },
      { channel: "phone" },
    ]) {
      const req = makeRequest({
        origin: "https://tinsae.test",
        body: JSON.stringify(body),
        contentType: "application/json",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    }
    expect(authedFetch).not.toHaveBeenCalled();
  });
});

