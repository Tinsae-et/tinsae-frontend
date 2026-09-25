import { Icon, type IconName } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import Link from "next/link";

export const PRINCIPLES: Array<{
  icon: IconName;
  accent: string;
  title: string;
  body: string;
}> = [
  {
    icon: "shield",
    accent: "#1F8A5B",
    title: "Trust is earned in person",
    body: "We visit every shop before it gets a badge. No self-serve verification, no uploaded-photo shortcuts. It is slower, and it is the whole product.",
  },
  {
    icon: "bolt",
    accent: "#CC3000",
    title: "A price is only true today",
    body: "Every listing is reconfirmed daily or it stops being shown. We would rather have a smaller catalogue than a stale one.",
  },
  {
    icon: "user",
    accent: "#2A6FDB",
    title: "The shop keeps the relationship",
    body: "We never insert ourselves into the sale, take a cut, or hold anyone's money. The buyer meets the seller and they do business.",
  },
  {
    icon: "pin",
    accent: "#7A2EBF",
    title: "Built for how Addis actually shops",
    body: "Telegram, not email. Landmarks, not street addresses. Cash in hand, not checkout flows. We designed around the city as it is.",
  },
];

export const TIMELINE = [
  {
    when: "2024 · Q3",
    title: "A wasted Saturday",
    body: "Five shops in Bole, four of them out of stock, one of them 40% over the going rate. The question that started this: why does nobody know what is actually on the shelf?",
    dot: "#76746E",
  },
  {
    when: "2025 · Q1",
    title: "Forty shops, one spreadsheet",
    body: "We walked Bole and asked owners to text us their stock each morning. They did. Buyers started asking us before they left the house.",
    dot: "#76746E",
  },
  {
    when: "2025 · Q3",
    title: "The bot replaced the spreadsheet",
    body: "One Telegram message at 9am, one tap to confirm. The daily check-in became the product, and everything else was built around it.",
    dot: "#B8741F",
  },
  {
    when: "2026 · Q1",
    title: "412 verified shops",
    body: "Bole is covered. 96% of listings are reconfirmed within 24 hours, and the median shop replies to a buyer in about three minutes.",
    dot: "#1F8A5B",
  },
  {
    when: "Next",
    title: "City by city, category by category",
    body: "The model is not electronics-specific. Verify the seller, confirm the stock daily, let people meet. That works for anything sold face to face.",
    dot: "#CC3000",
  },
];

export const TEAM = [
  {
    initials: "SM",
    name: "Selam Mekonnen",
    role: "Co-founder · Product",
    color: "#0F2A4D",
    note: "Walked the first 40 shops",
  },
  {
    initials: "DT",
    name: "Dawit Tesfaye",
    role: "Co-founder · Engineering",
    color: "#3B5742",
    note: "Built the stock bot",
  },
  {
    initials: "HA",
    name: "Hanna Alemu",
    role: "Head of Verification",
    color: "#7A2E2E",
    note: "Runs the in-person visits",
  },
  {
    initials: "YB",
    name: "Yonas Bekele",
    role: "Shop Partnerships",
    color: "#2D4A5E",
    note: "Bole, then everywhere",
  },
];

// PLACEHOLDER: marketing figures. Replace with getPublicStats() values (or
// confirmed numbers) before launch.
export const ABOUT_STATS = [
  ["412", "verified shops in Bole"],
  ["8,920", "listings live today"],
  ["96%", "reconfirmed within 24h"],
  ["0%", "commission, ever"],
] as const;

export const WHAT_WE_ARE = [
  "A directory of shops verified in person",
  "A live, daily-confirmed price comparison",
  "A direct line to the shop on Telegram",
  "Free to browse, with no markup on any price",
] as const;

export const WHAT_WE_ARE_NOT = [
  "A payment processor or escrow service",
  "A delivery company",
  "A reseller — we own no stock",
  "A reviews site with stale, unchecked listings",
] as const;

