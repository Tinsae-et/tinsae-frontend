import React from "react";
import { Benefit } from "@/components/careers/data";

type Props = {
  benefits: Benefit[];
};

export default function WhatYouGet({ benefits }: Props) {
  return (
    <section className="bg-tn-paper border-y border-tn-hair px-4 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1480px]">
        <div className="max-w-[720px]">
          <p className="text-tn-red text-[13px] font-bold tracking-[0.11em] uppercase">
            What you get
          </p>
          <h2 className="text-tn-ink mt-3 text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
            The practical part.
          </h2>
          <p className="text-tn-mute mt-4 max-w-[620px] text-base leading-relaxed font-medium sm:text-[17px]">
            Concrete terms rather than vague perks. Reviewed twice a year against
            the realities of the local market.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.id}
              className="border-tn-hair rounded-2xl border bg-white p-6 sm:p-7 shadow-xs"
            >
              <p className="font-tn-mono text-tn-mute text-[11px] font-extrabold uppercase tracking-[0.08em]">
                {b.label}
              </p>
              <p className="text-tn-ink2 mt-2.5 text-[15px] leading-relaxed font-semibold">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}