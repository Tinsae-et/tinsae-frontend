import type { ReactNode } from "react";
import type { IconName } from "@/components/tinsae/icon";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { StatBand } from "@/components/home/stat-band";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "How it works — Tinsae",
  description:
    "Every Tinsae listing is verified in person and re-confirmed in stock each morning. See how buyers find the right shop and how shop owners get ready-to-buy leads.",
};

const SECTION = "mx-auto max-w-[1240px] px-6 lg:px-7";

// ── Shared section header ─────────────────────────────────────────────
function Eyebrow({ color = "text-tn-red", children }: { color?: string; children: ReactNode }) {
  return (
    <p
      className={cn(
        "mb-3.5 text-[13px] font-bold tracking-[0.11em] uppercase",
        color,
      )}
    >
      {children}
    </p>
  );
}

function SectionHead({
  eyebrow,
  color,
  title,
  intro,
  center,
}: {
  eyebrow: string;
  color?: string;
  title: string;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-[720px]", center && "mx-auto text-center")}>
      <Eyebrow color={color}>{eyebrow}</Eyebrow>
      <h2 className="text-tn-ink text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[44px] sm:leading-[1.04]">
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "text-tn-mute mt-4 max-w-[560px] text-[17px] leading-[1.55] font-medium sm:text-[17.5px]",
            center && "mx-auto",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

// ── Before / after comparison ─────────────────────────────────────────
const OLD_WAY: { title: string; sub: string; bad: boolean }[] = [
  { title: "Call around", sub: "Prices are hearsay", bad: false },
  { title: "Taxi to Bole", sub: "Maybe in stock", bad: false },
  { title: "Shop 1", sub: "Sold out", bad: true },
  { title: "Shop 2", sub: "Wrong variant", bad: true },
  { title: "Shop 3", sub: "In stock — overpriced", bad: true },
];

const TINSAE_WAY: { icon: IconName; title: string; sub: string; confirmed: boolean }[] = [
  { icon: "search", title: "Search the product", sub: "Every shop, live prices", confirmed: false },
  { icon: "shield", title: "See it confirmed", sub: "In stock 1h ago", confirmed: true },
  { icon: "tg", title: "Message on Telegram", sub: "Agreed: 142,500", confirmed: false },
  { icon: "pin", title: "Visit & pay", sub: "Inspect, then buy", confirmed: false },
];

function BeforeAfter() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {/* The old way */}
      <div className="rounded-2xl border border-tn-hair bg-white p-5 shadow-[0_14px_40px_rgba(11,11,11,0.05)]">
        <div className="text-tn-mute mb-4 inline-flex items-center gap-[7px] text-[11.5px] font-bold tracking-[0.05em] uppercase">
          <span className="size-2 rounded-full bg-[#B4B2AB]" />
          The old way
        </div>
        <div className="flex flex-col gap-2.5">
          {OLD_WAY.map((row) => (
            <div
              key={row.title}
              className="bg-tn-paper flex items-center gap-2.5 rounded-[10px] px-2.5 py-2"
            >
              <span
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-[7px]",
                  row.bad ? "bg-[#F3E3DE] text-tn-red-dark" : "bg-tn-hair text-tn-mute",
                )}
              >
                {row.bad ? (
                  <Icon name="back" size={11} strokeWidth={2.4} />
                ) : (
                  <Icon name="car" size={12} />
                )}
              </span>
              <div className="min-w-0">
                <div className="text-tn-ink2 text-[12.5px] font-bold">{row.title}</div>
                <div className="text-tn-mute text-[11px]">{row.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-tn-hair2 text-tn-mute font-tn-mono mt-3.5 flex items-center gap-[7px] border-t pt-3 text-xs">
          <Icon name="clock" size={13} className="text-tn-warn" />
          Half a day · 5 shops · 1 sale
        </div>
      </div>

      {/* With Tinsae */}
      <div className="bg-tn-ink relative overflow-hidden rounded-2xl p-5 shadow-[0_24px_60px_rgba(11,11,11,0.22)]">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -right-[30px] -bottom-[50px] text-[150px] leading-none font-bold text-white/[0.05]"
        >
          ት
        </span>
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-[7px] text-[11.5px] font-bold tracking-[0.05em] text-white uppercase">
            <span className="size-2 rounded-full bg-tn-green" />
            With Tinsae
          </div>
          <div className="flex flex-col gap-2.5">
            {TINSAE_WAY.map((row) => (
              <div
                key={row.title}
                className="flex items-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.06] px-3 py-2.5"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-[7px]",
                    row.confirmed ? "bg-tn-green" : "bg-white/10",
                  )}
                >
                  <Icon name={row.icon} size={13} className="text-white" />
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-white">{row.title}</div>
                  <div className="font-tn-mono text-tn-mute text-[11px] text-white/55">
                    {row.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="font-tn-mono mt-3.5 flex items-center gap-[7px] border-t border-white/10 pt-3 text-xs text-white/70">
            <Icon name="bolt" size={13} className="text-tn-green" />
            One trip · right shop · right price
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_88%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_52%)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-6 pt-12 pb-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-7 lg:pt-[76px]">
        <div className="animate-[tnRise_0.6s_ease_both] min-w-0">
          <span className="shadow-[0_2px_10px_rgba(11,11,11,0.04)] text-tn-ink2 inline-flex items-center gap-2 rounded-full border border-tn-hair bg-white px-3.5 py-[7px] text-[13px] font-bold">
            <span className="bg-tn-green size-[7px] rounded-full shadow-[0_0_0_4px_#E8F5EE]" />
            How Tinsae works
          </span>
          <h1 className="text-tn-ink mt-5 text-[40px] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[52px] lg:text-[62px] lg:leading-none">
            Stock you can trust,
            <br />
            before you <span className="text-tn-red">cross town.</span>
          </h1>
          <p className="text-tn-mute mt-6 max-w-[500px] text-[17px] leading-[1.55] font-medium sm:text-[18.5px]">
            Tinsae is a verified electronics marketplace for Addis. Every shop is checked in person,
            and every listing is re-confirmed in stock — so the price you see is the one that&rsquo;s
            actually on the shelf.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">
              Browse listings
            </Pill>
            <Pill kind="outline" size="lg" icon="tg" href="#">
              List your shop
            </Pill>
          </div>
          <div className="text-tn-ink2 font-tn-mono mt-7 flex flex-wrap items-center gap-x-[22px] gap-y-2 text-[13px] font-semibold">
            <span className="inline-flex items-center gap-[7px]">
              <Icon name="shield" size={15} className="text-tn-green" />
              412 verified shops
            </span>
            <span className="inline-flex items-center gap-[7px]">
              <Icon name="bolt" size={15} className="text-tn-red" />
              96% reconfirmed today
            </span>
          </div>
        </div>

        <div className="animate-[tnRise_0.6s_ease_both] [animation-delay:120ms]">
          <BeforeAfter />
        </div>
      </div>
    </section>
  );
}

// ── The model · three pillars ─────────────────────────────────────────
const PILLARS: { icon: IconName; color: string; tile: string; title: string; body: string }[] = [
  {
    icon: "shield",
    color: "text-tn-green",
    tile: "bg-tn-green/10",
    title: "Verified in person",
    body: "Before a shop appears on Tinsae, our team confirms a real business at a real address in Bole — phone, documents, and a physical store visit.",
  },
  {
    icon: "bolt",
    color: "text-tn-red",
    tile: "bg-tn-red/10",
    title: "Confirmed every morning",
    body: "Shops re-confirm what\u2019s in stock through our Telegram bot daily. A freshness dot shows exactly how recent each listing is — stale ones drop off.",
  },
  {
    icon: "pin",
    color: "text-[#2A6FDB]",
    tile: "bg-[#2A6FDB]/10",
    title: "Bought in person",
    body: "You message the shop, agree on terms, then walk in to inspect and pay. Tinsae never holds your money or stands between you and the seller.",
  },
];

function Pillars() {
  return (
    <section className={cn(SECTION, "mt-16 lg:mt-20")}>
      <SectionHead
        eyebrow="The model"
        title="Three things make a listing trustworthy."
        intro="Most marketplaces show you a photo and a price. Tinsae shows you proof that the shop is real and the item is actually there, right now."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-[18px]">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-tn-hair bg-white p-6 transition-shadow duration-200 hover:shadow-[0_16px_44px_rgba(11,11,11,0.08)] lg:p-7"
          >
            <div
              className={cn(
                "mb-5 flex size-[54px] items-center justify-center rounded-[15px]",
                p.tile,
              )}
            >
              <Icon name={p.icon} size={25} className={p.color} />
            </div>
            <h3 className="text-tn-ink text-[21px] font-extrabold tracking-[-0.02em]">{p.title}</h3>
            <p className="text-tn-mute mt-2.5 text-[14.5px] leading-[1.6]">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Journey · reusable 4-step component ───────────────────────────────
function Journey({
  eyebrow,
  color,
  title,
  steps,
}: {
  eyebrow: string;
  color: string;
  title: string;
  steps: [string, IconName, string, string][];
}) {
  return (
    <div className={cn(SECTION)}>
      <SectionHead eyebrow={eyebrow} color={color} title={title} />
      <div className="mt-10 grid gap-x-[18px] gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([n, icon, t, d], i) => (
          <div key={n}>
            <div className="mb-[18px] flex items-center gap-3">
              <span className="border-tn-hair bg-tn-paper flex size-11 shrink-0 items-center justify-center rounded-[13px] border">
                <Icon name={icon} size={21} className={color} />
              </span>
              <span className="bg-tn-hair relative h-px flex-1">
                {i < steps.length - 1 && (
                  <span className="bg-tn-hair absolute top-1/2 right-[-4px] size-[7px] -translate-y-1/2 rounded-full" />
                )}
              </span>
            </div>
            <p className={cn("font-tn-mono text-[13px] font-semibold", color)}>{n}</p>
            <h3 className="text-tn-ink mt-2 text-[18.5px] font-extrabold tracking-[-0.02em]">
              {t}
            </h3>
            <p className="text-tn-mute mt-2 text-sm leading-[1.55]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const BUYER_STEPS: [string, IconName, string, string][] = [
  ["01", "search", "Search the product", "Type what you want. Every verified shop carrying it appears, sorted by price and freshness."],
  ["02", "shield", "Check it\u2019s confirmed", "The freshness dot tells you when the shop last confirmed stock — hours, not weeks."],
  ["03", "tg", "Contact on Telegram", "Message the shop directly. Ask questions, agree a price and a time to come by."],
  ["04", "pin", "Visit & pay in person", "Walk in, inspect the item, complete the purchase. Tinsae stays out of the money."],
];

const OWNER_STEPS: [string, IconName, string, string][] = [
  ["01", "building", "Register your shop", "Claim an existing listing or create your storefront with hours, location and photos."],
  ["02", "shield", "Get verified", "We confirm your phone, documents and pay a quick visit to your store. Then the badge is yours."],
  ["03", "tg", "Connect the bot", "Link Telegram and import your stock. One message each morning keeps every listing fresh."],
  ["04", "msg", "Receive leads", "Ready-to-buy customers reach you directly — no commission, no payment handling, ever."],
];

// ── The confirmation loop ─────────────────────────────────────────────
const FRESHNESS: { dot: string; halo: string; label: string; body: string }[] = [
  { dot: "bg-tn-green", halo: "shadow-[0_0_0_4px_#1f8a5b22]", label: "Green.", body: "Confirmed within 6 hours — buy with confidence" },
  { dot: "bg-tn-warn", halo: "shadow-[0_0_0_4px_#b8741f22]", label: "Amber.", body: "6–24 hours old — likely fine, worth a quick message" },
  { dot: "bg-tn-stale", halo: "shadow-[0_0_0_4px_#9a9a9522]", label: "Grey.", body: "Over a day — Tinsae quietly stops showing it" },
];

function ConfirmLoop() {
  return (
    <section className={cn(SECTION, "mt-16 lg:mt-20")}>
      <div className="border-tn-hair bg-tn-paper grid items-center gap-10 rounded-3xl border p-7 sm:p-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:p-11">
        <div>
          <Eyebrow>The differentiator</Eyebrow>
          <h2 className="text-tn-ink text-[30px] leading-[1.07] font-extrabold tracking-[-0.03em] sm:text-[38px]">
            A listing is only as good as its{" "}
            <span className="text-tn-red">last confirmation.</span>
          </h2>
          <p className="text-tn-mute mt-4 max-w-[480px] text-base leading-[1.6]">
            Each morning the bot asks shops one question: is this still in stock, at this price?
            Their reply timestamps the listing — and you see it as a freshness dot the moment you
            search.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {FRESHNESS.map((f) => (
              <div key={f.label} className="flex items-center gap-[13px]">
                <span
                  className={cn("size-[11px] shrink-0 rounded-full", f.dot, f.halo)}
                />
                <span className="text-tn-ink2 text-[13.5px]">
                  <b className="text-tn-ink font-extrabold">{f.label}</b> {f.body}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Telegram chat mock */}
        <div className="bg-tn-ink font-tn-mono rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3.5">
            <Icon name="tg" size={17} className="text-tn-telegram" />
            <span className="text-[13.5px] font-bold text-white">@TinsaeStockBot</span>
            <span className="bg-tn-green ml-auto rounded-full px-2.5 py-0.5 text-[9.5px] font-bold tracking-[0.05em] text-white">
              ONLINE
            </span>
          </div>
          <div className="flex flex-col gap-2.5 text-[12.5px]">
            <p className="max-w-[88%] self-start rounded-xl bg-[#262626] px-3.5 py-2.5 text-white/90">
              ☀️ Good morning! Still have <span className="text-[#FFB69E]">iPhone 15 Pro · 256GB</span>{" "}
              in stock at 142,500?
            </p>
            <p className="bg-tn-red max-w-[72%] self-end rounded-xl px-3.5 py-2.5 text-white">
              ✅ Yes — 3 units
            </p>
            <p className="text-tn-green max-w-[88%] self-start rounded-xl bg-[#262626] px-3.5 py-2.5">
              Confirmed 09:14 · pinned to the top of search ↑
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2.5 border-t border-white/10 pt-3.5">
            <span className="bg-tn-green size-[7px] rounded-full shadow-[0_0_0_4px_rgba(31,138,91,0.2)]" />
            <span className="text-[11.5px] text-white/60">
              Buyers now see a green dot · &quot;1h ago&quot;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Principles · what Tinsae is / isn't ───────────────────────────────
const IS_LIST = [
  "A directory of shops verified in person",
  "A live, daily-confirmed price comparison",
  "A direct line to the shop on Telegram",
  "Free to browse, with no markup on any price",
];

const ISNT_LIST = [
  "A place that holds or processes your payment",
  "A delivery or escrow service",
  "A reseller — we never own the inventory",
  "A reviews-only site with stale, unchecked listings",
];

function Principles() {
  return (
    <section className={cn(SECTION, "mt-16 lg:mt-20")}>
      <SectionHead
        eyebrow="Where we stand"
        title="What Tinsae is — and isn\u2019t."
        center
      />
      <div className="mx-auto mt-10 grid max-w-[920px] gap-[18px] lg:grid-cols-2">
        <div className="border-[#CDE9DA] rounded-2xl border bg-tn-green-soft p-7">
          <h3 className="mb-[18px] inline-flex items-center gap-2 text-[13px] font-extrabold text-[#157049]">
            <span className="bg-tn-green flex size-6 items-center justify-center rounded-lg">
              <Icon name="check" size={15} className="text-white" strokeWidth={2.6} />
            </span>
            What we are
          </h3>
          <div className="flex flex-col gap-3.5">
            {IS_LIST.map((t) => (
              <p key={t} className="text-tn-ink2 flex items-start gap-2.5 text-[14.5px] leading-[1.5]">
                <Icon name="check" size={17} className="text-tn-green mt-1 shrink-0" strokeWidth={2.2} />
                {t}
              </p>
            ))}
          </div>
        </div>

        <div className="border-tn-hair rounded-2xl border bg-white p-7">
          <h3 className="text-tn-ink2 mb-[18px] inline-flex items-center gap-2 text-[13px] font-extrabold">
            <span className="flex size-6 items-center justify-center rounded-lg bg-tn-hair">
              <Icon name="minus" size={15} className="text-tn-mute" strokeWidth={2.6} />
            </span>
            What we&rsquo;re not
          </h3>
          <div className="flex flex-col gap-3.5">
            {ISNT_LIST.map((t) => (
              <p key={t} className="text-tn-mute flex items-start gap-2.5 text-[14.5px] leading-[1.5]">
                <Icon name="minus" size={17} className="mt-1 shrink-0 text-[#C4C2BB]" strokeWidth={2.2} />
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── About / mission ───────────────────────────────────────────────────
function About() {
  return (
    <section className={cn(SECTION, "mt-16 lg:mt-20")}>
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#CC3000_0%,#E5562A_60%,#FF7A45_100%)] px-10 py-12 text-center sm:px-14 sm:py-14">
          <span className="font-tn-amh text-[80px] leading-none font-bold tracking-[-0.02em] text-white sm:text-[96px]">
            ትንሳኤ
          </span>
          <span className="mt-4 inline-block text-[13px] font-bold tracking-[0.22em] text-white/90">
            T I N S A E
          </span>
          <p className="mt-2.5 text-sm text-white/85 italic">&ldquo;rising&rdquo;</p>
        </div>

        <div>
          <Eyebrow>Why we built it</Eyebrow>
          <h2 className="text-tn-ink text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
            Bole runs on trust between people. We just made it visible.
          </h2>
          <p className="text-tn-ink2 mt-5 max-w-[560px] text-base leading-[1.65] sm:text-[16.5px]">
            Addis already has hundreds of honest electronics shops. What it lacked was a way to{" "}
            <i>prove</i> it before you spend an afternoon in traffic — a shared, public record of
            who&rsquo;s real and what&rsquo;s actually in stock.
          </p>
          <p className="text-tn-mute mt-4 max-w-[560px] text-base leading-[1.65] sm:text-[16.5px]">
            <b className="text-tn-ink">Tinsae</b> — Amharic for <i>&ldquo;rising&rdquo;</i> — is that
            record. We verify the shops, the bot keeps them honest about stock, and you keep buying
            in person, the way Addis has always done business. We never touch the money. We just
            make the trust legible.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Pill kind="dark" size="md" iconAfter="arrow" href="/products">
              Meet the verified shops
            </Pill>
            <Pill kind="outline" size="md" href="#">
              How verification works
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className={cn(SECTION, "mt-16 lg:mt-20")}>
      <div className="border-tn-hair bg-tn-paper rounded-3xl border px-7 py-12 text-center sm:px-12 lg:py-16">
        <h2 className="text-tn-ink text-[34px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[46px]">
          Ready to skip the wasted trips?
        </h2>
        <p className="text-tn-mute mx-auto mt-4 max-w-[520px] text-[16.5px] leading-[1.5] sm:text-[17.5px]">
          Browse 8,920 live listings from 412 verified shops — or put your own shop on the map.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">
            Browse listings
          </Pill>
          <Pill kind="outline" size="lg" icon="tg" href="#">
            List your shop
          </Pill>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main>
      <Hero />
      <Pillars />

      <div className="mt-16 lg:mt-20">
        <Journey eyebrow="For buyers" color="text-tn-red" title="From search to shop floor, in four steps." steps={BUYER_STEPS} />
      </div>

      <ConfirmLoop />

      {/* Shop-owner journey on its own full-bleed band */}
      <section className="border-tn-hair bg-tn-paper mt-16 border-y py-14 lg:mt-20 lg:py-[72px]">
        <Journey eyebrow="For shop owners" color="text-tn-green" title="Get listed, get verified, get ready-to-buy leads." steps={OWNER_STEPS} />
      </section>

      <Principles />
      <StatBand />
      <About />
      <FinalCTA />
    </main>
  );
}
