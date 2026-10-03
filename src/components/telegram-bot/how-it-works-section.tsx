import { Icon } from "@/components/tinsae/icon";
import { HOW_IT_WORKS_STEPS } from "./types";

export function HowItWorksSection() {
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 sm:mt-24 lg:px-7">
      <div>
        <div className="text-xs font-bold tracking-[0.12em] uppercase text-tn-red">
          HOW IT WORKS
        </div>
        <h2 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] text-tn-ink sm:text-[42px]">
          A weekly tap keeps your
          <br />
          shop ranked.
        </h2>
        <p className="mt-3.5 max-w-2xl text-base leading-relaxed font-medium text-tn-mute sm:text-[17px]">
          Buyers browse freshest first. The bot is how you stay at the top without
          logging in to anything.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <div
            key={step.stepLabel}
            className="flex flex-col justify-between rounded-2xl border border-tn-hair bg-white p-7 shadow-xs sm:p-8"
          >
            <div>
              <div
                className={`mb-6 flex size-12 items-center justify-center rounded-xl ${step.iconBg}`}
              >
                <Icon name={step.icon} size={22} className={step.iconColor} />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-tn-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-tn-mute">
                {step.body}
              </p>
            </div>
            <div className="mt-8 font-tn-mono text-[11px] font-bold tracking-[0.14em] text-tn-mute uppercase">
              {step.stepLabel}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
