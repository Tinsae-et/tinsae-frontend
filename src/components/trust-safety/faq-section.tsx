"use client";

import { useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { SectionHead } from "./section-head";

const faqItems: [string, string][] = [
  // The first answer is the page's legal position. It must not be softened.
  [
    "Does “verified” mean Tinsae guarantees the product?",
    "No. Verification confirms the shop is a real, registered business at a real Bole address — not a guarantee of any single item. Always inspect and test before you pay; that’s why we get you there in person.",
  ],
  [
    "How often is stock re-confirmed?",
    "Every morning. Shops reply to our Telegram bot to confirm what’s still in stock. The freshness dot shows you how recently — green means within six hours.",
  ],
  [
    "What happens if a shop stops confirming?",
    "Its listings start aging (amber), and after about a day with no confirmation they’re hidden from search automatically, so you never message a dead listing.",
  ],
  [
    "Is it safe to pay before I visit?",
    "Never pay before you arrive and inspect. No verified shop will ask for a deposit up front. Tinsae itself never collects payment of any kind.",
  ],
  [
    "How do I report a problem?",
    "Tap “Report” on the listing or shop, or message our team on Telegram. Reports are reviewed by a real person, usually within 24 hours.",
  ],
  [
    "Can a shop lose its verification?",
    "Yes. Confirmed scams, fake stock, or repeated bad behaviour remove the badge and the shop from Tinsae. Serious cases are blocked permanently.",
  ],
];

export function FAQSection() {
  // One open at a time, the first open on arrival — that answer is the one we
  // most want read.
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="mx-auto mt-20 max-w-[880px] px-6 lg:mt-24 lg:px-7">
      <SectionHead center eyebrow="Questions" title="Trust, answered." />

      <div className="mt-[38px] flex flex-col gap-3">
        {faqItems.map(([question, answer], index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;

          return (
            <div
              key={question}
              className={`overflow-hidden rounded-[16px] border transition-[background-color,border-color] duration-150 ${
                isOpen ? "bg-tn-red-soft border-[#FBD9C7]" : "border-tn-hair bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full cursor-pointer items-center gap-4 px-6 py-5 text-left"
              >
                <span className="text-tn-ink flex-1 text-[17px] font-extrabold tracking-[-0.01em]">
                  {question}
                </span>
                <span
                  className={`inline-flex size-[30px] shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                    isOpen ? "bg-tn-red rotate-45 text-white" : "bg-tn-paper text-tn-ink2"
                  }`}
                >
                  <Icon name="plus" size={16} />
                </span>
              </button>

              {isOpen && (
                <div id={panelId} className="px-6 pb-[22px]">
                  <p className="text-tn-ink2 max-w-[680px] text-[15px] leading-[1.65]">{answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
