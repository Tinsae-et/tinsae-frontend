import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

const reportingList = [
  { title: "Report it", desc: "Tap Report on any listing or shop, or send a message on Telegram. One tap, no forms." },
  { title: "We review fast", desc: "Our trust team investigates within 24 hours. The listing can be frozen while we check." },
  { title: "Action is taken", desc: "Confirmed bad actors lose the badge and are removed. Repeat or serious cases are blocked for good." },
] as const;

export function ReportingSection() {
  return (
    <section className="p-5 md:p-8">
      <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mb-6 max-w-2xl text-start">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-tn-red">Reporting & moderation</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-tn-ink md:text-5xl">
            See something off? Tell us.
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-600">
            Verification is the front door, the community keeps it honest. Reporting takes one tap and every report is read by a real person.
          </p>
          <Pill kind="solid" size="lg" href="/products" className="mt-4">
            Report a shop
          </Pill>
        </div>

        <div className="grid gap-2">
          {reportingList.map((item) => (
            <div key={item.title} className="rounded-[14px] border border-tn-hair bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-tn-red-soft text-tn-red">
                  <Icon name="arrow" size={16} />
                </span>
                <h3 className="text-lg font-bold text-tn-ink">{item.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
