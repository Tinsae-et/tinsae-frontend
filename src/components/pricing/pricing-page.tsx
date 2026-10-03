"use client";

import { useState } from "react";

import {
  PRICING_PLANS,
  BILLING_ACCOUNT,
  BILLING_INVOICES,
  PRICING_FAQS,
  type BillingCycle,
} from "./data";
import { PricingHero } from "./pricing-hero";
import { PricingCards } from "./pricing-cards";
import { FeaturedPreview } from "./featured-preview";
import { BillingManagement } from "./billing-management";
import { BillingFaq } from "./billing-faq";
import { PricingCta } from "./pricing-cta";

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <main className="overflow-hidden bg-white">
      {/* 1. Hero & Billing Cycle Toggle */}
      <PricingHero
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
      />

      {/* 2. 3 Tier Pricing Cards & Disclaimer */}
      <PricingCards plans={PRICING_PLANS} billingCycle={billingCycle} />

      {/* 3. What Featured Looks Like Preview */}
      <div className="mt-14 sm:mt-16">
        <FeaturedPreview />
      </div>

      {/* 4. Your Account / Manage Your Billing */}
      <BillingManagement
        account={BILLING_ACCOUNT}
        invoices={BILLING_INVOICES}
      />

      {/* 5. Billing Questions / Good to Know FAQ */}
      <BillingFaq faqs={PRICING_FAQS} />

      {/* 6. Bottom Banner CTA */}
      <PricingCta />
    </main>
  );
}
