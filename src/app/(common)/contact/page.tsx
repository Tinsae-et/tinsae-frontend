import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { Icon, type IconName } from "@/components/tinsae/icon";

export const metadata: Metadata = {
  title: "Contact Tinsae | Talk to a human in Addis",
  description:
    "Contact Tinsae support in Addis Ababa by Telegram, email, or phone. We are here to help buyers, shops, and partners.",
  robots: { index: true, follow: true },
};

const channels = [
  {
    label: "Telegram",
    value: "@TinsaeSupport",
    note: "Fastest - usually under 2 hours, 8am-8pm",
    href: "https://t.me/TinsaeSupport",
    icon: "tg" as IconName,
    color: "text-tn-telegram",
    bg: "bg-tn-telegram-soft",
    primary: true,
  },
  {
    label: "Email",
    value: "help@tinsae.et",
    note: "Same working day for anything not urgent",
    href: "mailto:help@tinsae.et",
    icon: "msg" as IconName,
    color: "text-tn-green",
    bg: "bg-tn-green-soft",
  },
  {
    label: "Phone",
    value: "+251 91 000 1234",
    note: "Mon-Sat, 8:30am - 6:30pm",
    href: "tel:+251910001234",
    icon: "phone" as IconName,
    color: "text-tn-red",
    bg: "bg-tn-red-soft",
  },
];

const routes = [
  {
    icon: "heart" as IconName,
    accent: "text-tn-red",
    title: "I am a buyer",
    body: "A shop is unresponsive, a price looks wrong, or something about a listing is off.",
    handle: "@TinsaeSupport",
    href: "https://t.me/TinsaeSupport",
    cta: "Buyer support",
  },
  {
    icon: "building" as IconName,
    accent: "text-tn-green",
    title: "I run a shop",
    body: "Verification, the Telegram bot, listings, billing, or getting onto Tinsae in the first place.",
    handle: "@TinsaeShops",
    href: "https://t.me/TinsaeShops",
    cta: "Shop support",
  },
  {
    icon: "shield" as IconName,
    accent: "text-tn-warn",
    title: "I want to report something",
    body: "A shop asking for a deposit, a suspected fake listing, or anything that feels like a scam.",
    handle: "@TinsaeTrust",
    href: "https://t.me/TinsaeTrust",
    cta: "Report a problem",
    urgent: true,
  },
  {
    icon: "msg" as IconName,
    accent: "text-[#7A2EBF]",
    title: "Press or partnerships",
    body: "Media enquiries, interviews, brand assets, or working together.",
    handle: "press@tinsae.et",
    href: "mailto:press@tinsae.et",
    cta: "Press office",
  },
];

const hours = [
  ["Monday - Friday", "8:00 am - 8:00 pm"],
  ["Saturday", "9:00 am - 6:00 pm"],
  ["Sunday", "Telegram only"],
];

