import { Pill } from "@/components/tinsae/pill";
import { Eyebrow } from "./section-head";

// Public SLA commitments — the 24-hour review and "read by a real person" are
// promises operations has to be able to meet.
const reportingSteps: [string, string][] = [
  ["Report it", "Tap “Report” on any listing or shop, or message our team on Telegram. One tap, no forms."],
  [
    "We review fast",
    "Our trust team investigates — usually within 24 hours. The listing can be frozen while we check.",
  ],
  [
    "Action is taken",
    "Confirmed bad actors lose their badge and are removed. Repeat or serious cases are blocked for good.",
  ],
];

export function ReportingSection() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <Eyebrow>Reporting &amp; moderation</Eyebrow>
          <h2 className="text-tn-ink text-[30px] leading-[1.07] font-extrabold tracking-[-0.03em] sm:text-[38px]">
            See something off? Tell us.
          </h2>
          <p className="text-tn-mute mt-[18px] max-w-[440px] text-base leading-[1.6]">
            Verification is the front door; the community keeps it honest. Reporting takes one tap
            and every report is read by a real person.
          </p>
          <div className="mt-[26px] flex flex-wrap gap-3">
            <Pill kind="solid" size="md" icon="tg" href="/contact">
              Report a shop
            </Pill>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {reportingSteps.map(([title, description], index) => (
            <div
              key={title}
              className="border-tn-hair flex items-start gap-4 rounded-[16px] border bg-white px-[22px] py-5"
            >
              <span className="bg-tn-ink font-tn-mono inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-tn-ink mt-1 mb-[5px] text-[16.5px] font-extrabold tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="text-tn-mute text-sm leading-[1.55]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
