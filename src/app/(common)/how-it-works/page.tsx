import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

export const metadata: Metadata = {
  title: "How It Works — Tinsae",
  description:
    "How Tinsae's verified and daily-confirmed local marketplace model works for buyers and shop owners in Bole, Addis Ababa.",
};

function Eyebrow({ children, color = "text-tn-red" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className={`mb-3.5 text-[13px] font-bold tracking-[0.11em] uppercase ${color}`}>
      {children}
    </div>
  );
}

function SectionHead({
  eyebrow,
  color = "text-tn-red",
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  color?: string;
  title: string;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-[720px] ${center ? "mx-auto text-center" : ""}`}>
      <Eyebrow color={color}>{eyebrow}</Eyebrow>
      <h2 className="text-tn-ink text-[34px] leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-[44px]">
        {title}
      </h2>
      {intro && (
        <p
          className={`text-tn-mute mt-4 text-base leading-relaxed font-medium sm:text-[17.5px] ${
            center ? "mx-auto max-w-[620px]" : "max-w-[560px]"
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

function BeforeAfter() {
  const oldSteps = [
    { title: "Call around", desc: "Prices are hearsay" },
    { title: "Taxi to Bole", desc: "Maybe in stock" },
    { title: "Shop 1", desc: "Sold out", failed: true },
    { title: "Shop 2", desc: "Wrong variant", failed: true },
    { title: "Shop 3", desc: "In stock — overpriced", failed: true },
  ];

  const tinsaeSteps: [string, string, IconName][] = [
    ["Search the product", "Every shop, live prices", "search"],
    ["See it confirmed", "In stock 1h ago", "shield"],
    ["Message on Telegram", "Agreed: 142,500 ETB", "tg"],
    ["Visit & pay", "Inspect, then buy", "pin"],
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {/* Old Way */}
      <div className="border-tn-hair rounded-[18px] border bg-white p-5 shadow-[0_14px_40px_rgba(11,11,11,0.05)] sm:p-5.5">
        <div className="text-tn-mute mb-4 inline-flex items-center gap-2 text-[11.5px] font-bold tracking-[0.05em] uppercase">
          <span className="size-2 rounded-full bg-[#B4B2AB]" />
          The old way
        </div>
        <div className="flex flex-col gap-2">
          {oldSteps.map((step, i) => (
            <div key={i} className="bg-tn-paper flex items-center gap-2.5 rounded-xl p-2.5">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  step.failed ? "bg-[#F3E3DE] text-[#A82500]" : "bg-[#ECEAE3] text-tn-mute"
                }`}
              >
                {step.failed ? "✕" : "→"}
              </span>
              <div className="min-w-0">
                <div className="text-tn-ink2 text-[12.5px] font-bold">{step.title}</div>
                <div className="text-tn-mute text-[11px]">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="font-tn-mono text-tn-mute border-tn-hair2 mt-3.5 flex items-center gap-2 border-t pt-3 text-xs">
          <Icon name="clock" size={13} className="text-[#B8741F]" />
          Half a day · 5 shops · 1 sale
        </div>
      </div>

      {/* Tinsae Way */}
      <div className="bg-tn-ink relative overflow-hidden rounded-[18px] p-5 text-white shadow-[0_24px_60px_rgba(11,11,11,0.22)] sm:p-5.5">
        <div
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -right-6 -bottom-10 text-[140px] leading-none font-bold text-white/[0.05] select-none"
        >
          ት
        </div>
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 text-[11.5px] font-bold tracking-[0.05em] uppercase text-white">
            <span className="bg-tn-green size-2 rounded-full" />
            With Tinsae
          </div>
          <div className="flex flex-col gap-2">
            {tinsaeSteps.map(([title, desc, icon], i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/6 p-2.5"
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${
                    i === 1 ? "bg-tn-green text-white" : "bg-white/15 text-white"
                  }`}
                >
                  <Icon name={icon} size={13} />
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-white">{title}</div>
                  <div className="font-tn-mono text-[11px] text-white/60">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="font-tn-mono mt-3.5 flex items-center gap-2 border-t border-white/15 pt-3 text-xs text-white/80">
            <Icon name="bolt" size={13} className="text-tn-green" />
            One trip · right shop · right price
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const buyerSteps: [string, IconName, string, string][] = [
    [
      "01",
      "search",
      "Search the product",
      "Type what you want. Every verified shop carrying it appears, sorted by price and freshness.",
    ],
    [
      "02",
      "shield",
      "Check it’s confirmed",
      "The freshness dot tells you when the shop last confirmed stock — hours, not weeks.",
    ],
    [
      "03",
      "tg",
      "Contact on Telegram",
      "Message the shop directly. Ask questions, agree on a price and a time to come by.",
    ],
    [
      "04",
      "pin",
      "Visit & pay in person",
      "Walk in, inspect the item, complete the purchase. Tinsae stays out of the money.",
    ],
  ];

  const sellerSteps: [string, IconName, string, string][] = [
    [
      "01",
      "building",
      "Register your shop",
      "Claim an existing listing or create your storefront with hours, location and photos.",
    ],
    [
      "02",
      "shield",
      "Get verified",
      "We confirm your phone, documents and pay a quick visit to your store. Then the badge is yours.",
    ],
    [
      "03",
      "tg",
      "Connect the bot",
      "Link Telegram and import your stock. One message each morning keeps every listing fresh.",
    ],
    [
      "04",
      "bell",
      "Receive leads",
      "Ready-to-buy customers reach you directly — no commission, no payment handling, ever.",
    ],
  ];

  return (
    <main className="text-tn-ink">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="border-tn-hair2 relative overflow-hidden border-b bg-[radial-gradient(120%_90%_at_88%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_52%)]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-6 pt-14 pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-7 lg:pt-[72px] lg:pb-20">
          <div>
            <div className="border-tn-hair text-tn-ink2 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[13px] font-bold shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
              <span className="bg-tn-green size-2 rounded-full shadow-[0_0_0_4px_#E8F5EE]" />
              How Tinsae works
            </div>
            <h1 className="text-tn-ink mt-5 text-[42px] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[56px] lg:text-[62px]">
              Stock you can trust,
              <br />
              before you <span className="text-tn-red">cross town.</span>
            </h1>
            <p className="text-tn-mute mt-6 max-w-[500px] text-base leading-relaxed font-medium sm:text-[18.5px]">
              Tinsae is a verified electronics marketplace for Addis Ababa. Every shop is checked in
              person, and every listing is re-confirmed in stock — so the price you see is the one
              that&apos;s actually on the shelf.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">
                Browse listings
              </Pill>
              <Pill kind="outline" size="lg" icon="tg" href="/signup">
                List your shop
              </Pill>
            </div>
            <div className="font-tn-mono text-tn-ink2 mt-8 flex flex-wrap items-center gap-6 text-[13px]">
              <span className="inline-flex items-center gap-2">
                <Icon name="shield" size={15} className="text-tn-green" />
                412 verified shops
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="bolt" size={15} className="text-tn-red" />
                96% reconfirmed today
              </span>
            </div>
          </div>

          <div>
            <BeforeAfter />
          </div>
        </div>
      </section>

      {/* ── 3 PILLARS ────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <SectionHead
          eyebrow="The model"
          title="Three things make a listing trustworthy."
          intro="Most marketplaces show you a photo and a price. Tinsae shows you proof that the shop is real and the item is actually there, right now."
        />

        <div className="mt-10 grid grid-cols-1 gap-4.5 md:grid-cols-3">
          {[
            {
              icon: "shield" as IconName,
              color: "text-tn-green",
              bg: "bg-tn-green-soft",
              title: "Verified in person",
              desc: "Before a shop appears on Tinsae, our team confirms a real business at a real address in Bole — phone, documents, and a physical store visit.",
            },
            {
              icon: "bolt" as IconName,
              color: "text-tn-red",
              bg: "bg-tn-red-soft",
              title: "Confirmed every morning",
              desc: "Shops re-confirm what’s in stock through our Telegram bot daily. A freshness dot shows exactly how recent each listing is — stale ones drop off.",
            },
            {
              icon: "pin" as IconName,
              color: "text-[#2A6FDB]",
              bg: "bg-[#EBF2FC]",
              title: "Bought in person",
              desc: "You message the shop, agree on terms, then walk in to inspect and pay. Tinsae never holds your money or stands between you and the seller.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="border-tn-hair rounded-2xl border bg-white p-7 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-[#E0DDD4] hover:shadow-[0_14px_36px_rgba(11,11,11,0.06)]"
            >
              <div
                className={`mb-5 inline-flex size-14 items-center justify-center rounded-2xl ${item.bg}`}
              >
                <Icon name={item.icon} size={26} className={item.color} />
              </div>
              <h3 className="text-tn-ink text-xl font-extrabold tracking-tight">{item.title}</h3>
              <p className="text-tn-mute mt-2.5 text-[14.5px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUYER JOURNEY ────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <SectionHead
          eyebrow="For buyers"
          color="text-tn-red"
          title="From search to shop floor, in four steps."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4.5">
          {buyerSteps.map(([num, icon, title, desc], i) => (
            <div key={i}>
              <div className="mb-4.5 flex items-center gap-3">
                <span className="border-tn-hair bg-tn-paper inline-flex size-11 shrink-0 items-center justify-center rounded-xl border">
                  <Icon name={icon} size={20} className="text-tn-red" />
                </span>
                <span className="bg-tn-hair relative h-px flex-1">
                  {i < buyerSteps.length - 1 && (
                    <span className="bg-tn-hair absolute -top-0.5 -right-1 size-1.5 rounded-full" />
                  )}
                </span>
              </div>
              <div className="font-tn-mono text-tn-red text-[13px] font-bold">{num}</div>
              <h3 className="text-tn-ink mt-2 text-lg font-extrabold tracking-tight">{title}</h3>
              <p className="text-tn-mute mt-1.5 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONFIRMATION LOOP ────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <div className="border-tn-hair bg-tn-paper grid grid-cols-1 items-center gap-10 rounded-3xl border p-8 sm:p-11 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <Eyebrow>The differentiator</Eyebrow>
            <h2 className="text-tn-ink text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[38px]">
              A listing is only as good as its{" "}
              <span className="text-tn-red">last confirmation.</span>
            </h2>
            <p className="text-tn-mute mt-4 max-w-lg text-base leading-relaxed">
              Each morning the bot asks shops one question: is this still in stock, at this price?
              Their reply timestamps the listing — and you see it as a freshness dot the moment you
              search.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              {[
                {
                  dot: "bg-tn-green",
                  glow: "shadow-[0_0_0_4px_rgba(31,138,91,0.18)]",
                  label: "Green",
                  desc: "Confirmed within 6 hours — buy with confidence",
                },
                {
                  dot: "bg-tn-warn",
                  glow: "shadow-[0_0_0_4px_rgba(184,116,31,0.18)]",
                  label: "Amber",
                  desc: "6–24 hours old — likely fine, worth a quick message",
                },
                {
                  dot: "bg-tn-stale",
                  glow: "shadow-[0_0_0_4px_rgba(154,154,149,0.18)]",
                  label: "Grey",
                  desc: "Over a day — Tinsae quietly stops showing it",
                },
              ].map((tier, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`size-3 shrink-0 rounded-full ${tier.dot} ${tier.glow}`} />
                  <span className="text-tn-ink2 text-[13.5px]">
                    <b className="text-tn-ink font-extrabold">{tier.label}.</b> {tier.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Telegram Chat Simulation */}
          <div className="font-tn-mono bg-tn-ink rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5 border-b border-white/12 pb-3.5">
              <Icon name="tg" size={17} className="text-tn-telegram" />
              <span className="text-[13.5px] font-bold text-white">@TinsaeStockBot</span>
              <span className="bg-tn-green ml-auto rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-white">
                ONLINE
              </span>
            </div>
            <div className="flex flex-col gap-2.5 text-[12.5px]">
              <div className="max-w-[90%] self-start rounded-xl bg-[#262626] px-3.5 py-2.5 text-white/90">
                ☀️ Good morning! Still have <span className="text-[#FFB69E]">iPhone 15 Pro 256GB</span> in
                stock at 142,500?
              </div>
              <div className="bg-tn-red max-w-[75%] self-end rounded-xl px-3.5 py-2.5 font-bold text-white">
                ✅ Yes — 3 units
              </div>
              <div className="text-tn-green max-w-[90%] self-start rounded-xl bg-[#262626] px-3.5 py-2.5">
                Confirmed 09:14 · pinned to the top of search ↑
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2.5 border-t border-white/12 pt-3.5">
              <span className="bg-tn-green size-2 rounded-full shadow-[0_0_0_4px_rgba(31,138,91,0.25)]" />
              <span className="text-xs text-white/60">Buyers now see a green dot · &ldquo;1h ago&rdquo;</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SELLER JOURNEY ───────────────────────────────── */}
      <section className="border-tn-hair mt-20 border-y bg-tn-paper py-16 lg:mt-24 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-7">
          <SectionHead
            eyebrow="For shop owners"
            color="text-tn-green"
            title="Get listed, get verified, get ready-to-buy leads."
          />

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4.5">
            {sellerSteps.map(([num, icon, title, desc], i) => (
              <div key={i}>
                <div className="mb-4.5 flex items-center gap-3">
                  <span className="border-tn-hair inline-flex size-11 shrink-0 items-center justify-center rounded-xl border bg-white">
                    <Icon name={icon} size={20} className="text-tn-green" />
                  </span>
                  <span className="bg-tn-hair relative h-px flex-1">
                    {i < sellerSteps.length - 1 && (
                      <span className="bg-tn-hair absolute -top-0.5 -right-1 size-1.5 rounded-full" />
                    )}
                  </span>
                </div>
                <div className="font-tn-mono text-tn-green text-[13px] font-bold">{num}</div>
                <h3 className="text-tn-ink mt-2 text-lg font-extrabold tracking-tight">{title}</h3>
                <p className="text-tn-mute mt-1.5 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE ARE / AREN'T ─────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <SectionHead eyebrow="Where we stand" title="What Tinsae is — and isn’t." center />

        <div className="mx-auto mt-10 grid max-w-[920px] grid-cols-1 gap-4.5 sm:grid-cols-2">
          {/* What we are */}
          <div className="border-tn-green/30 bg-tn-green-soft rounded-2xl border p-7">
            <div className="text-tn-green mb-5 inline-flex items-center gap-2 text-sm font-extrabold">
              <span className="bg-tn-green inline-flex size-6 items-center justify-center rounded-lg text-white">
                <Icon name="check" size={15} strokeWidth={2.4} />
              </span>
              What we are
            </div>
            <div className="flex flex-col gap-3.5">
              {[
                "A directory of shops verified in person",
                "A live, daily-confirmed price comparison",
                "A direct line to the shop on Telegram",
                "Free to browse, with no markup on any price",
              ].map((item, i) => (
                <div key={i} className="text-tn-ink2 flex items-start gap-2.5 text-sm leading-normal">
                  <Icon
                    name="check"
                    size={16}
                    className="text-tn-green mt-0.5 shrink-0"
                    strokeWidth={2.4}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What we're not */}
          <div className="border-tn-hair rounded-2xl border bg-white p-7">
            <div className="text-tn-ink2 mb-5 inline-flex items-center gap-2 text-sm font-extrabold">
              <span className="bg-tn-paper text-tn-mute inline-flex size-6 items-center justify-center rounded-lg">
                <Icon name="minus" size={15} strokeWidth={2.4} />
              </span>
              What we’re not
            </div>
            <div className="flex flex-col gap-3.5">
              {[
                "A place that holds or processes your payment",
                "A delivery or escrow service",
                "A reseller — we never own the inventory",
                "A reviews-only site with stale, unchecked listings",
              ].map((item, i) => (
                <div key={i} className="text-tn-mute flex items-start gap-2.5 text-sm leading-normal">
                  <Icon
                    name="minus"
                    size={16}
                    className="mt-0.5 shrink-0 text-[#C4C2BB]"
                    strokeWidth={2.4}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT BAND ────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <div className="bg-tn-ink relative overflow-hidden rounded-3xl px-7 py-12 sm:px-12 sm:py-14">
          <span
            aria-hidden
            className="font-tn-amh pointer-events-none absolute -top-16 -right-10 text-[300px] leading-none font-bold text-white/[0.04]"
          >
            ትንሳኤ
          </span>
          <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              ["8,920", "listings live today"],
              ["412", "verified shops in Bole"],
              ["96%", "reconfirmed within 24h"],
              ["~3.4h", "average shop response"],
            ].map(([figure, label], i) => (
              <div
                key={label}
                className={i > 0 ? "sm:border-l sm:border-white/15 sm:pl-8 lg:pl-7" : ""}
              >
                <p className="font-tn-mono text-[32px] leading-none font-semibold tracking-[-0.03em] text-white sm:text-[46px]">
                  {figure}
                </p>
                <p className="mt-2.5 text-[13.5px] font-medium text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / MISSION ──────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#CC3000_0%,#E5562A_60%,#FF7A45_100%)] p-12 text-center text-white sm:p-14">
            <span className="font-tn-amh block text-[80px] leading-none font-bold sm:text-[96px]">
              ትንሳኤ
            </span>
            <span className="mt-4 inline-block text-[13px] font-bold tracking-[0.22em] text-white/90">
              T I N S A E
            </span>
            <div className="mt-2 text-sm italic text-white/80">&ldquo;rising&rdquo;</div>
          </div>

          <div>
            <Eyebrow>Why we built it</Eyebrow>
            <h2 className="text-tn-ink text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
              Bole runs on trust between people. We just made it visible.
            </h2>
            <p className="text-tn-ink2 mt-5 text-base leading-relaxed sm:text-[16.5px]">
              Addis already has hundreds of honest electronics shops. What it lacked was a way to{" "}
              <i>prove</i> it before you spend an afternoon in traffic — a shared, public record of
              who&apos;s real and what&apos;s actually in stock.
            </p>
            <p className="text-tn-mute mt-4 text-base leading-relaxed sm:text-[16.5px]">
              <b className="text-tn-ink font-bold">Tinsae</b> — Amharic for <i>&ldquo;rising&rdquo;</i>{" "}
              — is that record. We verify the shops, the bot keeps them honest about stock, and you
              keep buying in person, the way Addis has always done business. We never touch the money.
              We just make the trust legible.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Pill kind="dark" size="md" iconAfter="arrow" href="/products?verified_only=1">
                Meet the verified shops
              </Pill>
              <Pill kind="outline" size="md" href="/signup">
                List your shop
              </Pill>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="mx-auto mt-20 mb-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <div className="border-tn-hair bg-tn-paper rounded-3xl border px-8 py-14 text-center sm:px-12 sm:py-16">
          <h2 className="text-tn-ink text-[34px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[46px]">
            Ready to skip the wasted trips?
          </h2>
          <p className="text-tn-mute mx-auto mt-4 max-w-lg text-base leading-relaxed sm:text-[17.5px]">
            Browse 8,920 live listings from 412 verified shops — or put your own shop on the map.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">
              Browse listings
            </Pill>
            <Pill kind="outline" size="lg" icon="tg" href="/signup">
              List your shop
            </Pill>
          </div>
        </div>
      </section>
    </main>
  );
}
