import { describe, expect, it } from "vitest";
import { leavesPage } from "./navigation-guard";

const current = new URL("https://tinsae.et/shop/dashboard/shop-setting");
const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };
const link = (href: string, attrs: { target?: string; download?: boolean } = {}) => ({
  href,
  target: attrs.target ?? "",
  hasAttribute: (name: string) => name === "download" && Boolean(attrs.download),
});

describe("leavesPage", () => {
  it("is true for a plain click to another page", () => {
    expect(leavesPage(click, link("/shop/dashboard/overview"), current)).toBe(true);
    expect(leavesPage(click, link("https://example.com/"), current)).toBe(true);
  });

  it("ignores links that keep this page", () => {
    expect(leavesPage(click, link("/shop/dashboard/shop-setting#contact"), current)).toBe(false);
    expect(leavesPage(click, link("/x", { target: "_blank" }), current)).toBe(false);
    expect(leavesPage(click, link("/x", { download: true }), current)).toBe(false);
    expect(leavesPage(click, link("tel:+251911000000"), current)).toBe(false);
  });

  it("ignores new-tab and already-handled clicks", () => {
    expect(leavesPage({ ...click, metaKey: true }, link("/x"), current)).toBe(false);
    expect(leavesPage({ ...click, button: 1 }, link("/x"), current)).toBe(false);
    expect(leavesPage({ ...click, defaultPrevented: true }, link("/x"), current)).toBe(false);
  });
});
