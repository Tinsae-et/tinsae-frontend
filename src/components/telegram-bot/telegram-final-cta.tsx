import { Pill } from "@/components/tinsae/pill";

export function TelegramFinalCta() {
  return (
    <section className="mx-auto mt-20 mb-20 max-w-[1240px] px-6 sm:mt-28 lg:px-7">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-7 py-14 text-center shadow-lg sm:py-16">
        {/* Amharic Watermark */}
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 select-none text-[180px] leading-none font-bold text-white/[0.08] sm:text-[340px]"
        >
          ትንሳኤ
        </span>

        <div className="relative">
          <h2 className="text-[32px] leading-[1.06] font-extrabold tracking-[-0.035em] text-white sm:text-[46px]">
            Create your account, then connect the bot.
          </h2>
          <p className="mx-auto mt-3.5 max-w-lg text-base leading-relaxed font-medium text-white/90 sm:text-[17px]">
            It takes a few minutes to register. The bot does the rest, one tap a week.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Pill kind="light" size="lg" iconAfter="arrow" href="/signup">
              Create your shop account
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
