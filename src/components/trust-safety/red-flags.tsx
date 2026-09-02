import { Icon } from "@/components/tinsae/icon";
import { Eyebrow } from "./section-head";

// The deposit and off-site items are the two real scam vectors in this market;
// they sit in the right-hand column so they read first on a wide screen.
const redFlags: [string, string][] = [
  [
    "No verified badge",
    "If a shop or listing isn’t verified, treat it with caution — it hasn’t passed our checks.",
  ],
  [
    "Wants a deposit first",
    "No verified shop asks you to send money — via mobile transfer or otherwise — before you arrive and inspect.",
  ],
  [
    "Price far below market",
    "A deal that’s wildly cheaper than every other shop is the oldest trick there is. Compare before you commit.",
  ],
  [
    "Pushes to meet off-site",
    "Insisting on meeting away from the shop, or moving the chat off Telegram to a personal account, is a red flag.",
  ],
  [
    "Rushes or pressures you",
    "“Someone else is coming, pay now to hold it.” Real shops let you take your time to inspect.",
  ],
  [
    "Refuses a receipt",
    "Any hesitation to put the shop name, item and date in writing means walk away.",
  ],
];

export function RedFlagsSection() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <div className="bg-tn-red-soft rounded-[24px] border border-[#FBD9C7] px-7 py-10 sm:px-10 lg:px-11 lg:py-12">
        <div className="max-w-[680px]">
          <Eyebrow>Red flags</Eyebrow>
          <h2 className="text-tn-ink text-[30px] leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-[38px]">
            If you see any of these, stop and reconsider.
          </h2>
          <p className="text-tn-ink2 mt-4 max-w-[560px] text-base leading-[1.55]">
            Verification removes most of the risk &mdash; but good instincts finish the job. Watch
            for these and you&rsquo;ll avoid nearly every scam.
          </p>
        </div>

        <div className="mt-[34px] grid gap-3.5 md:grid-cols-2">
          {redFlags.map(([title, description]) => (
            <div
              key={title}
              className="border-tn-hair flex items-start gap-3.5 rounded-[14px] border bg-white px-5 py-[18px]"
            >
              <span className="bg-tn-red-soft text-tn-red inline-flex size-[30px] shrink-0 items-center justify-center rounded-[9px]">
                <Icon name="back" size={15} strokeWidth={2.4} />
              </span>
              <div>
                <h3 className="text-tn-ink mt-0.5 mb-[5px] text-[15.5px] font-extrabold tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="text-tn-mute text-[13.5px] leading-[1.5]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
