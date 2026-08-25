import { Pill } from "@/components/tinsae/pill";

export function FinalCTA() {
  return (
    <section className="mx-auto mt-20 mb-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-7 py-14 text-center sm:px-12 lg:py-[62px]">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 text-[180px] leading-none font-bold text-white/[0.09] sm:text-[320px]"
        >
          ትንሳኤ
        </span>

        <div className="relative">
          <h2 className="text-[34px] leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-[48px]">
            Shop where the trust
            <br />
            is already proven.
          </h2>
          <p className="mx-auto mt-[18px] max-w-[520px] text-base leading-[1.5] text-white/[0.92] sm:text-lg">
            412 verified shops in Bole, every listing confirmed daily.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Pill kind="light" size="lg" iconAfter="arrow" href="/products">
              Browse verified shops
            </Pill>
            <Pill
              kind="ghost"
              size="lg"
              href="/how-it-works"
              className="border-white/60 text-white hover:bg-white/10"
            >
              How Tinsae works
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
