import React from "react";
import { FaqItem } from "@/components/careers/data";
import { Icon } from "@/components/tinsae/icon";

type Props = {
  faqs: FaqItem[];
};

export default function Faqs({ faqs }: Props) {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[800px] text-center">
        <p className="text-tn-red text-[13px] font-bold tracking-[0.11em] uppercase">
          Questions
        </p>
        <h2 className="text-tn-ink mt-3 text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
          Before you apply
        </h2>

        <div className="mt-10 space-y-3.5 text-left">
          {faqs.map((item, index) => (
            <details
              key={item.id}
              open={index === 0}
              className="group border-tn-hair rounded-2xl border bg-white transition-[border-color,background] open:border-tn-red/20 open:bg-tn-red-soft/20"
            >
              <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left select-none [&::-webkit-details-marker]:hidden">
                <span className="text-tn-ink text-[16px] font-bold sm:text-[17px]">
                  {item.question}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tn-paper text-tn-mute transition-colors group-open:bg-tn-red group-open:text-white">
                  <span className="block group-open:hidden">
                    <Icon name="plus" size={14} />
                  </span>
                  <span className="hidden group-open:block">
                    <Icon name="minus" size={14} />
                  </span>
                </span>
              </summary>
              <div className="text-tn-ink2 px-6 pb-6 text-[14.5px] leading-relaxed font-medium">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}