import React from "react";
import { ProcessStep } from "@/components/careers/data";

type Props = {
  steps: ProcessStep[];
};

export default function HiringProcess({ steps }: Props) {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1480px]">
        <div className="max-w-[720px]">
          <p className="text-tn-red text-[13px] font-bold tracking-[0.11em] uppercase">
            Hiring process
          </p>
          <h2 className="text-tn-ink mt-3 text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
            Ten days, five steps, no guessing.
          </h2>
          <p className="text-tn-mute mt-4 max-w-[620px] text-base leading-relaxed font-medium sm:text-[17px]">
            We tell you where you stand at every stage, and the take-home is
            paid because your time is worth what ours is.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <div key={step.id} className="relative flex flex-col">
              <div className="flex items-center gap-3">
                <div className="bg-tn-ink font-tn-mono flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white">
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden flex-1 items-center lg:flex">
                    <span className="h-[1.5px] flex-1 bg-tn-hair" />
                    <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-tn-hair" />
                  </div>
                )}
              </div>

              <h3 className="text-tn-ink mt-4 text-[17px] font-extrabold tracking-tight">
                {step.title}
              </h3>
              <p className="text-tn-mute mt-2 text-[13.5px] leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}