function ChannelStack() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-tn-hair bg-white shadow-[0_24px_60px_rgba(11,11,11,0.09)]">
      {channels.map((channel, index) => (
        <a
          key={channel.label}
          href={channel.href}
          className={`flex items-center gap-3.5 px-5 py-[18px] transition hover:bg-tn-paper ${channel.primary ? "bg-tn-red-soft" : ""} ${index ? "border-t border-tn-hair2" : ""}`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${channel.primary ? "bg-white" : channel.bg}`}
          >
            <Icon name={channel.icon} size={21} className={channel.color} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-extrabold tracking-[-0.01em] text-tn-ink">
              {channel.label}
            </span>
            <span className="font-tn-mono mt-0.5 block text-[13px] text-tn-ink2">
              {channel.value}
            </span>
            <span className="mt-1 block text-[11.5px] font-medium text-tn-mute">
              {channel.note}
            </span>
          </span>
          <Icon
            name="arrow"
            size={16}
            className={`shrink-0 ${channel.primary ? "text-tn-red" : "text-tn-mute"}`}
          />
        </a>
      ))}
    </div>
  );
}

function OfficeCard() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-tn-hair bg-white">
      <div className="relative h-[190px] overflow-hidden bg-[#e9ede6]">
        <svg
          viewBox="0 0 400 190"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <rect width="400" height="190" fill="#E9EDE6" />
          <rect x="18" y="14" width="108" height="56" rx="9" fill="#E2E0D8" />
          <rect x="268" y="20" width="114" height="50" rx="9" fill="#E2E0D8" />
          <rect x="24" y="126" width="104" height="52" rx="9" fill="#DDE7D6" />
          <rect x="262" y="120" width="120" height="58" rx="9" fill="#E2E0D8" />
          <path
            d="M0 98 L400 92"
            stroke="#fff"
            strokeWidth="26"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M152 0 L160 190"
            stroke="#fff"
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M0 98 L400 92"
            stroke="#F7CDB9"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="absolute left-[42%] top-[56%] flex h-[38px] w-[38px] -translate-x-1/2 -translate-y-full rotate-45 items-center justify-center rounded-[50%_50%_50%_5px] border-2.5 border-white bg-tn-red shadow-[0_4px_14px_rgba(204,48,0,0.45)]">
          <span className="font-tn-mono -rotate-45 text-[11px] font-extrabold text-white">
            T
          </span>
        </span>
        <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 font-tn-mono text-[11.5px] font-bold text-tn-ink2 shadow-sm">
          <Icon name="pin" size={13} className="text-tn-red" /> BOLE - ATLAS
        </span>
      </div>
      <div className="p-5">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-tn-mute">
          Our office
        </div>
        <div className="mt-2 text-[15px] font-extrabold tracking-[-0.01em] text-tn-ink">
          Tinsae · Atlas Building
        </div>
        <div className="mt-1 text-[13.5px] font-medium leading-relaxed text-tn-ink2">
          4th floor, Atlas Building
          <br />
          Bole Road, Addis Ababa, Ethiopia
        </div>
        <div className="mt-4 flex gap-2">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Atlas+Building+Bole+Road+Addis+Ababa"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-tn-hair text-[13.5px] font-bold text-tn-ink transition hover:border-tn-ink"
          >
            <Icon name="pin" size={15} />
            Directions
          </a>
          <a
            href="tel:+251910001234"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-tn-hair text-[13.5px] font-bold text-tn-ink transition hover:border-tn-ink"
          >
            <Icon name="phone" size={15} />
            Call
          </a>
        </div>
        <div className="mt-[18px] border-t border-tn-hair2 pt-[15px]">
          <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-tn-mute">
            Support hours
          </div>
          {hours.map(([day, value], index) => (
            <div
              key={day}
              className={`flex items-center justify-between py-1.5 ${index ? "border-t border-tn-hair2" : ""}`}
            >
              <span
                className={`text-[12.5px] font-semibold ${index === 2 ? "text-tn-mute" : "text-tn-ink2"}`}
              >
                {day}
              </span>
              <span
                className={`font-tn-mono text-[12px] font-semibold ${index === 2 ? "text-tn-mute" : "text-tn-ink"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="bg-white text-tn-ink">
      <section className="border-b border-tn-hair2 bg-[linear-gradient(115deg,#fff_48%,#fff9f6)]">
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-7 py-[72px] pb-12 sm:py-[72px] sm:pb-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-tn-hair bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-tn-ink2 shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
              <span className="h-[7px] w-[7px] rounded-full bg-tn-green shadow-[0_0_0_4px_rgba(31,138,91,0.13)]" />
              We answer on Telegram
            </div>
            <h1 className="mt-6 max-w-xl text-[44px] font-extrabold leading-[0.99] tracking-[-0.04em] sm:text-[58px]">
              Talk to a human
              <br />
              <span className="text-tn-red">in Addis.</span>
            </h1>
            <p className="mt-[22px] max-w-[520px] text-[16px] font-medium leading-[1.55] text-tn-mute sm:text-[18.5px]">
              No ticket numbers, no chatbot, no overseas call centre. Eleven of
              us work here and one of us will read what you send.
            </p>
            <div className="font-tn-mono mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] text-tn-mute">
              <span>
                <strong>~2h</strong> median first reply
              </span>
              <span>
                <strong>8am-8pm</strong> Mon-Fri
              </span>
              <span>
                <strong>Amharic</strong> &amp; English
              </span>
            </div>
          </div>
          <ChannelStack />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-7 py-[92px]">
        <p className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.11em] text-tn-red">
          Pick the right door
        </p>
        <h2 className="text-[32px] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-[42px]">
          Four teams, four handles.
        </h2>
        <p className="mt-4 max-w-[660px] text-[17px] font-medium leading-[1.55] text-tn-mute">
          Messaging the right one gets you a faster, better answer than the
          general line.
        </p>
        <div className="mt-[26px] grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {routes.map((route) => (
            <div
              key={route.title}
              className={`flex flex-col rounded-[18px] border bg-white px-[22px] py-6 ${route.urgent ? "border-[#FBD9C7]" : "border-tn-hair"}`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-[13px] bg-current/10 ${route.accent}`}
              >
                <Icon name={route.icon} size={22} />
              </span>
              <h3 className="mt-4 text-[17px] font-extrabold tracking-[-0.02em]">
                {route.title}
              </h3>
              <p className="mt-2 flex-1 text-[13.5px] font-medium leading-relaxed text-tn-mute">
                {route.body}
              </p>
              <div className="font-tn-mono mt-3 border-t border-tn-hair2 pt-3 text-xs text-tn-ink2">
                {route.handle}
              </div>
              <a
                href={route.href}
                className={`mt-3 flex h-10 items-center justify-center rounded-full px-4 text-[13.5px] font-bold transition ${route.urgent ? "bg-tn-red text-white shadow-[0_8px_22px_rgba(204,48,0,0.2)] hover:bg-tn-red-dark" : "border-[1.5px] border-tn-hair text-tn-ink hover:border-tn-ink"}`}
              >
                <Icon name="tg" size={15} className="mr-2" />
                {route.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1240px] gap-7 px-7 pb-0 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <ContactForm />
        <div className="flex flex-col gap-4">
          <OfficeCard />
          <div className="rounded-[18px] border border-tn-hair bg-tn-paper p-5">
            <div className="mb-3 flex items-center gap-2 text-[13.5px] font-extrabold">
              <Icon name="bolt" size={17} className="text-tn-green" />
              Might be faster to check first
            </div>
            {[
              [
                "Help center",
                "Answers to the 40 most common questions",
                "/help",
              ],
              [
                "Trust & safety",
                "What verified means and how to report",
                "/trust-and-safety",
              ],
              [
                "Returns & warranty",
                "What happens if something goes wrong",
                "/help",
              ],
            ].map(([title, text, href]) => (
              <Link
                key={title}
                href={href}
                className="mt-2 flex items-center gap-3 rounded-xl border border-tn-hair bg-white px-3.5 py-3 transition hover:border-tn-ink"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-extrabold">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] font-medium text-tn-mute">
                    {text}
                  </span>
                </span>
                <Icon name="chevron" size={15} className="text-[#C5C3BB]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-[92px] border-y border-tn-hair2 bg-tn-paper py-[72px]">
        <div className="mx-auto w-full max-w-[1240px] px-7">
          <div className="mx-auto flex max-w-[920px] flex-wrap items-center gap-5 rounded-[20px] bg-tn-ink px-6 py-8 sm:px-8">
            <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[15px] bg-white/10">
              <Icon name="shield" size={26} className="text-[#FF9E80]" />
            </span>
            <div className="min-w-[260px] flex-1">
              <h2 className="text-xl font-extrabold tracking-[-0.02em] text-white">
                Nobody from Tinsae will ever ask you to pay us
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                We handle no payments and hold no accounts. If a message claims
                to be Tinsae and asks for money, a deposit or a transfer, it is
                a scam -{" "}
                <strong className="text-white">
                  report it to @TinsaeTrust
                </strong>
                .
              </p>
            </div>
            <a
              href="https://t.me/TinsaeTrust"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-[18px] text-[13.5px] font-bold text-tn-red transition hover:bg-tn-red-soft"
            >
              <Icon name="shield" size={15} />
              Report a scam
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-7 pb-3 pt-[92px]">
        <div className="overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#cc3000_0%,#e5562a_55%,#ff7a45_100%)] px-6 py-[58px] text-center text-white sm:px-12">
          <h2 className="text-[32px] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-[42px]">
            Telegram is the fastest way.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] font-medium leading-[1.55] text-white/90">
            @TinsaeSupport - median first reply under two hours during Addis
            business hours.
          </p>
          <div className="mt-[30px] flex flex-wrap justify-center gap-[11px]">
            <a
              href="https://t.me/TinsaeSupport"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-bold text-tn-red hover:bg-tn-red-soft"
            >
              <Icon name="tg" size={17} />
              Message @TinsaeSupport
            </a>
            <Link
              href="/help"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/50 px-6 text-[15px] font-bold text-white hover:bg-white/10"
            >
              Browse the help center
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
