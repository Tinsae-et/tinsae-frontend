import { PRICING } from "@/lib/pricing";
import { PricingHero } from "./pricing-hero";
import { PricingPlans } from "./pricing-plans";
import { FeaturedPreview } from "./featured-preview";
import { BillingFaq } from "./billing-faq";
import { PricingCta } from "./pricing-cta";

// A server component: only the plan toggle and the FAQ accordion ship as
// client islands, so the page is fully rendered HTML for search engines.
export function PricingPage() {
  return (
    <main className="overflow-hidden bg-white">
      <PricingHero />
      <PricingPlans plans={PRICING.plans} signupHref={PRICING.signupHref} />

      <div className="mt-14 sm:mt-16">
        <FeaturedPreview />
      </div>

      <BillingFaq faqs={PRICING.faqs} />
      <PricingCta signupHref={PRICING.signupHref} />
    </main>
  );
}
