import { Pill } from "@/components/tinsae/pill";

// Design block 12. The "8,920 live listings from 412 verified shops" line is
// demo copy (see StatBand) — static until the backend exposes real metrics.
export function FinalCTA() {
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-20 lg:px-7">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-7 py-14 text-center sm:px-12 lg:py-16">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 text-[340px] leading-none font-bold text-white/[0.08]"
        >
          ትንሳኤ
        </span>
        <div className="relative">
          <h2 className="text-[32px] leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-[50px]">
            Stop guessing. Start with stock
            <br className="hidden sm:block" /> you can trust.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
            Browse 8,920 live listings from 412 verified shops across Bole.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Pill kind="light" size="lg" iconAfter="arrow" href="/products">
              Browse listings
            </Pill>
            <Pill
              kind="ghost"
              size="lg"
              href="#"
              className="border-white/60 text-white hover:bg-white/10"
            >
              List your shop
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
