import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthedResult } from "./authed-fetch";

const authedFetch = vi.fn<(url: string, init?: RequestInit) => Promise<AuthedResult>>();
const revalidateTag = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidateTag: (...args: unknown[]) => revalidateTag(...args) }));
vi.mock("./authed-fetch", () => ({ authedFetch: (url: string, init?: RequestInit) => authedFetch(url, init) }));

const { djangoPath, proxyToDjango } = await import("./django-proxy");

function browserRequest(method: string, init: { origin?: string; body?: string; type?: string } = {}) {
  const headers = new Headers({ host: "tinsae.test" });
  if (init.origin) headers.set("origin", init.origin);
  if (init.type) headers.set("content-type", init.type);
  return new Request("https://tinsae.test/api/shop/s/products/p/pause", {
    method,
    headers,
    body: init.body,
  });
}

function djangoJson(body: unknown, status = 200): AuthedResult {
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
  revalidateTag.mockReset();
});

describe("proxyToDjango", () => {
  it("rejects a cross-origin mutation before reaching Django", async () => {
    const res = await proxyToDjango(browserRequest("POST", { origin: "https://evil.example" }), "x/");
    expect(res.status).toBe(403);
    expect(authedFetch).not.toHaveBeenCalled();
  });

  it("answers a malformed JSON body with 400, not a crash", async () => {
    const res = await proxyToDjango(
      browserRequest("POST", { origin: "https://tinsae.test", body: "{nope", type: "application/json" }),
      "x/",
    );
    expect(res.status).toBe(400);
    expect(authedFetch).not.toHaveBeenCalled();
  });

  it("forwards a same-origin mutation and expires the public catalogue cache", async () => {
    authedFetch.mockResolvedValueOnce(djangoJson({ slug: "p", status: "paused" }));

    const res = await proxyToDjango(
      browserRequest("POST", { origin: "https://tinsae.test" }),
      djangoPath("shops", "s", "products", "p", "pause"),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ slug: "p", status: "paused" });
    expect(authedFetch.mock.calls[0][0]).toMatch(/\/api\/v1\/shops\/s\/products\/p\/pause\/$/);
    expect(revalidateTag).toHaveBeenCalledWith("catalog", { expire: 0 });
  });

  it("does not expire the cache for reads or failed writes", async () => {
    authedFetch.mockResolvedValueOnce(djangoJson({ results: [] }));
    await proxyToDjango(browserRequest("GET"), "x/");

    authedFetch.mockResolvedValueOnce(djangoJson({ name: ["Required."] }, 400));
    const res = await proxyToDjango(browserRequest("PATCH", { origin: "https://tinsae.test" }), "x/");

    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("turns an ended session into a 401 that clears the cookies", async () => {
    authedFetch.mockResolvedValueOnce({ ok: false, reason: "expired" });
    const res = await proxyToDjango(browserRequest("GET"), "x/");

    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie().some((c) => /tinsae_refresh=;/.test(c))).toBe(true);
  });

  it("never passes a non-JSON upstream error page through as JSON", async () => {
    authedFetch.mockResolvedValueOnce({
      ok: true,
      response: new Response("<html>Bad Gateway</html>", {
        status: 502,
        headers: { "content-type": "text/html" },
      }),
    });
    const res = await proxyToDjango(browserRequest("GET"), "x/");

    expect(res.status).toBe(502);
    expect((await res.json()).detail).toMatch(/trouble/);
  });

  it("encodes every path segment", () => {
    expect(djangoPath("shops", "a/b", "products")).toBe("shops/a%2Fb/products/");
  });
});
