import { Icon } from "@/components/tinsae/icon";

const verificationSteps = [
  {
    title: "Phone & identity",
    description:
      "We confirm the shop owner matches the business, phone number, and registered details before the listing goes live.",
    icon: "phone",
    accent: "bg-green-100 text-green-700",
  },
  {
    title: "Business documents",
    description:
      "We check trade docs, registration details, and a real storefront address before a shop can carry the verified badge.",
    icon: "building",
    accent: "bg-green-100 text-green-700",
  },
  {
    title: "In-person store visit",
    description:
      "A team member visits the shop, confirms the space is real, and checks that the business is operating as advertised.",
    icon: "pin",
    accent: "bg-green-100 text-green-700",
  },
] as const;

export function VerificationSection() {
  return (
    <section className="pt-8">
      <div className="mx-auto max-w-3xl pb-6 text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-tn-red">The verification process</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-tn-ink md:text-5xl">
          Every shop passes three checks.
        </h2>
        <p className="mx-auto mt-4 max-w-[600px] text-base leading-7 text-zinc-600">
          A badge on Tinsae is earned the slow way: by being a real business at a real address that we&apos;ve confirmed ourselves.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {verificationSteps.map((step, index) => (
          <article key={step.title} className="rounded-[26px] border border-tn-hair bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <span className={`inline-flex size-12 items-center justify-center rounded-2xl ${step.accent}`}>
                <Icon name={step.icon} size={22} />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">Step {index + 1}</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-tn-ink">{step.title}</h3>
            <p className="text-sm leading-6 text-zinc-600">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
