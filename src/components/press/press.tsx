"use client";

import { Pill } from "../tinsae/pill";
import { Icon } from "../tinsae/icon";
import { TinsaeLogo } from "../tinsae/logo";

const BOILERPLATE = `Tinsae (ትንሳኤ, Amharic for "rising") is a verified electronics marketplace in Addis Ababa. Buyers compare prices across local shops that have been verified in person and that reconfirm their stock every day over Telegram, then contact the shop and complete the purchase face to face. Tinsae never handles payments and takes no commission on any sale. Founded in 2022, it operates in Bole with 412 verified shops.`;


export default function Presshead() {


  const wordCount = BOILERPLATE.trim().split(/\s+/).length;

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-96 w-[36re] rounded-full bg-orange-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto px-6 pt-16 pb-10 sm:px-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600">
            <Icon name="msg" className="h-3.5 w-3.5" />
            Press &amp; media
          </span>

          <h1 className="mt-5 text-4xl font-bold  tracking-tight sm:text-5xl">
            Everything you need
            <br />
            <span className="text-orange-700">to write about us.</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed font-semibold text-gray-600">
            Brand assets, the facts, an approved boilerplate and a human who
            answers. If something is missing, ask — we would rather you got
            it right.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Pill icon="box">Download brand kit</Pill>
            <Pill icon="msg" className="bg-gray-200 text-black"> Contact Press office</Pill>
            
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            <a
              href="mailto:press@tinsae.et"
              className="inline-flex items-center gap-1.5 font-mono hover:text-neutral-800"
            >
              <Icon name ="msg" className="h-3.5 w-3.5" />
              press@tinsae.et
            </a>
            <span className="text-neutral-300">·</span>
            <a
              href=""
              className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700"
            >
              <Icon name="tg" className="h-3.5 w-3.5" />
              <span className="font-medium font-mono">@TinsaePress</span>
              <span className="text-neutral-500 font-mono">on Telegram</span>
            </a>
          </div>
        </div>
        <div className="border-t border-neutral-200" />
      </section>

      {/* Boilerplate */}
      <section className="mx-auto  px-6 py-14 sm:px-10">
        <p className="text-xs font-semibold tracking-wide text-orange-700">
          APPROVED COPY
        </p>
        <h2 className="mt-2 text-3xl  tracking-tight font-bold">
          Boilerplate
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">
          Use this verbatim in any article, listing or relese. It is the description we stand behind.
        </p>

        <div className="mt-6 rounded-2xl border bg-neutral-300 p-6">
          <p className="text-[15px] leading-relaxed text-neutral-800">
            {BOILERPLATE}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <Pill className="bg-white text-black" icon="building"> Copy boilerplate</Pill>
            <span className="text-xs text-neutral-400 font-mono">
              {wordCount} words · updated Mar 2026
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-300 p-4">
            <p className="text-xs font-semibold  text-neutral-500">
              PRONUNCIATION
            </p>
            <p className="mt-1 text-[15px] font-semibold">
              ትንሳኤ — <span className="font-mono font-semibold">tin-SA-eh</span>
            </p>
          </div>
          <div className="rounded-xl border border-neutral-300 p-4">
            <p className="text-xs font-semibold text-neutral-500">
              WRITTEN STYLE
            </p>
            <p className="mt-1 text-[15px] font-semibold">
              <span className=" font-semibold">Tinsae</span> — not TINSAE, not
              Tinsaé
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
type FactRow = {
  label: string;
  value: string;
};

const FACTS: FactRow[] = [
  { label: "Founded", value: "2022 · Addis Ababa, Ethiopia" },
  { label: "Category", value: "Verified local marketplace · consumer electronics" },
  { label: "Launch market", value: "Bole, Addis Ababa" },
  { label: "Verified shops", value: "412" },
  { label: "Live listings", value: "8,920" },
  { label: "Stock reconfirmed daily", value: "96% within 24 hours" },
  { label: "Commission taken", value: "None — Tinsae handles no payments" },
  { label: "Team", value: "11 people, all Addis-based" },
];

export  function FactSheet() {
  return (
    <section className="mx-auto  px-6 py-14 sm:px-10">
      <p className="text-xs font-semibold tracking-wide text-orange-600">
        Fact sheet
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        The numbers, checked.
      </h2>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">
        Current as of March 2026. If you need a figure that is not here, ask
        and we will confirm it rather than let you estimate.
      </p>

      <dl className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
        {FACTS.map((fact, i) => (
          <div
            key={fact.label}
            className={`grid grid-cols-2 gap-4 px-6 py-4 border ${
              i !== FACTS.length - 1 ? "border-b border-neutral-100" : ""
            }`}
          >
            <dt className="text-sm text-neutral-500 ">{fact.label}</dt>
            <dd className="font-mono text-sm text-neutral-900 font-semibold ">
              {fact.value}
            </dd>
           
          </div>
          
        ))}
      </dl>
    </section>
  );
}

type LogoCard = {
  title: string;
  subtitle: string;
  filename: string;
  bg: string;
  fg: string;
  border?: string;
  text:string;
};

type Swatch = {
  name: string;
  hex: string;
  bg: string;
};

const LOGO_CARDS: LogoCard[] = [
  {
    title: "Primary lockup",
    subtitle: "White on brand red",
    filename: "tinsae-logo-orange.svg",
    bg: "bg-orange-600",
    fg: "text-white",
    text:""
  },
  {
    title: "Light background",
    subtitle: "For white and paper grounds",
    filename: "tinsae-logo-light.svg",
    bg: "bg-neutral-50",
    fg: "text-orange-600",
    border: "border border-neutral-200",
    text:""
  },
  {
    title: "Dark background",
    subtitle: "For black and photo grounds",
    filename: "tinsae-logo-dark.svg",
    bg: "bg-neutral-950",
    fg: "text-white",
    text:"text-white"
  },
  {
    title: "Mark only",
    subtitle: "Avatars, favicons, tight spaces",
    filename: "tinsae-mark.svg",
    bg: "bg-neutral-50",
    fg: "text-orange-600",
    border: "border border-neutral-200",
    text:""
  },
];

const SWATCHES: Swatch[] = [
  { name: "Brand red", hex: "#CC3000", bg: "bg-[#CC3000]" },
  { name: "Ink", hex: "#0B0B0B", bg: "bg-[#0B0B0B]" },
  { name: "Verified green", hex: "#1F8A5B", bg: "bg-[#1F8A5B]" },
  { name: "Aging amber", hex: "#B8741F", bg: "bg-[#B8741F]" },
  { name: "Paper", hex: "#F7F6F2", bg: "bg-[#F7F6F2] border border-neutral-200" },
  { name: "Telegram", hex: "#229ED9", bg: "bg-[#229ED9]" },
];



export function BrandAssets() {
  return (
    <section className=" bg-neutral-200  py-14 ">
        <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
            <p className="text-xs font-semibold tracking-wide text-orange-600">
                Brand assets
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Logo, mark and palette.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">
                SVG only — please do not screenshot the logo or recolour it.
                Clear space is equal to the height of the mark on all sides.
            </p>
            </div>
            <a
            href="#usage-rules"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-neutral-900 hover:text-orange-600"
            >
            Full usage rules
            <span aria-hidden="true">→</span>
            </a>
        </div>

        {/* Logo lockups */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {LOGO_CARDS.map((card) => (
            <div
                key={card.filename}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
                <div className={`flex h-32 items-center justify-center ${card.bg}`}>
                <span className={`inline-flex items-center gap-2 text-lg font-semibold ${card.fg}`}>
                    <TinsaeLogo className={`h-35 w-25 ${card.text}`} />
                </span>
                </div>
                <div className="p-4">
                <p className="text-sm font-semibold text-neutral-900">
                    {card.title}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                    {card.subtitle}
                </p>
                <p className="mt-3 border-t border-neutral-100 pt-3 font-mono text-xs text-neutral-400">
                    {card.filename}
                </p>
                </div>
            </div>
            ))}
        </div>

        {/* Color swatches */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {SWATCHES.map((swatch) => (
            <div
                key={swatch.name}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
                <div className={`h-16 ${swatch.bg}`} />
                <div className="p-3">
                <p className="text-sm font-semibold text-neutral-900">
                    {swatch.name}
                </p>
                <p className="font-mono text-xs text-neutral-400">
                    {swatch.hex}
                </p>
                </div>
            </div>
            ))}
        </div>

        {/* Typefaces + don'ts */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-xs font-semibold tracking-wide text-neutral-400">
                Typefaces
            </p>
            <ul className="mt-3 space-y-1.5 text-[15px] text-neutral-700">
                <li>
                <span className="font-semibold text-neutral-900">
                    Plus Jakarta Sans
                </span>{" "}
                — all interface and prose
                </li>
                <li>
                <span className="font-mono font-semibold text-neutral-900">
                    JetBrains Mono
                </span>{" "}
                — every number
                </li>
                <li>
                <span className="font-semibold text-neutral-900">
                    Noto Sans Ethiopic
                </span>{" "}
                — the ትንሳኤ wordmark
                </li>
            </ul>
            </div>

            <div className="rounded-2xl border border-orange-400 bg-red-100 p-6">
            <p className="text-xs font-semibold tracking-wide text-orange-600">
                PLEASE DON&apos;T
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-orange-800">
                Recolour the mark · stretch or rotate the lockup · place the red
                lockup on a busy photo · rebuild the wordmark in another typeface
            </p>
            </div>
        </div>
      </div>
    </section>
  );
}

type PressItem = {
  outlet: string;
  date: string;
  headline: string;
  tag: string;
};

type Stat = {
  value: string;
  label: string;
};

const PRESS_ITEMS: PressItem[] = [
  {
    outlet: "Addis Business Weekly",
    date: "2026 · Mar",
    headline: "The app asking Bole shopkeepers one question every morning",
    tag: "Feature",
  },
  {
    outlet: "Shega",
    date: "2026 · Feb",
    headline: "Why Tinsae refuses to process a single birr",
    tag: "Interview",
  },
  {
    outlet: "Ethiopian Tech Review",
    date: "2025 · Nov",
    headline: "412 shops later: verification as a product",
    tag: "Profile",
  },
  {
    outlet: "Capital Ethiopia",
    date: "2025 · Aug",
    headline: "Electronics buyers are done crossing town on a maybe",
    tag: "News",
  },
];

const STATS: Stat[] = [
  { value: "412", label: "verified shops" },
  { value: "8,920", label: "listings live today" },
  { value: "~3.4h", label: "median shop reply" },
  { value: "2022", label: "founded in Addis" },
];

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}



export function PressCoverage() {
  return (
    <section className="mx-auto px-6 py-14 sm:px-10">
      {/* Header */}
      <p className="text-xs font-semibold tracking-wide text-orange-700">
       IN THE PRESS
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Recent coverage
      </h2>

      {/* Press list */}
      <div className="mt-6 overflow-hidden flex flex-col gap-3 ">
        {PRESS_ITEMS.map((item, i) => (
          <a
            key={item.headline}
            href="#"
            className={`flex flex-col gap-3 px-6 py-4 transition-colors rounded-2xl border border-neutral-200  sm:flex-row sm:items-center sm:justify-between ${
              i !== PRESS_ITEMS.length - 1 ? "border-b border-neutral-100" : ""
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="w-40 shrink-0">
                <p className="text-sm font-semibold text-neutral-900">
                  {item.outlet}
                </p>
                <p className="text-xs text-neutral-400">{item.date}</p>
              </div>
              <p className="text-[15px] text-neutral-800">{item.headline}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium  text-neutral-600">
                {item.tag}
              </span>
              <ArrowIcon className="h-4 w-4 text-orange-600" />
            </div>
          </a>
        ))}
      </div>

      {/* Stats bar */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-neutral-950 px-8 py-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-9xl font-bold text-white/5"
        >
          ትንሳኤ
        </span>
        <div className="relative grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-mono text-3xl font-semibold text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-linear-to-br from-orange-700 to-orange-500 px-8 py-14 text-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-9xl font-bold text-white/10"
        >
          ትንሳኤ
        </span>
        <div className="relative mx-auto ">
          <h3 className="text-6xl font-bold text-white sm:text-4xl">
            Working on a story?
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-white/90">
            Our press office answers on Telegram and email, usually
            same-day during Addis business hours.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Pill icon ="tg" className="bg-white text-orange-600">Reach the oress iffuce</Pill>
            <Pill className="bg-transparent border">Read our story</Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
