import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthedResult } from "@/lib/auth/authed-fetch";

const authedFetch = vi.fn<(url: string, init?: RequestInit) => Promise<AuthedResult>>();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/authed-fetch", () => ({
  authedFetch: (url: string, init?: RequestInit) => authedFetch(url, init),
}));

const { GET: getBuyerInquiries } = await import("@/app/api/inquiries/buyer/route");
const { GET: getInquiryThread } = await import("@/app/api/inquiries/buyer/[id]/route");
const { POST: replyInquiry } = await import("@/app/api/inquiries/buyer/[id]/reply/route");
const { POST: closeInquiry } = await import("@/app/api/inquiries/buyer/[id]/close/route");
const { GET: getUnreads } = await import("@/app/api/inquiries/buyer/unreads/route");

const { GET: getShopInquiries } = await import("@/app/api/inquiries/shop/route");
const { GET: getShopInquiryThread } = await import("@/app/api/inquiries/shop/[id]/route");
const { POST: replyShopInquiry } = await import("@/app/api/inquiries/shop/[id]/reply/route");
const { POST: closeShopInquiry } = await import("@/app/api/inquiries/shop/[id]/close/route");
const { GET: getShopUnreads } = await import("@/app/api/inquiries/shop/unreads/route");

function makeRequest(
  url: string,
  method = "GET",
  init: { origin?: string; body?: string; contentType?: string } = {},
) {
  const headers = new Headers({ host: "tinsae.test" });
  if (init.origin) headers.set("origin", init.origin);
  if (init.contentType) headers.set("content-type", init.contentType);

  return new Request(url, {
    method,
    headers,
    body: init.body,
  });
}

function mockDjangoResponse(body: unknown, status = 200): AuthedResult {
  return {
    ok: true,
    response: new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  };
}

afterEach(() => {
  authedFetch.mockReset();
  vi.restoreAllMocks();
});

describe("Buyer Inquiries Route Handlers", () => {
  it("GET /api/inquiries/buyer proxies to Django inquiries/buyer/", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse([{ id: 1, shop: { name: "Addis Shop" }, messages: [] }]),
    );

    const req = makeRequest("https://tinsae.test/api/inquiries/buyer?page=1");
    const res = await getBuyerInquiries(req);

    expect(res.status).toBe(200);
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/inquiries/buyer/?page=1"),
      expect.anything(),
    );
  });

  it("GET /api/inquiries/buyer/[id] retrieves thread", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ id: 42, shop: { name: "Bole Tech" }, messages: [] }),
    );

    const req = makeRequest("https://tinsae.test/api/inquiries/buyer/42");
    const res = await getInquiryThread(req, {
      params: Promise.resolve({ id: "42" }),
    });

    expect(res.status).toBe(200);
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/inquiries/buyer/42/"),
      expect.anything(),
    );
  });

  it("POST /api/inquiries/buyer/[id]/reply forwards reply", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ id: 42, messages: [{ body: "Hello" }] }),
    );

    const req = makeRequest(
      "https://tinsae.test/api/inquiries/buyer/42/reply",
      "POST",
      {
        origin: "https://tinsae.test",
        contentType: "application/json",
        body: JSON.stringify({ body: "Hello" }),
      },
    );

    const res = await replyInquiry(req, {
      params: Promise.resolve({ id: "42" }),
    });

    expect(res.status).toBe(200);
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/inquiries/buyer/42/reply/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("POST /api/inquiries/buyer/[id]/close closes thread", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ id: 42, status: "closed" }),
    );

    const req = makeRequest(
      "https://tinsae.test/api/inquiries/buyer/42/close",
      "POST",
      {
        origin: "https://tinsae.test",
      },
    );

    const res = await closeInquiry(req, {
      params: Promise.resolve({ id: "42" }),
    });

    expect(res.status).toBe(200);
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/inquiries/buyer/42/close/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("GET /api/inquiries/buyer/unreads fetches unread counter", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ unread_count: 3 }),
    );

    const req = makeRequest("https://tinsae.test/api/inquiries/buyer/unreads");
    const res = await getUnreads(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.unread_count).toBe(3);
  });
});

