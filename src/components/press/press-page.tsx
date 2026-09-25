import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { SectionHead } from "@/components/trust-safety/section-head";
import { formatCoverageDate, sortCoverageNewestFirst } from "@/lib/press";
import { CopyBoilerplateButton } from "./copy-boilerplate-button";
import {
  BOILERPLATE,
  BOILERPLATE_UPDATED,
  BRAND_KIT_URL,
  FACTS,
  FACTS_AS_OF,
  LOGO_ASSETS,
  PRESS_COVERAGE,
  PRESS_EMAIL,
  PRESS_STATS,
  PRESS_TELEGRAM,
  SWATCHES,
  type LogoTone,
} from "./data";

const TELEGRAM_URL = `https://t.me/${PRESS_TELEGRAM}`;
const MAILTO = `mailto:${PRESS_EMAIL}`;

const WRAP = "mx-auto max-w-[1240px] px-6 lg:px-7";
const CARD_LABEL = "text-[11px] font-extrabold tracking-[0.08em] uppercase";

function PressHero() {
  return (
    <section className="border-tn-hair2 relative overflow-hidden border-b bg-[radial-gradient(120%_90%_at_86%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_52%)]">
      <div className={`${WRAP} pt-14 pb-14 lg:pt-[76px] lg:pb-16`}>
        <div className="border-tn-hair text-tn-ink2 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-[7px] text-[13px] font-bold shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
          <Icon name="msg" size={15} className="text-tn-red" />
          Press &amp; media
        </div>
        <h1 className="text-tn-ink mt-[22px] max-w-[640px] text-[40px] leading-[1.0] font-extrabold tracking-[-0.04em] sm:text-[54px] lg:text-[62px]">
          Everything you need
          <br />
          <span className="text-tn-red">to write about us.</span>
        </h1>
        <p className="text-tn-mute mt-6 max-w-[500px] text-base leading-[1.55] font-medium sm:text-[18.5px]">
          Brand assets, the facts, an approved boilerplate and a human who
          answers. If something is missing, ask — we would rather you got it
          right.
        </p>
        <div className="mt-[30px] flex flex-wrap gap-[11px]">
          <Pill size="lg" icon="box" href={BRAND_KIT_URL} download>
            Download brand kit
          </Pill>
          <Pill kind="outline" size="lg" icon="msg" href={MAILTO}>
            Contact press office
          </Pill>
        </div>
        <div className="font-tn-mono text-tn-mute mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
          <a
            href={MAILTO}
            className="text-tn-ink2 hover:text-tn-ink inline-flex items-center gap-1.5 font-semibold"
          >
            <Icon name="msg" size={14} />
            {PRESS_EMAIL}
          </a>
          <span aria-hidden className="text-tn-hair hidden sm:inline">
            ·
          </span>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            <Icon name="tg" size={14} className="text-tn-telegram" />
            <span className="text-tn-telegram font-semibold">
              @{PRESS_TELEGRAM}
            </span>
            on Telegram
          </a>
        </div>
      </div>
    </section>
  );
}

function BoilerplateSection() {
  const words = BOILERPLATE.trim().split(/\s+/).length;
  return (
    <section className={`${WRAP} mt-20 lg:mt-24`}>
      <SectionHead
        eyebrow="Approved copy"
        title="Boilerplate"
        intro="Use this verbatim in any article, listing or release. It is the description we stand behind."
      />
      <div className="border-tn-hair bg-tn-paper mt-9 max-w-[880px] rounded-[18px] border px-6 py-6 sm:px-[30px] sm:py-7">
        <p className="text-tn-ink2 text-[15.5px] leading-[1.7] font-medium sm:text-[16.5px]">
          {BOILERPLATE}
        </p>
        <div className="mt-[22px] flex flex-wrap items-center gap-2.5">
          <CopyBoilerplateButton text={BOILERPLATE} />
          <span className="font-tn-mono text-tn-mute text-[11.5px]">
            {words} words · updated {BOILERPLATE_UPDATED}
          </span>
        </div>
      </div>
      <div className="mt-[18px] grid max-w-[880px] gap-3 sm:grid-cols-2">
        <div className="border-tn-hair rounded-[14px] border bg-white px-[18px] py-4">
          <div className={`${CARD_LABEL} text-tn-mute`}>Pronunciation</div>
          <div className="mt-[7px] text-[15.5px] font-bold">
            <span className="font-tn-amh">ትንሳኤ</span> —{" "}
            <span className="font-tn-mono font-semibold">tin-SA-eh</span>
          </div>
        </div>
        <div className="border-tn-hair rounded-[14px] border bg-white px-[18px] py-4">
          <div className={`${CARD_LABEL} text-tn-mute`}>Written style</div>
          <div className="mt-[7px] text-[15.5px] font-bold">
            Tinsae — not TINSAE, not Tinsaé
          </div>
        </div>
      </div>
    </section>
  );
}

// The design sets a fact in mono when it reads as a figure: digits, with no
// punctuation beyond what numbers and dates use.
const isFigure = (value: string) =>
  /\d/.test(value) && /^[\d.,%\s·a-zA-Z]+$/.test(value);