function Eyebrow({ children }: { children: string }) {
  return (
    <div className="text-tn-red mb-3.5 text-[13px] font-bold tracking-[0.11em] uppercase">
      {children}
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  intro,
  link,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-[700px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-tn-ink text-[34px] leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-[42px]">
          {title}
        </h2>
        {intro && (
          <p className="text-tn-mute mt-4 max-w-[620px] text-base leading-relaxed font-medium sm:text-[17px]">
            {intro}
          </p>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-tn-ink inline-flex shrink-0 items-center gap-1.5 text-sm font-bold transition-colors hover:text-tn-red"
        >
          {link.label}
          <Icon name="arrow" size={15} className="text-tn-red" />
        </Link>
      )}
    </div>
  );
}

function AboutHero() {
  return (
    <section className="border-tn-hair2 overflow-hidden border-b bg-[radial-gradient(120%_90%_at_88%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_52%),#FFF]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-6 py-[60px] sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:px-7 lg:py-[72px]">
        <div className="tn-rise">
          <div className="border-tn-hair inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-tn-ink2 shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
            <Icon name="building" size={14} className="text-tn-red" />
            About Tinsae
          </div>
          <h1 className="text-tn-ink mt-6 text-[clamp(44px,6vw,58px)] leading-[0.99] font-extrabold tracking-[-0.04em]">
            We made the trust
            <br />
            <span className="text-tn-red">legible.</span>
          </h1>
          <p className="text-tn-mute mt-[22px] max-w-[520px] text-lg leading-[1.55] font-medium sm:text-[18.5px]">
            Addis already has honest shops and fair prices. What it lacked was
            proof — a way to know, before you cross town, which shop has the
            thing and what they will charge for it.
          </p>
          <div className="font-tn-mono text-tn-mute mt-7 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-3 text-[13px] sm:text-[13.5px]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="shield" size={14} className="text-tn-green" />
              <b className="font-semibold text-tn-green">412</b> verified shops
            </span>
            <span className="bg-tn-hair size-1 rounded-full" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <b className="font-semibold text-tn-ink">2022</b> founded in Addis
            </span>
            <span className="bg-tn-hair size-1 rounded-full" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <b className="font-semibold text-tn-ink">11</b> people
            </span>
          </div>
        </div>
        <div className="rounded-3xl bg-[linear-gradient(150deg,#CC3000_0%,#E5562A_60%,#FF7A45_100%)] p-10 text-center text-white shadow-[0_30px_70px_rgba(204,48,0,0.22)] sm:p-14">
          <div className="font-tn-amh text-[clamp(64px,9vw,96px)] leading-none font-bold">
            ትንሳኤ
          </div>
          <div className="mt-3.5 text-[13px] font-bold tracking-[0.22em] text-white/90">
            T I N S A E
          </div>
          <div className="mt-2 text-[15.5px] italic text-white/80">
            &ldquo;rising&rdquo;
          </div>
          <div className="mt-6 border-t border-white/20 pt-5 text-sm leading-relaxed font-medium text-white/85">
            The name is a promise about local commerce — that it can come up, be
            seen, and be trusted.
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-6 pt-20 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-7 lg:pt-24">
      <div>
        <Eyebrow>Why we built it</Eyebrow>
        <h2 className="text-tn-ink text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
          Bole runs on trust between people. We just made it visible.
        </h2>
      </div>
      <div className="text-tn-ink2 text-base leading-[1.7] font-medium sm:text-[16.5px]">
        <p>
          Buying a phone in Addis has always been a social process. You ask a
          cousin who knows a guy. You call three shops. You take a taxi across
          town on the strength of a maybe. The information exists — it just
          lives in people&apos;s heads, and it expires by lunchtime.
        </p>
        <p className="mt-[18px]">
          Tinsae does one narrow thing: it writes that knowledge down and keeps
          it current. We verify that a shop is a real business at a real address
          by visiting it. Then we ask the owner, every morning over Telegram,
          whether the stock is still there. One tap, and their listings stay
          live. No tap, and they quietly stop being shown.
        </p>
        <p className="mt-[18px]">
          That is the entire mechanism.{" "}
          <b className="text-tn-ink font-bold">We never touch the money.</b> You
          browse, you compare, you message the shop, you walk in and inspect the
          thing before you pay a birr. We are not a middleman — we are the part
          that was always missing, which is{" "}
          <b className="text-tn-ink font-bold">proof</b>.
        </p>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 pt-20 sm:px-8 lg:px-7 lg:pt-24">
      <SectionHead
        eyebrow="What we believe"
        title="Four things we will not trade away."
        intro="These started as arguments and ended as constraints. Every product decision gets checked against them."
      />
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        {PRINCIPLES.map((principle) => (
          <article
            key={principle.title}
            className="tn-card border-tn-hair rounded-[18px] border bg-white p-6 sm:p-7"
          >
            <span
              className="inline-flex size-[54px] items-center justify-center rounded-[15px]"
              style={{
                backgroundColor: `${principle.accent}14`,
                color: principle.accent,
              }}
            >
              <Icon name={principle.icon} size={25} />
            </span>
            <h3 className="text-tn-ink mt-[18px] text-xl font-extrabold tracking-[-0.02em]">
              {principle.title}
            </h3>
            <p className="text-tn-mute mt-2 text-sm leading-[1.6] font-medium sm:text-[14.5px]">
              {principle.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className="bg-tn-paper border-tn-hair2 mt-20 border-y px-6 py-[68px] sm:px-8 sm:py-[72px] lg:mt-24">
      <div className="mx-auto max-w-[1240px] lg:px-7">
        <SectionHead
          eyebrow="How we got here"
          title="From one wasted Saturday to 412 shops."
        />
        <div>
          {TIMELINE.map((entry, index) => (
            <div
              key={entry.title}
              className="grid grid-cols-[24px_1fr] items-stretch sm:grid-cols-[132px_28px_1fr]"
            >
              <div className="font-tn-mono text-tn-mute hidden pt-5 pr-5 text-right text-[12.5px] font-bold tracking-[0.04em] sm:block">
                {entry.when}
              </div>
              <div className="flex flex-col items-center pt-5">
                <span
                  className="size-[13px] shrink-0 rounded-full"
                  style={{
                    backgroundColor: entry.dot,
                    boxShadow: `0 0 0 4px ${entry.dot}22`,
                  }}
                />
                {index < TIMELINE.length - 1 && (
                  <span className="bg-tn-hair mt-1.5 min-h-11 w-[1.5px] flex-1" />
                )}
              </div>
              <div
                className={`pl-4 sm:pl-[22px] ${index < TIMELINE.length - 1 ? "pb-6" : "pb-0"} pt-[15px]`}
              >
                <div className="font-tn-mono text-tn-mute mb-1 text-[11.5px] font-bold tracking-[0.04em] sm:hidden">
                  {entry.when}
                </div>
                <h3 className="text-tn-ink text-[17px] font-extrabold tracking-[-0.02em] sm:text-[19px]">
                  {entry.title}
                </h3>
                <p className="text-tn-mute mt-1.5 max-w-[620px] text-sm leading-[1.6] font-medium sm:text-[14.5px]">
                  {entry.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 pt-20 sm:px-8 lg:px-7 lg:pt-24">
      <SectionHead
        eyebrow="Who we are"
        title="Eleven people, all in Addis."
        intro="Half the team spends its week inside shops rather than in front of a screen — that is deliberate, and it is why verification means something."
        link={{ label: "See open roles", href: "/careers" }}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((member) => (
          <article
            key={member.name}
            className="tn-card border-tn-hair rounded-[18px] border bg-white p-[22px]"
          >
            <span
              className="inline-flex size-[60px] items-center justify-center rounded-2xl text-xl font-extrabold text-white"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </span>
            <h3 className="text-tn-ink mt-4 text-base font-extrabold tracking-[-0.02em]">
              {member.name}
            </h3>
            <p className="text-tn-mute mt-0.5 text-[12.5px] font-semibold">
              {member.role}
            </p>
            <p className="font-tn-mono text-tn-mute border-tn-hair2 mt-3.5 border-t pt-3 text-[11.5px]">
              {member.note}
            </p>
          </article>
        ))}
      </div>
      <p className="font-tn-mono text-tn-mute mt-5 text-[12.5px]">
        Plus 7 verification agents and support staff across Bole.
      </p>
    </section>
  );
}

function StatBand() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 sm:px-8 lg:mt-24 lg:px-7">
      <div className="bg-tn-ink relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-[52px]">
        <div
          aria-hidden="true"
          className="font-tn-amh pointer-events-none absolute -top-16 -right-10 select-none text-[260px] font-bold leading-none text-white/[0.04] sm:text-[300px]"
        >
          ትንሳኤ
        </div>
        <div className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
          {ABOUT_STATS.map(([value, label], index) => (
            <div
              key={label}
              className={`px-3 sm:px-6 ${index > 0 ? "sm:border-l sm:border-white/12" : ""}`}
            >
              <div className="font-tn-mono text-[36px] leading-none font-semibold tracking-[-0.03em] text-white sm:text-[46px]">
                {value}
              </div>
              <div className="mt-2.5 text-xs font-medium text-white/60 sm:text-sm">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IdentityListCard({
  title,
  items,
  positive,
}: {
  title: string;
  items: readonly string[];
  positive: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-6 sm:p-7 ${positive ? "border-[#CDE9DA] bg-tn-green-soft" : "border-tn-hair bg-white"}`}
    >
      <div className="mb-3.5 flex items-center gap-2">
        <span
          className={`inline-flex size-6 items-center justify-center rounded-[7px] ${positive ? "bg-tn-green text-white" : "bg-tn-hair text-tn-mute"}`}
        >
          <Icon name={positive ? "check" : "minus"} size={14} strokeWidth={3} />
        </span>
        <span
          className={`text-[13px] font-extrabold ${positive ? "text-[#157049]" : "text-tn-mute"}`}
        >
          {title}
        </span>
      </div>
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2.5 py-1.5">
          <Icon
            name={positive ? "check" : "minus"}
            size={15}
            className={`mt-0.5 shrink-0 ${positive ? "text-tn-green" : "text-[#C5C3BB]"}`}
            strokeWidth={2.6}
          />
          <span
            className={`text-sm leading-[1.5] font-medium sm:text-[14.5px] ${positive ? "text-tn-ink2" : "text-tn-mute"}`}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function IdentitySection() {
  return (
    <section className="mx-auto max-w-[920px] px-6 pt-20 sm:px-8 lg:pt-24">
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <IdentityListCard title="What we are" items={WHAT_WE_ARE} positive />
        <IdentityListCard
          title="What we're not"
          items={WHAT_WE_ARE_NOT}
          positive={false}
        />
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 sm:px-8 lg:mt-24 lg:px-7">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-6 py-12 text-center sm:px-12 sm:py-[58px]">
        <div
          aria-hidden="true"
          className="font-tn-amh pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[220px] font-bold whitespace-nowrap text-white/[0.09] sm:text-[320px]"
        >
          ትንሳኤ
        </div>
        <div className="relative">
          <h2 className="text-[34px] leading-[1.06] font-extrabold tracking-[-0.035em] text-white sm:text-[42px]">
            Come see how it works.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-base leading-relaxed text-white/85 sm:text-[17px]">
            Browse 412 verified shops, or put yours on the map.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Pill kind="light" size="lg" iconAfter="arrow" href="/products">
              Browse listings
            </Pill>
            <Pill
              kind="ghost"
              size="lg"
              href="/signup"
              className="border-white/40 text-white hover:bg-white/10"
            >
              List your shop
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutPageContent() {
  return (
    <main className="text-tn-ink">
      <AboutHero />
      <MissionSection />
      <PrinciplesSection />
      <TimelineSection />
      <TeamSection />
      <StatBand />
      <IdentitySection />
      <FinalCta />
      <div className="h-20 lg:h-[92px]" />
    </main>
  );
}