describe("Inquiry id allowlist", () => {
  const routes = [
    (id: string) => getInquiryThread(makeRequest("https://tinsae.test/x"), { params: Promise.resolve({ id }) }),
    (id: string) => getShopInquiryThread(makeRequest("https://tinsae.test/x"), { params: Promise.resolve({ id }) }),
    (id: string) =>
      replyInquiry(makeRequest("https://tinsae.test/x", "POST", { origin: "https://tinsae.test" }), {
        params: Promise.resolve({ id }),
      }),
    (id: string) =>
      replyShopInquiry(makeRequest("https://tinsae.test/x", "POST", { origin: "https://tinsae.test" }), {
        params: Promise.resolve({ id }),
      }),
    (id: string) =>
      closeInquiry(makeRequest("https://tinsae.test/x", "POST", { origin: "https://tinsae.test" }), {
        params: Promise.resolve({ id }),
      }),
    (id: string) =>
      closeShopInquiry(makeRequest("https://tinsae.test/x", "POST", { origin: "https://tinsae.test" }), {
        params: Promise.resolve({ id }),
      }),
  ];

  it("answers 404 for a non-numeric id without calling Django", async () => {
    for (const call of routes) {
      for (const id of ["../../shops/x", "1/close", "abc", ""]) {
        const res = await call(id);
        expect(res.status).toBe(404);
      }
    }
    expect(authedFetch).not.toHaveBeenCalled();
  });
});

describe("Shop Inquiries Route Handlers", () => {
  it("GET /api/inquiries/shop proxies to Django inquiries/shop/", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse([{ id: 1, shop: { name: "Addis Shop" }, messages: [] }]),
    );

    const req = makeRequest("https://tinsae.test/api/inquiries/shop?status=open&open=1");
    const res = await getShopInquiries(req);

    expect(res.status).toBe(200);
    // Only allow-listed params reach Django.
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/inquiries\/shop\/\?status=open$/),
      expect.anything(),
    );
  });

  it("GET /api/inquiries/shop/[id] retrieves thread for merchant", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ id: 99, shop: { name: "Bole Tech" }, messages: [] }),
    );

    const req = makeRequest("https://tinsae.test/api/inquiries/shop/99");
    const res = await getShopInquiryThread(req, {
      params: Promise.resolve({ id: "99" }),
    });

    expect(res.status).toBe(200);
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/inquiries/shop/99/"),
      expect.anything(),
    );
  });

  it("POST /api/inquiries/shop/[id]/reply forwards merchant reply", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ id: 99, messages: [{ body: "In stock, visit us today." }] }),
    );

    const req = makeRequest(
      "https://tinsae.test/api/inquiries/shop/99/reply",
      "POST",
      {
        origin: "https://tinsae.test",
        contentType: "application/json",
        body: JSON.stringify({ body: "In stock, visit us today." }),
      },
    );

    const res = await replyShopInquiry(req, {
      params: Promise.resolve({ id: "99" }),
    });

    expect(res.status).toBe(200);
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/inquiries/shop/99/reply/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("POST /api/inquiries/shop/[id]/close closes thread for merchant", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ id: 99, status: "closed" }),
    );

    const req = makeRequest(
      "https://tinsae.test/api/inquiries/shop/99/close",
      "POST",
      {
        origin: "https://tinsae.test",
      },
    );

    const res = await closeShopInquiry(req, {
      params: Promise.resolve({ id: "99" }),
    });

    expect(res.status).toBe(200);
    expect(authedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/inquiries/shop/99/close/"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("GET /api/inquiries/shop/unreads fetches shop unread counter", async () => {
    authedFetch.mockResolvedValue(
      mockDjangoResponse({ unread_count: 5 }),
    );

    const req = makeRequest("https://tinsae.test/api/inquiries/shop/unreads");
    const res = await getShopUnreads(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.unread_count).toBe(5);
  });
});

