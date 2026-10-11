import Link from "next/link";

import { Icon } from "@/components/tinsae/icon";
import { TinsaeLogo } from "@/components/tinsae/logo";

/**
 * The two-panel auth gateway from the design handoff.
 *
 * Left is the trust argument, right is the card. The handoff leaves the
 * responsive collapse undesigned ("below ~860px the split must collapse"), so
 * below `lg` the dark panel becomes a short header — logo, headline, trust
 * line — and the card takes the rest. The stats and body copy are the parts
 * that go, because they are the least load-bearing on a phone.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:min-h-screen lg:grid-cols-[1fr_clamp(440px,42%,560px)]">
      <BrandPanel />

      <div className="flex min-h-[70vh] flex-col lg:min-h-screen">
        <div className="flex justify-end px-6 py-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-tn-mute transition-colors hover:text-tn-ink2"
          >
            <Icon name="arrow" size={15} className="rotate-180" />
            Back to browsing
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 lg:px-10">
          <div className="w-full max-w-[368px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative isolate overflow-hidden bg-tn-ink px-6 py-8 text-white lg:flex lg:flex-col lg:px-13 lg:py-10">
      {/* Two red glows, top-right and bottom-left, exactly as specced. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_110%_-10%,rgba(204,48,0,0.42)_0%,transparent_55%),radial-gradient(70%_60%_at_-10%_110%,rgba(204,48,0,0.20)_0%,transparent_60%)]"
      />

      <Link href="/" className="inline-block">
        {/* Kept above the asset README's 160px floor, below which the tagline
            is meant to be dropped for the compact lockup. */}
        <TinsaeLogo tone="onDark" className="h-[70px] w-[167px]" />
      </Link>

      <div className="mt-8 max-w-[440px] lg:my-auto lg:pt-8 lg:pb-7">
        <p className="hidden font-tn-mono text-[11px] font-bold tracking-[0.14em] text-white/55 uppercase lg:block">
          All over Ethiopia
        </p>
        <h1 className="mt-0 text-[28px] leading-[1.1] font-extrabold tracking-[-0.035em] lg:mt-4.5 lg:text-[38px]">
          The verified way to buy electronics in&nbsp;Ethiopia.
        </h1>
        <p className="mt-4 hidden text-[15.5px] leading-[1.55] font-medium text-white/70 lg:block">
          Compare live prices across verified shops, then message the seller on
          Telegram — no middlemen, no fake listings.
        </p>

        {/* TODO: these three are hard-coded in the handoff and disagree with the
            numbers on other screens. Wire to the API before launch. */}
        <dl className="mt-7 hidden gap-7.5 lg:flex">
          {[
            ["340+", "verified shops"],
            ["2,840", "live listings"],
            ["~4 min", "median reply"],
          ].map(([figure, label]) => (
            <div key={label}>
              <dt className="font-tn-mono text-[28px] font-extrabold tracking-[-0.03em] whitespace-nowrap">
                {figure}
              </dt>
              <dd className="mt-0.75 text-xs font-semibold text-white/55">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 flex max-w-[440px] items-center gap-3 rounded-[14px] border border-white/10 bg-white/6 px-4.5 py-4 lg:mt-0">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[rgba(31,138,91,0.22)]">
          <Icon name="shield" size={20} className="text-[#5fcf9b]" />
        </span>
        <p className="text-[13px] leading-[1.45] text-white/82">
          Every shop is identity-checked in person before it can list.{" "}
          <b className="font-bold text-white">Look for the badge.</b>
        </p>
      </div>
    </aside>
  );
}
