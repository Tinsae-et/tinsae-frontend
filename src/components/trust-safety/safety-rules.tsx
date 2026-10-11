import { Icon, type IconName } from "@/components/tinsae/icon";
import { SectionHead } from "./section-head";

const safetyHabits: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "building",
    title: "Meet at the shop",
    description:
      "Always complete the deal at the shop’s verified address — never a street corner, car park or someone’s home.",
  },
  {
    icon: "eye",
    title: "Inspect before you pay",
    description:
      "Unbox it, check the serial, look for damage. A real shop expects this and gives you the time.",
  },
  {
    icon: "spec",
    title: "Test it on the spot",
    description:
      "Power it on, check the screen and battery, confirm it’s the exact variant listed before money changes hands.",
  },
  {
    icon: "tag",
    title: "Keep your receipt",
    description:
      "Ask for a written receipt with the shop name and date. It’s your record for warranty or any dispute.",
  },
];

export function SafetyRules() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <SectionHead
        eyebrow="Buying safely"
        title="Four habits that keep every purchase clean."
        intro="Tinsae gets you to the right verified shop. These simple steps keep you safe once you’re there."
      />

      <div className="mt-[42px] grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {safetyHabits.map((habit) => (
          <article
            key={habit.title}
            className="border-tn-hair rounded-[16px] border bg-white px-[22px] py-6"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span className="bg-tn-red-soft inline-flex size-10 shrink-0 items-center justify-center rounded-[11px]">
                <Icon name={habit.icon} size={19} className="text-tn-red" />
              </span>
              <span className="bg-tn-green inline-flex size-[26px] shrink-0 items-center justify-center rounded-full text-white">
                <Icon name="check" size={14} strokeWidth={2.6} />
              </span>
            </div>
            <h3 className="text-tn-ink mb-2 text-[16.5px] font-extrabold tracking-[-0.01em]">
              {habit.title}
            </h3>
            <p className="text-tn-mute text-[13.5px] leading-[1.55]">{habit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
