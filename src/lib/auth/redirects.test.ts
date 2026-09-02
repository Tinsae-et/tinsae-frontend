import { describe, expect, it } from "vitest";

import { homeFor, safeNext } from "./redirects";
import { hasShop } from "./roles";
import type { AuthShop } from "./types";

const shop: AuthShop = {
  id: "shop-1",
  name: "Bahir Dar Tech",
  slug: "bahir-dar-tech",
  city: "Bahir Dar",
  phone: "+251900000000",
  is_verified: true,
};

const withShop = { shops: [shop] };
const noShop = { shops: [] };
// `AuthUser.shops` is not optional, so this is unrepresentable in the type and
// has to be forced. It is still worth a test: the type describes what the
// serializer promises, and `hasShop` reads `user.shops?.length` because a
// payload that breaks that promise should route someone to onboarding rather
// than crash the page.
const unknownAccount = {} as unknown as { shops: AuthShop[] };

describe("hasShop", () => {
  it("is the only merchant test, because the backend sends no role", () => {
    // UserSerializer returns id/username/email/phone/shops. Any guard that asked
    // for `user.role` took the buyer branch for every real account.
    expect(hasShop(withShop)).toBe(true);
    expect(hasShop(noShop)).toBe(false);
    expect(hasShop(unknownAccount)).toBe(false);
  });
});

describe("homeFor", () => {
  it("sends an owner with a shop to the dashboard", () => {
    expect(homeFor(withShop)).toBe("/dashboard");
  });

  it("sends a signed-in account with no shop to onboarding, not the public site", () => {
    // Regression: this branch used to require `role === "owner"`, so it never
    // fired and shopless accounts were bounced to "/" — away from the one page
    // that could give them a shop.
    expect(homeFor(noShop)).toBe("/shop/onboarding");
    expect(homeFor(unknownAccount)).toBe("/shop/onboarding");
  });
});

describe("safeNext", () => {
  it("keeps a plain in-app path", () => {
    expect(safeNext("/products/nokia-g22")).toBe("/products/nokia-g22");
  });

  it("discards anything that could leave the site", () => {
    // `//evil` and `/\evil` are both protocol-relative URLs in a browser, which
    // is why the second character matters as much as the first.
    for (const hostile of ["//evil.com", "/\\evil.com", "https://evil.com", "evil", ""]) {
      expect(safeNext(hostile)).toBeNull();
    }
    expect(safeNext(undefined)).toBeNull();
  });
});
