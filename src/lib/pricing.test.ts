import { describe, expect, it } from "vitest";
import { PRICING, annualSavingMonths, formatAmount, monthlyPrice, priceNote } from "./pricing";

describe("pricing config", () => {
  it("has the three tiers, free first, each leading to sign-up", () => {
    expect(PRICING.plans.map((p) => p.id)).toEqual(["free", "featured", "premium"]);
    expect(PRICING.plans[0].monthly).toBe(0);
    expect(PRICING.signupHref).toBe("/signup");
  });

  it("marks the paid tiers as not yet purchasable", () => {
    for (const plan of PRICING.plans) {
      expect(Boolean(plan.comingSoon)).toBe(plan.monthly > 0);
    }
  });

  it("opens the FAQ with the commission answer", () => {
    expect(PRICING.faqs[0].question).toMatch(/commission/);
    expect(PRICING.faqs[0].answer).toMatch(/^No/);
  });
});

describe("price display", () => {
  const featured = { monthly: 1500, annual: 15000 };
  const premium = { monthly: 3500, annual: 35000 };

  it("spreads the annual price over twelve months, rounded", () => {
    expect(monthlyPrice(featured, "monthly")).toBe(1500);
    expect(monthlyPrice(featured, "annual")).toBe(1250);
    expect(monthlyPrice(premium, "annual")).toBe(2917);
  });

  it("describes how each cycle is billed", () => {
    expect(priceNote({ monthly: 0, annual: 0 }, "annual")).toBe("Free forever");
    expect(priceNote(featured, "monthly")).toBe("Billed monthly");
    expect(priceNote(featured, "annual")).toBe("ETB 15,000 billed yearly");
  });

  it("derives the 'months free' badge from the prices", () => {
    expect(annualSavingMonths(PRICING.plans)).toBe(2);
  });

  it("formats with thousands separators", () => {
    expect(formatAmount(15000)).toBe("15,000");
  });
});
