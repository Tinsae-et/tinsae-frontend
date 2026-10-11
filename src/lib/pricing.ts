// The pricing page's single source of truth: tiers, prices and FAQ. Static by
// design — no API, no CMS. Prices are numbers; every figure on the page is
// derived from them, so a price change is one edit here.
//
// Nothing is billed yet (see tinsae-project-overview.md §5), so paid tiers are
// `comingSoon`: they show their price but sell nothing, and every CTA leads to
// sign-up. Flip `comingSoon` off once billing exists.

export type BillingCycle = "monthly" | "annual";

export type PricingPlan = {
  id: "free" | "featured" | "premium";
  name: string;
  tagline: string;
  /** ETB per month on the monthly plan. */
  monthly: number;
  /** ETB per year on the annual plan. */
  annual: number;
  cta: string;
  popular?: boolean;
  comingSoon?: boolean;
  /** Shown above the feature list, e.g. "Everything in Free, plus:". */
  featuresLabel?: string;
  features: string[];
};

export type PricingFaq = { question: string; answer: string };

export const PRICING = {
  signupHref: "/signup",
  plans: [
    {
      id: "free",
      name: "Free",
      tagline: "List and get verified",
      monthly: 0,
      annual: 0,
      cta: "Start free",
      features: [
        "List your products",
        "Verified shop badge",
        "Daily Telegram stock check-in",
        "Public shop page with map and directions",
      ],
    },
    {
      id: "featured",
      name: "Featured",
      tagline: "Get found first",
      monthly: 1500,
      annual: 15000,
      cta: "Sign up free",
      popular: true,
      comingSoon: true,
      featuresLabel: "Everything in Free, plus:",
      features: [
        "Featured placement in search",
        "Highlighted in category pages",
        "Priority pin on the map",
        "Basic performance analytics",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      tagline: "Maximum reach across Ethiopia",
      monthly: 3500,
      annual: 35000,
      cta: "Sign up free",
      comingSoon: true,
      featuresLabel: "Everything in Featured, plus:",
      features: [
        "Top-of-search boosts",
        "Homepage shop rotation",
        "Full analytics and competitor pricing",
        "Priority support",
      ],
    },
  ] satisfies PricingPlan[] as PricingPlan[],
  faqs: [
    {
      question: "Does Tinsae take a commission on my sales?",
      answer:
        "No — never. We don't handle payments and take no cut of any transaction. Paid plans will be the only thing you ever pay us for.",
    },
    {
      question: "Is listing my shop really free?",
      answer:
        "Yes. Listing your products, getting verified and the daily Telegram stock check-in are free, and they stay free. Paid plans only add visibility.",
    },
    {
      question: "How does verification work?",
      answer:
        "The Tinsae team checks your shop by hand — you can't buy or grant it yourself. It's free on every plan, and the badge tells buyers your shop is real. Trust & safety explains exactly what we check.",
    },
    {
      question: "When can I upgrade to Featured or Premium?",
      answer:
        "Paid plans are launching soon. Sign up and list your shop for free now — you'll be able to upgrade from your dashboard as soon as they open.",
    },
  ] satisfies PricingFaq[] as PricingFaq[],
};

/** The per-month figure for a cycle: the annual price is shown spread over 12 months. */
export function monthlyPrice(plan: Pick<PricingPlan, "monthly" | "annual">, cycle: BillingCycle): number {
  return cycle === "annual" ? Math.round(plan.annual / 12) : plan.monthly;
}

/** The note under the price. */
export function priceNote(plan: Pick<PricingPlan, "monthly" | "annual">, cycle: BillingCycle): string {
  if (plan.monthly === 0) return "Free forever";
  return cycle === "annual" ? `ETB ${formatAmount(plan.annual)} billed yearly` : "Billed monthly";
}

/** Months free when paying yearly, against twelve monthly payments. */
export function annualSavingMonths(plans: Pick<PricingPlan, "monthly" | "annual">[]): number {
  const paid = plans.filter((p) => p.monthly > 0);
  if (paid.length === 0) return 0;
  return Math.min(...paid.map((p) => Math.round((p.monthly * 12 - p.annual) / p.monthly)));
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US");
}
