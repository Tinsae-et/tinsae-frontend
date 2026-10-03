import { GETTING_STARTED_STEPS } from "./types";

export function GettingStartedSection() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 sm:mt-28 lg:px-7">
      <div>
        <div className="text-xs font-bold tracking-[0.12em] uppercase text-tn-red">
          GETTING STARTED
        </div>
        <h2 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] text-tn-ink sm:text-[42px]">
          Account first, then the bot.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed font-medium text-tn-mute sm:text-[17px]">
          The bot needs to know which shop it is talking to, so you sign up before you link Telegram.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
        {GETTING_STARTED_STEPS.map((step, idx) => (
          <div key={step.step} className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tn-ink font-tn-mono text-xs font-bold text-white">
                {step.step}
              </span>
              {idx < GETTING_STARTED_STEPS.length - 1 && (
                <div className="hidden flex-1 items-center md:flex">
                  <div className="relative h-px flex-1 bg-tn-hair">
                    <div className="absolute -top-[2px] right-0 size-1.5 rounded-full bg-tn-ink/30" />
                  </div>
                </div>
              )}
            </div>
            <h3 className="mt-5 text-base font-extrabold tracking-tight text-tn-ink sm:text-lg">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-tn-mute">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
