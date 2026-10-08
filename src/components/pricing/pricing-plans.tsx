"use client";

import { useState } from "react";

import { annualSavingMonths, type BillingCycle, type PricingPlan } from "@/lib/pricing";
import { PlanCard } from "./plan-card";

/** The monthly/annual toggle and the tier cards — the page's one interactive piece. */
export function PricingPlans({ plans, signupHref }: { plans: PricingPlan[]; signupHref: string }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const savedMonths = annualSavingMonths(plans);

  return (
    <section className="px-4 sm:px-6">
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Billing cycle"
          className="inline-flex items-center gap-1 rounded-full border border-tn-hair bg-white p-[5px] shadow-[0_2px_10px_rgba(11,11,11,0.04)]"
        >
          {(["monthly", "annual"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              aria-pressed={cycle === option}
              className={`inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-full px-4 text-[13.5px] font-bold transition-colors ${
                cycle === option ? "bg-tn-ink text-white" : "text-tn-ink2 hover:text-tn-ink"
              }`}
            >
              {option === "monthly" ? "Monthly" : "Annual"}
              {option === "annual" && savedMonths > 0 && (
                <span
                  className={`rounded-full px-[7px] py-0.5 text-[10.5px] font-extrabold tracking-[0.02em] uppercase ${
                    cycle === "annual" ? "bg-tn-red text-white" : "bg-tn-green-soft text-tn-green"
                  }`}
                >
                  {savedMonths} months free
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1140px] gap-[18px] md:grid-cols-3 md:items-start">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} signupHref={signupHref} />
        ))}
      </div>

      <p className="font-tn-mono text-tn-mute mt-8 px-4 text-center text-[13px]">
        0% commission on every sale · no payment handling · listing is always free
      </p>
    </section>
  );
}
