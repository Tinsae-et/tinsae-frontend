import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Production cookie names (`__Host-` prefix, Secure) are decided when
// session.ts loads, so NODE_ENV has to be set before the proxy is imported.
async function loadProxy() {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production");
  return (await import("./proxy")).default;
}

function request(path: string, cookies: Record<string, string>) {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(new URL(path, "https://tinsae.test"), { headers: { cookie } });
}

describe("proxy", () => {
  beforeEach(() => {
    // The refresh route rejects the (blacklisted) refresh token.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ detail: "Session expired" }), { status: 401 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("clears __Host- cookies with Secure when a refresh is rejected", async () => {
    const proxy = await loadProxy();
    const res = await proxy(request("/shop/dashboard/overview", { "__Host-tinsae_refresh": "stale" }));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/signin");

    // A __Host- cookie set without Secure is ignored by browsers, so a
    // "deletion" without it leaves the stale session in place — the root of
    // the /signin <-> /dashboard redirect loop.
    const cleared = res.headers.getSetCookie();
    for (const name of ["__Host-tinsae_access", "__Host-tinsae_refresh"]) {
      const header = cleared.find((c) => c.startsWith(`${name}=`));
      expect(header, name).toBeDefined();
      expect(header).toMatch(/Secure/);
      expect(header).toMatch(/Path=\//);
      expect(header).toMatch(/Max-Age=0/);
    }
  });

  it("refreshes in-process, forwarding the browser's IP, and stores both rotated tokens", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ access: "new-access", refresh: "new-refresh" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const proxy = await loadProxy();

    const req = request("/shop/dashboard/overview", { "__Host-tinsae_refresh": "live-token-1" });
    req.headers.set("x-forwarded-for", "196.188.1.10");
    const res = await proxy(req);

    // Straight to Django's refresh endpoint — no HTTP hop through our own app —
    // carrying the user's address so throttling counts them, not this server.
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/auth\/token\/refresh\/$/);
    expect((init.headers as Record<string, string>)["X-Forwarded-For"]).toBe("196.188.1.10");

    expect(res.headers.get("location")).toBeNull();
    const set = res.headers.getSetCookie();
    expect(set.some((c) => c.startsWith("__Host-tinsae_access=new-access"))).toBe(true);
    expect(set.some((c) => c.startsWith("__Host-tinsae_refresh=new-refresh"))).toBe(true);
  });

  it("keeps the session when Django is only temporarily unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>502</html>", { status: 502 })));
    const proxy = await loadProxy();

    const res = await proxy(request("/products", { "__Host-tinsae_refresh": "live-token-2" }));

    // A 502 is not a rejected token: signing the merchant out would turn a
    // backend blip into a forced logout.
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it("does not bounce /signin to the dashboard on cookie presence alone", async () => {
    const proxy = await loadProxy();
    const res = await proxy(request("/signin", { "__Host-tinsae_refresh": "stale" }));

    // Renders the page (clearing the dead session) instead of redirecting.
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.getSetCookie().some((c) => c.startsWith("__Host-tinsae_refresh="))).toBe(true);
  });
});