function FactSheet() {
  return (
    <section className={`${WRAP} mt-20 lg:mt-24`}>
      <SectionHead
        eyebrow="Fact sheet"
        title="The numbers, checked."
        intro={`Current as of ${FACTS_AS_OF}. If you need a figure that is not here, ask and we will confirm it rather than let you estimate.`}
      />
      <dl className="border-tn-hair mt-9 max-w-[880px] overflow-hidden rounded-[18px] border">
        {FACTS.map(([label, value]) => (
          <div
            key={label}
            className="border-tn-hair2 grid gap-1 border-t bg-white px-5 py-3.5 first:border-t-0 sm:grid-cols-[260px_1fr] sm:gap-5 sm:px-[22px] sm:py-[15px]"
          >
            <dt className="text-tn-mute text-[13px] font-bold">{label}</dt>
            <dd
              className={`text-tn-ink text-[14.5px] font-semibold ${isFigure(value) ? "font-tn-mono" : ""}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// The lockups drawn inline rather than through <img>: an SVG in <img> cannot
// reach the page's webfonts, so the wordmark would fall back to Arial (see
// components/tinsae/logo.tsx). Geometry is copied from the files in
// public/assets/logo/, which are what the cards download.
const LOCKUP_COLORS: Record<
  Exclude<LogoTone, "mark">,
  [mark: string, word: string]
> = {
  onRed: ["#FFFFFF", "#FFFFFF"],
  onPaper: ["#CC3000", "#0B0B0B"],
  onInk: ["#FFFFFF", "#FFFFFF"],
};

function LogoPreview({ tone, label }: { tone: LogoTone; label: string }) {
  const mark = (stroke: string) => (
    <g
      fill="none"
      stroke={stroke}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 39 L22 49 L57 9" />
      <path d="M42 9 H57 V24" />
    </g>
  );

  if (tone === "mark") {
    return (
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label={label}
        className="h-14 w-14"
      >
        {mark("#CC3000")}
      </svg>
    );
  }

  const [markColor, wordColor] = LOCKUP_COLORS[tone];
  return (
    <svg
      viewBox="30 30 190 60"
      role="img"
      aria-label={label}
      className="h-12 w-auto"
    >
      <g transform="translate(36 39) scale(0.65625)">{mark(markColor)}</g>
      <text
        x="94"
        y="60"
        fill={wordColor}
        fontSize="36"
        fontWeight="800"
        letterSpacing="-1.26"
        dominantBaseline="central"
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        Tinsae
      </text>
    </svg>
  );
}

function BrandAssets() {
  return (
    <section className="bg-tn-paper mt-20 py-16 lg:mt-24 lg:py-20">
      <div className={WRAP}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHead
            eyebrow="Brand assets"
            title="Logo, mark and palette."
            intro="SVG only — please do not screenshot the logo or recolour it. Clear space is equal to the height of the mark on all sides."
          />
          <a
            href={BRAND_KIT_URL}
            download
            className="text-tn-ink hover:text-tn-red inline-flex shrink-0 items-center gap-1.5 text-sm font-bold"
          >
            Full usage rules
            <Icon name="arrow" size={15} className="text-tn-red" />
          </a>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {LOGO_ASSETS.map((asset) => (
            <a
              key={asset.file}
              href={`/assets/logo/${asset.file}`}
              download
              className="border-tn-hair group overflow-hidden rounded-[16px] border bg-white transition-shadow hover:shadow-[0_10px_30px_rgba(11,11,11,0.08)]"
            >
              <div
                className={`border-tn-hair2 flex h-[112px] items-center justify-center border-b p-[22px] ${asset.ground}`}
              >
                <LogoPreview tone={asset.tone} label={asset.label} />
              </div>
              <div className="px-4 py-3.5">
                <div className="text-tn-ink text-sm font-extrabold tracking-[-0.01em]">
                  {asset.label}
                </div>
                <div className="text-tn-mute mt-[3px] text-xs font-medium">
                  {asset.note}
                </div>
                <div className="border-tn-hair2 font-tn-mono text-tn-mute group-hover:text-tn-red mt-2.5 flex items-center justify-between gap-2 border-t pt-[9px] text-[10.5px] break-all">
                  {asset.file}
                  <Icon name="chevd" size={13} className="shrink-0" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-[18px] grid grid-cols-3 gap-3 lg:grid-cols-6">
          {SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              className="border-tn-hair overflow-hidden rounded-xl border bg-white"
            >
              <div className={`border-tn-hair2 h-14 border-b ${swatch.fill}`} />
              <div className="px-[11px] py-[9px]">
                <div className="text-tn-ink text-[12.5px] font-bold">
                  {swatch.name}
                </div>
                <div className="font-tn-mono text-tn-mute mt-0.5 text-[11px]">
                  {swatch.hex}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[18px] grid gap-3 md:grid-cols-2">
          <div className="border-tn-hair rounded-[14px] border bg-white px-[18px] py-4">
            <div className={`${CARD_LABEL} text-tn-mute mb-[9px]`}>
              Typefaces
            </div>
            <p className="text-tn-ink2 text-sm leading-[1.7] font-medium">
              <b>Plus Jakarta Sans</b> — all interface and prose
              <br />
              <b className="font-tn-mono">JetBrains Mono</b> — every number
              <br />
              <b className="font-tn-amh">Noto Sans Ethiopic</b> — the{" "}
              <span className="font-tn-amh">ትንሳኤ</span> wordmark
            </p>
          </div>
          <div className="bg-tn-red-soft rounded-[14px] border border-[#FBD9C7] px-[18px] py-4">
            <div className={`${CARD_LABEL} text-tn-red-dark mb-[9px]`}>
              Please don&apos;t
            </div>
            <p className="text-tn-red-dark text-sm leading-[1.7] font-medium">
              Recolour the mark · stretch or rotate the lockup · place the red
              lockup on a busy photo · rebuild the wordmark in another typeface
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  const coverage = sortCoverageNewestFirst(PRESS_COVERAGE);
  return (
    <section className={`${WRAP} mt-20 lg:mt-24`}>
      <SectionHead eyebrow="In the press" title="Recent coverage" />
      {coverage.length === 0 ? (
        <div className="border-tn-hair mt-9 flex max-w-[960px] flex-col items-start gap-4 rounded-[16px] border border-dashed bg-white px-6 py-7 sm:flex-row sm:items-center">
          <span className="bg-tn-paper text-tn-red inline-flex size-10 shrink-0 items-center justify-center rounded-[11px]">
            <Icon name="msg" size={18} />
          </span>
          <div className="flex-1">
            <div className="text-tn-ink text-[15.5px] font-extrabold tracking-[-0.015em]">
              No coverage yet — we are new.
            </div>
            <p className="text-tn-mute mt-1 text-[13.5px] leading-[1.55]">
              Writing the first piece? Everything above is yours to use, and the
              press office will answer any question you have.
            </p>
          </div>
          <a
            href={MAILTO}
            className="font-tn-mono text-tn-red hover:text-tn-red-dark shrink-0 text-[13px] font-semibold"
          >
            {PRESS_EMAIL}
          </a>
        </div>
      ) : (
        <ul className="mt-9 flex max-w-[960px] flex-col gap-2.5">
          {coverage.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-tn-hair flex flex-col gap-2 rounded-[16px] border bg-white px-5 py-4 transition-shadow hover:shadow-[0_10px_30px_rgba(11,11,11,0.08)] sm:flex-row sm:items-center sm:gap-[18px] sm:px-[22px] sm:py-[18px]"
              >
                <div className="sm:w-[150px] sm:shrink-0">
                  <div className="text-tn-ink text-[13.5px] font-extrabold tracking-[-0.01em]">
                    {item.outlet}
                  </div>
                  <time
                    dateTime={item.date}
                    className="font-tn-mono text-tn-mute mt-[3px] block text-[11px]"
                  >
                    {formatCoverageDate(item.date)}
                  </time>
                </div>
                <div className="text-tn-ink min-w-0 flex-1 text-[15.5px] leading-[1.35] font-bold tracking-[-0.015em]">
                  {item.headline}
                  <span className="sr-only"> (opens in a new tab)</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {item.kind && (
                    <span className="bg-tn-paper text-tn-ink2 inline-flex h-[26px] items-center rounded-full px-[11px] text-[11.5px] font-bold">
                      {item.kind}
                    </span>
                  )}
                  <Icon name="arrow" size={16} className="text-tn-red" />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatBand() {
  return (
    <section className={`${WRAP} mt-20 lg:mt-24`}>
      <div className="bg-tn-ink relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-[52px]">
        <div
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-16 -right-10 text-[260px] leading-none font-bold text-white/[0.04] select-none sm:text-[300px]"
        >
          ትንሳኤ
        </div>
        <div className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
          {PRESS_STATS.map(([value, label], index) => (
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

function CtaBand() {
  return (
    <section className={`${WRAP} mt-20 mb-20 lg:mt-24`}>
      <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-7 py-12 text-center sm:px-12 lg:py-[58px]">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 text-[220px] leading-none font-bold text-white/[0.09]"
        >
          ትንሳኤ
        </span>
        <div className="relative">
          <h2 className="text-[34px] leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-[48px]">
            Working on a story?
          </h2>
          <p className="mx-auto mt-[18px] max-w-[520px] text-base leading-[1.5] text-white/90 sm:text-lg">
            Our press office answers on Telegram and email, usually same-day
            during Addis business hours.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Pill kind="light" size="lg" icon="tg" href={TELEGRAM_URL} newTab>
              Reach the press office
            </Pill>
            <Pill
              kind="ghost"
              size="lg"
              href="/about"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Read our story
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PressPage() {
  return (
    <main className="text-tn-ink">
      <PressHero />
      <BoilerplateSection />
      <FactSheet />
      <BrandAssets />
      <Coverage />
      <StatBand />
      <CtaBand />
    </main>
  );
}
