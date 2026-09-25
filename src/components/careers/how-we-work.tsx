import React from "react";
import { Icon } from "@/components/tinsae/icon";
import { InfoCard } from "@/components/careers/data";

type Props = {
  cards: InfoCard[];
};

const TONE_STYLES = {
  orange: {
    bg: "bg-tn-red-soft",
    text: "text-tn-red",
  },
  blue: {
    bg: "bg-[#2A6FDB]/10",
    text: "text-[#2A6FDB]",
  },
  purple: {
    bg: "bg-[#7A2EBF]/10",
    text: "text-[#7A2EBF]",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
  },
};

export default function HowWeWork({ cards }: Props) {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1480px]">
        <div className="max-w-[720px]">
          <p className="text-tn-red text-[13px] font-bold tracking-[0.11em] uppercase">
            How we work
          </p>
          <h2 className="text-tn-ink mt-3 text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
            Four things you should know before applying.
          </h2>
          <p className="text-tn-mute mt-4 max-w-[620px] text-base leading-relaxed font-medium sm:text-[17px]">
            Not perks — the actual texture of the job. If any of these sound
            wrong to you, this is the useful place to find out.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map(({ id, title, description, icon, iconTone }) => {
            const tone = TONE_STYLES[iconTone] || TONE_STYLES.orange;
            return (
              <div
                key={id}
                className="border-tn-hair rounded-2xl border bg-white p-6 sm:p-7"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.bg}`}
                >
                  <Icon name={icon} size={20} className={tone.text} />
                </div>
                <h3 className="text-tn-ink mt-4 text-[17px] font-bold tracking-tight">
                  {title}
                </h3>
                <p className="text-tn-mute mt-2 text-[14px] leading-relaxed font-medium">
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}