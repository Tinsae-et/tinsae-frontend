"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import type { PricingFaq } from "@/lib/pricing";

export function BillingFaq({ faqs }: { faqs: readonly PricingFaq[] }) {
  // First item open by default as in design screenshot
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20">
      <div className="mx-auto max-w-[700px]">
        {/* Eyebrow and Heading */}
        <div className="text-center">
          <p className="text-tn-red mb-2 text-[11px] font-extrabold tracking-[0.14em] uppercase sm:text-xs">
            Questions
          </p>
          <h2 className="text-tn-ink text-2xl leading-tight font-extrabold tracking-[-0.03em] sm:text-[32px]">
            Good to know
          </h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-8 flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? "border-[#FCD8CD] bg-[#FFF8F5] p-5 sm:p-6"
                    : "border-tn-hair hover:border-neutral-300 bg-white p-5 sm:p-6"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-tn-ink text-sm font-bold sm:text-[15px]">
                    {faq.question}
                  </span>
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen
                        ? "bg-tn-red text-white"
                        : "bg-tn-paper text-tn-mute"
                    }`}
                  >
                    {isOpen ? (
                      <X className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      <Plus className="size-3.5" strokeWidth={2.5} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <p className="text-tn-mute mt-3.5 max-w-xl text-xs leading-relaxed sm:text-[13.5px]">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
