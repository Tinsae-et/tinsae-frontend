import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

import type { BillingCycle, PricingPlan } from "./data";

interface PlanCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
}

export function PlanCard({ plan, billingCycle }: PlanCardProps) {
  const isFeatured = plan.featured;
  const isFree = plan.id === "free";
  const displayPrice =
    billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const displayNote =
    billingCycle === "annual" ? plan.priceNoteAnnual : plan.priceNoteMonthly;

  return (
    <article
      className={`relative flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all ${
        isFeatured
          ? "border-tn-ink bg-tn-ink text-white shadow-[0_20px_44px_rgba(11,11,11,0.18)]"
          : "border-tn-hair bg-white text-tn-ink shadow-xs"
      }`}
    >
      {isFeatured && (
        <span className="bg-tn-red absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.08em] whitespace-nowrap uppercase text-white shadow-xs">
          MOST POPULAR
        </span>
      )}

      <div>
        {/* Header */}
        <div>
          <h2 className="text-lg font-extrabold sm:text-[19px]">{plan.name}</h2>
          <p
            className={`mt-1 text-xs ${
              isFeatured ? "text-white/60" : "text-tn-mute"
            }`}
          >
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="mt-6 flex items-baseline">
          <span
            className={`mr-1.5 text-xs font-semibold ${
              isFeatured ? "text-white/60" : "text-tn-mute"
            }`}
          >
            ETB
          </span>
          <span className="font-tn-mono text-[36px] font-extrabold leading-none tracking-tight sm:text-[40px]">
            {displayPrice}
          </span>
          {plan.billing && (
            <span
              className={`ml-1.5 text-xs font-semibold ${
                isFeatured ? "text-white/60" : "text-tn-mute"
              }`}
            >
              /{plan.billing}
            </span>
          )}
        </div>
        <p
          className={`font-tn-mono mt-1.5 text-[11px] ${
            isFeatured ? "text-white/50" : "text-tn-mute"
          }`}
        >
          {displayNote}
        </p>

        {/* CTA Button */}
        <div className="mt-6">
          {isFree ? (
            <div className="border-tn-hair text-tn-ink flex w-full items-center justify-center gap-2 rounded-full border bg-white py-2.5 px-4 text-xs font-bold shadow-xs">
              <Check className="text-tn-green size-3.5" strokeWidth={2.5} />
              <span>Current plan</span>
            </div>
          ) : isFeatured ? (
            <Link
              href="/signup"
              className="text-tn-ink hover:bg-neutral-100 flex w-full items-center justify-center gap-1.5 rounded-full bg-white py-2.5 px-4 text-xs font-bold shadow-xs transition-all hover:-translate-y-px"
            >
              <span>{plan.cta}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <Link
              href="/signup"
              className="bg-tn-ink hover:bg-black flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 px-4 text-xs font-bold text-white shadow-xs transition-all hover:-translate-y-px"
            >
              <span>{plan.cta}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Divider */}
        <div
          className={`my-6 border-t ${
            isFeatured ? "border-white/15" : "border-tn-hair2"
          }`}
        />

        {/* Features Label */}
        {plan.featuresLabel && (
          <p
            className={`mb-3 text-[10px] font-extrabold tracking-[0.06em] uppercase ${
              isFeatured ? "text-white/55" : "text-tn-mute"
            }`}
          >
            {plan.featuresLabel}
          </p>
        )}

        {/* Features List */}
        <ul className="flex flex-col gap-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-xs">
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                  isFeatured
                    ? "bg-[#222222] text-white/90"
                    : "bg-tn-green-soft text-tn-green"
                }`}
              >
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              <span
                className={
                  isFeatured
                    ? "text-white/90 font-medium"
                    : "text-tn-ink2 font-medium"
                }
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
