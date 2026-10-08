"use client";

import { useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { FAQ_ITEMS } from "./types";

export function TelegramFaqSection() {
  // First item open on arrival matching the design
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 sm:mt-28 lg:px-7">
      <div className="text-center">
        <div className="text-xs font-bold tracking-[0.12em] uppercase text-tn-red">
          QUESTIONS
        </div>
        <h2 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] text-tn-ink sm:text-[42px]">
          About the bot
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-[840px] space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;

          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-2xl border transition-colors duration-150 ${
                isOpen
                  ? "border-[#FBD9C7] bg-tn-red-soft"
                  : "border-tn-hair bg-white hover:border-[#DFDCD2]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="flex-1 text-[16px] font-extrabold tracking-tight text-tn-ink sm:text-[17px]">
                  {item.question}
                </span>
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOpen
                      ? "bg-tn-red text-white"
                      : "bg-tn-paper text-tn-mute hover:text-tn-ink"
                  }`}
                >
                  <Icon
                    name={isOpen ? "minus" : "plus"}
                    size={14}
                    strokeWidth={2.4}
                  />
                </span>
              </button>

              {isOpen && (
                <div id={panelId} className="px-6 pb-6">
                  <p className="text-sm leading-relaxed text-tn-ink2 sm:text-[15px]">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
