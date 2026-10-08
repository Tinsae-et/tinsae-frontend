import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PricingCta({ signupHref }: { signupHref: string }) {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-24">
      <div className="relative mx-auto max-w-[1020px] overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-6 py-14 text-center text-white shadow-lg sm:px-12 sm:py-16">
        {/* Subtle Amharic background watermark as in 10 Billing.png */}
        <div
          aria-hidden="true"
          className="font-tn-amh text-white/[0.08] pointer-events-none absolute inset-0 flex items-center justify-center text-[100px] font-black tracking-wider select-none sm:text-[160px] md:text-[210px]"
        >
          ትንሣኤ
        </div>

        {/* Headline */}
        <h2 className="relative z-10 text-[28px] leading-tight font-extrabold tracking-[-0.035em] sm:text-[40px] md:text-[44px]">
          Start free. Upgrade when it pays off.
        </h2>

        {/* Subtitle */}
        <p className="relative z-10 mx-auto mt-3.5 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
          List your shop, get verified, and only pay when you want to be found
          first.
        </p>

        {/* Action Buttons */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={signupHref}
            className="text-tn-ink hover:bg-neutral-100 flex items-center justify-center gap-1.5 rounded-full bg-white px-6 py-3 text-xs font-bold shadow-xs transition-all hover:-translate-y-px sm:text-sm"
          >
            <span>Start free</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-white/20 bg-[#E25324] px-6 py-3 text-xs font-bold text-white shadow-xs transition-all hover:-translate-y-px hover:bg-[#D54516] sm:text-sm"
          >
            How it works
          </Link>
        </div>
      </div>
    </section>
  );
}
