import { Icon, type IconName } from "@/components/tinsae/icon";
import { SectionHead } from "./section-head";

// These map to the owner Verification screen's steps — keep the two in sync.
const verificationSteps: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "phone",
    title: "Phone & identity",
    description:
      "We confirm a working Ethiopian number and match it to the owner — the same person who answers when you call.",
  },
  {
    icon: "spec",
    title: "Business documents",
    description:
      "Trade licence and registration are checked against the shop’s name and address before anything goes live.",
  },
  {
    icon: "building",
    title: "In-person store visit",
    description:
      "Someone from Tinsae walks into the actual shop. No real storefront, no badge — it’s that simple.",
  },
];

export function VerificationSection() {
  return (
    <section id="verification" className="mx-auto mt-20 max-w-[1240px] scroll-mt-24 px-6 lg:mt-24 lg:px-7">
      <SectionHead
        center
        eyebrow="The verification process"
        title="Every shop passes three checks."
        intro="A badge on Tinsae is earned the slow way — by being a real business at a real address that we’ve confirmed ourselves."
      />

      <div className="mt-11 grid gap-[18px] md:grid-cols-3">
        {verificationSteps.map((step, index) => (
          <article
            key={step.title}
            className="border-tn-hair relative rounded-[18px] border bg-white px-7 py-[30px] transition-shadow hover:shadow-[0_18px_40px_rgba(11,11,11,0.06)]"
          >
            <span className="font-tn-mono text-tn-mute absolute top-6 right-[26px] text-[11.5px] font-semibold tracking-[0.04em]">
              Step {index + 1}
            </span>
            <div className="bg-tn-green-soft mb-5 flex size-[54px] items-center justify-center rounded-[15px]">
              <Icon name={step.icon} size={25} className="text-tn-green" />
            </div>
            <h3 className="text-tn-ink mb-2.5 text-xl font-extrabold tracking-[-0.02em]">
              {step.title}
            </h3>
            <p className="text-tn-mute text-[14.5px] leading-[1.6]">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
