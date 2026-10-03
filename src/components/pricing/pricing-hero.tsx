"use client";

import type { BillingCycle } from "./data";

interface PricingHeroProps {
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
}

export function PricingHero({
  billingCycle,
  onBillingCycleChange,
}: PricingHeroProps) {
  return (
    <section className="px-5 pt-14 pb-10 text-center sm:pt-18 sm:pb-12">
      <p className="text-tn-red mb-3 text-[11px] font-extrabold tracking-[0.14em] uppercase sm:text-xs">
        Plans &amp; Billing
      </p>
      <h1 className="text-tn-ink mx-auto max-w-2xl text-[36px] leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-[48px] md:text-[52px]">
        Be the shop buyers see first.
      </h1>
      <p className="text-tn-mute mx-auto mt-3.5 max-w-[540px] text-sm leading-relaxed sm:text-[15px]">
        Listing and verification are always free. Featured plans boost where you
        appear — and we never take a cut of any sale.
      </p>

      {/* Monthly / Annual toggle */}
      <div className="mt-7 inline-flex items-center rounded-full border border-tn-hair bg-white p-1 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => onBillingCycleChange("monthly")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            billingCycle === "monthly"
              ? "bg-tn-ink text-white shadow-xs"
              : "text-tn-ink2 hover:text-tn-ink"
          }`}
          aria-pressed={billingCycle === "monthly"}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onBillingCycleChange("annual")}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
            billingCycle === "annual"
              ? "bg-tn-ink text-white shadow-xs"
              : "text-tn-ink2 hover:text-tn-ink"
          }`}
          aria-pressed={billingCycle === "annual"}
        >
          Annual
        </button>
        <span className="bg-tn-green-soft text-tn-green ml-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase sm:text-[10px]">
          2 MONTHS FREE
        </span>
      </div>
    </section>
  );
}
