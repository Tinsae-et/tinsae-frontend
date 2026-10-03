import { describe, expect, it } from "vitest";
import {
  PRICING_PLANS,
  PRICING_FAQS,
  BILLING_ACCOUNT,
  BILLING_INVOICES,
  PREVIEW_SHOPS,
} from "@/components/pricing/data";

describe("Pricing Page Data & Architecture", () => {
  it("includes all 3 tiers with correct data matching 10 Billing.png", () => {
    expect(PRICING_PLANS).toHaveLength(3);
    const [free, featured, premium] = PRICING_PLANS;

    expect(free.name).toBe("Free");
    expect(free.monthlyPrice).toBe("0");
    expect(free.cta).toBe("Current plan");
    expect(free.features).toContain("Up to 20 live listings");
    expect(free.features).toContain("Verified shop badge");

    expect(featured.name).toBe("Featured");
    expect(featured.featured).toBe(true);
    expect(featured.monthlyPrice).toBe("1,500");
    expect(featured.cta).toBe("Upgrade to Featured");
    expect(featured.features).toContain("Featured placement in search");

    expect(premium.name).toBe("Premium");
    expect(premium.monthlyPrice).toBe("3,500");
    expect(premium.cta).toBe("Upgrade to Premium");
    expect(premium.features).toContain("Top-of-search boosts");
  });

  it("contains valid billing account and invoices matching design mockup", () => {
    expect(BILLING_ACCOUNT.currentPlan).toBe("Featured");
    expect(BILLING_ACCOUNT.paymentMethod.provider).toBe("telebirr");
    expect(BILLING_ACCOUNT.paymentMethod.status).toBe("Active");

    expect(BILLING_INVOICES).toHaveLength(3);
    expect(BILLING_INVOICES[0].id).toBe("INV-2026-0612");
    expect(BILLING_INVOICES[0].status).toBe("Paid");
  });

  it("contains all FAQ items matching design mockup", () => {
    expect(PRICING_FAQS).toHaveLength(4);
    expect(PRICING_FAQS[0].question).toContain("take a commission");
    expect(PRICING_FAQS[1].question).toContain("cancel or change plan");
    expect(PRICING_FAQS[2].question).toContain("listings if I downgrade");
    expect(PRICING_FAQS[3].question).toContain("payment methods");
  });

  it("contains the preview shops for the search mockup", () => {
    expect(PREVIEW_SHOPS).toHaveLength(3);
    const featuredShop = PREVIEW_SHOPS.find((s) => s.featured);
    expect(featuredShop?.name).toBe("Almeda Electronics");
    expect(featuredShop?.price).toBe("ETB 142,500");
  });
});
