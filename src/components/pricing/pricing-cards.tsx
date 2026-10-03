import type { BillingCycle, PricingPlan } from "./data";
import { PlanCard } from "./plan-card";

interface PricingCardsProps {
  plans: PricingPlan[];
  billingCycle: BillingCycle;
}

export function PricingCards({ plans, billingCycle }: PricingCardsProps) {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto grid max-w-[1020px] gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} />
        ))}
      </div>

      <p className="font-tn-mono text-tn-mute mt-7 px-4 text-center text-[11px] tracking-wide">
        0% commission on every sale · no payment handling · cancel anytime
      </p>
    </section>
  );
}
