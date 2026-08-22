import { Icon } from "@/components/tinsae/icon";

const safetySteps = [
  {
    title: "Meet at the shop",
    description: "Always inspect the item in person before paying or relying on a price quote.",
    icon: "pin",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    title: "Inspect before you pay",
    description: "Check the box, battery, screen, accessories, and any labels before handing over money.",
    icon: "eye",
    accent: "bg-rose-100 text-rose-700",
  },
  {
    title: "Test it on the spot",
    description: "If it is powered on, test the device the same day and confirm that it matches the listing.",
    icon: "bolt",
    accent: "bg-violet-100 text-violet-700",
  },
  {
    title: "Keep your receipt",
    description: "Save the chat, shop name, and agreed price so there is a clear record if something is off.",
    icon: "check",
    accent: "bg-emerald-100 text-emerald-700",
  },
] as const;

export function SafetyRules() {
  return (
    <section className="pt-5">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-tn-red">Buying safely</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-tn-ink md:text-5xl">
          Four habits that keep every purchase clean.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {safetySteps.map((item) => (
          <article key={item.title} className="rounded-[22px] border border-tn-hair bg-white p-4">
            <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${item.accent}`}>
              <Icon name={item.icon} size={18} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-tn-ink">{item.title}</h3>
            <p className="text-sm leading-6 text-zinc-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
