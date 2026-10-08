import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { cn } from "@/lib/utils";
import {
  formatAmount,
  monthlyPrice,
  priceNote,
  type BillingCycle,
  type PricingPlan,
} from "@/lib/pricing";

// Measurements follow design_handoff_owner_billing: radius 22, 30/28 padding,
// mono 42px price, 48px CTA, 20px feature ticks. The popular card is the dark
// one and sits 8px proud of the others.

export function PlanCard({
  plan,
  cycle,
  signupHref,
}: {
  plan: PricingPlan;
  cycle: BillingCycle;
  signupHref: string;
}) {
  const dark = Boolean(plan.popular);
  const muted = dark ? "text-white/60" : "text-tn-mute";

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-[22px] px-7 py-[30px]",
        dark
          ? "bg-tn-ink text-white shadow-[0_30px_70px_rgba(11,11,11,0.22)] md:-mt-2"
          : "border border-tn-hair bg-white text-tn-ink",
      )}
    >
      {/* "Most popular" is a claim about who's buying, so it only shows once
          the plan can actually be bought. */}
      {plan.popular && !plan.comingSoon && (
        <span className="bg-tn-red absolute -top-[13px] left-1/2 inline-flex h-[26px] -translate-x-1/2 items-center rounded-full px-3 text-[11px] font-extrabold tracking-[0.06em] whitespace-nowrap text-white uppercase">
          Most popular
        </span>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-extrabold tracking-[-0.02em]">{plan.name}</h2>
        {plan.comingSoon && (
          <span
            className={cn(
              "inline-flex h-[22px] items-center rounded-full px-2.5 text-[10.5px] font-extrabold tracking-[0.04em] uppercase",
              dark ? "bg-white/15 text-white" : "bg-tn-paper text-tn-ink2",
            )}
          >
            Coming soon
          </span>
        )}
      </div>
      <p className={cn("mt-1 text-[13.5px]", muted)}>{plan.tagline}</p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className={cn("font-tn-mono text-[13px]", muted)}>ETB</span>
        <span className="font-tn-mono text-[42px] leading-none font-semibold tracking-[-0.03em]">
          {formatAmount(monthlyPrice(plan, cycle))}
        </span>
        <span className={cn("text-[13.5px]", muted)}>/mo</span>
      </div>
      <p className={cn("font-tn-mono mt-2 min-h-4 text-xs", dark ? "text-white/50" : "text-tn-mute")}>
        {priceNote(plan, cycle)}
      </p>

      <div className="mt-6">
        <Pill
          href={signupHref}
          size="md"
          kind={plan.comingSoon ? (dark ? "light" : "outline") : "dark"}
          iconAfter="arrow"
          className="w-full"
        >
          {plan.cta}
        </Pill>
        {plan.comingSoon && (
          <p className={cn("mt-2.5 text-center text-[11.5px]", muted)}>
            Upgrade from your dashboard when it launches
          </p>
        )}
      </div>

      <div className={cn("my-6 border-t", dark ? "border-white/15" : "border-tn-hair2")} />

      {plan.featuresLabel && (
        <p className={cn("mb-3 text-[11.5px] font-extrabold tracking-[0.04em] uppercase", muted)}>
          {plan.featuresLabel}
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[13.5px] font-semibold">
            <span
              className={cn(
                "mt-px flex size-5 shrink-0 items-center justify-center rounded-full",
                dark ? "bg-white/12 text-white" : "bg-tn-green-soft text-tn-green",
              )}
            >
              <Icon name="check" size={12} strokeWidth={3} />
            </span>
            <span className={dark ? "text-white/90" : "text-tn-ink2"}>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
