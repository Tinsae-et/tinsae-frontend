import { Icon, type IconName } from "@/components/tinsae/icon";

const ITEMS: { icon: IconName; color: string; title: string; body: string }[] = [
  {
    icon: "sort",
    color: "#CC3000",
    title: "Compare every shop at once",
    body: "One product, all verified sellers across Ethiopia — sorted by lowest price and freshest stock. The spread is right there.",
  },
  {
    icon: "shield",
    color: "#1F8A5B",
    title: "Every listing is dated",
    body: "Shops re-confirm inventory through our Telegram bot. You see when each listing was last confirmed, and ones that go quiet are flagged rather than hidden.",
  },
  {
    icon: "tg",
    color: "#2A6FDB",
    title: "Contact, visit, buy in person",
    body: "Message the shop on Telegram, agree on terms, then walk in to inspect and pay. Tinsae never touches your money.",
  },
];

export function Features() {
  return (
    <section className="mx-auto mt-16 max-w-[1480px] px-6 sm:px-8 lg:mt-24 lg:px-12 xl:px-16">
      <div className="max-w-2xl">
        <p className="text-tn-red mb-3.5 text-[13px] font-bold tracking-[0.10em] uppercase">
          Why Tinsae
        </p>
        <h2 className="text-tn-ink text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[44px]">
          The honest way to shop electronics in Ethiopia.
        </h2>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-3 lg:gap-[18px]">
        {ITEMS.map((it) => (
          <div key={it.title} className="border-tn-hair rounded-2xl border bg-white p-6 lg:p-7">
            <span
              className="mb-4 flex size-13 items-center justify-center rounded-2xl"
              style={{ background: `${it.color}12`, color: it.color }}
            >
              <Icon name={it.icon} size={24} />
            </span>
            <h3 className="text-tn-ink mb-2 text-lg font-extrabold tracking-tight sm:text-xl">
              {it.title}
            </h3>
            <p className="text-tn-mute text-[14.5px] leading-relaxed">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
