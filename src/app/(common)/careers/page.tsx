import type { Metadata } from "next";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import {
  BENEFITS,
  CARDS,
  CAREERS_EMAIL,
  FAQS,
  PROCESS_STEPS,
  ROLES,
} from "@/components/careers/data";
import HowWeWork from "@/components/careers/how-we-work";
import OpenRoles from "@/components/careers/open-roles";
import WhatYouGet from "@/components/careers/what-you-get";
import HiringProcess from "@/components/careers/hiring-process";
import Faqs from "@/components/careers/faqs";

export const metadata: Metadata = {
  title: "Careers — Tinsae",
  description:
    "Help make local commerce trustworthy. Open roles in Addis Ababa at Tinsae.",
  openGraph: {
    title: "Careers at Tinsae",
    description:
      "Help make local commerce trustworthy. Open roles in Addis Ababa at Tinsae.",
    url: "https://tinsae.et/careers",
    siteName: "Tinsae",
    type: "website",
  },
};

export default function CareersPage() {
  const roleCount = ROLES.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-tn-hair px-4 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-16 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="max-w-[800px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-tn-hair bg-white px-3.5 py-1 text-xs font-semibold text-tn-ink2 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              We&apos;re hiring
            </span>

            <h1 className="text-tn-ink mt-5 text-[38px] leading-[1.04] font-extrabold tracking-[-0.035em] sm:text-[54px] lg:text-[62px]">
              Help make local commerce
              <br />
              <span className="text-tn-red">trustworthy.</span>
            </h1>

            <p className="text-tn-mute mt-5 max-w-[580px] text-base leading-relaxed font-medium sm:text-[18px]">
              Eleven people in Addis building the proof layer under a city&apos;s
              electronics trade. {roleCount} roles open — three of them out in the
              shops.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Pill
                kind="solid"
                size="lg"
                iconAfter="chevd"
                href="#roles"
              >
                See open roles
              </Pill>
              <Pill
                kind="outline"
                size="lg"
                icon="tg"
                href="https://t.me/TinsaeJobs"
              >
                Apply on Telegram
              </Pill>
            </div>

            <div className="font-tn-mono text-tn-mute mt-10 flex flex-wrap items-center gap-3 border-t border-tn-hair pt-6 text-xs sm:text-sm">
              <span>
                <strong className="text-tn-ink font-bold">{roleCount}</strong> open
                roles
              </span>
              <span className="text-neutral-300">·</span>
              <span>
                <strong className="text-tn-ink font-bold">11</strong> people today
              </span>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="pin" size={14} className="text-tn-mute" />
                <strong className="text-tn-ink font-bold">Addis</strong> only, for
                now
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How we work */}
      <HowWeWork cards={CARDS} />

      {/* Open roles */}
      <OpenRoles roles={ROLES} />

      {/* What you get */}
      <WhatYouGet benefits={BENEFITS} />

      {/* Hiring process */}
      <HiringProcess steps={PROCESS_STEPS} />

      {/* FAQ */}
      <Faqs faqs={FAQS} />

      {/* Banner */}
      <section className="px-4 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-6 py-14 text-center sm:px-12 sm:py-16">
            <span
              aria-hidden
              className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 text-[260px] leading-none font-bold text-white/[0.08] sm:text-[340px]"
            >
              ትንሳኤ
            </span>
            <div className="relative z-10 mx-auto max-w-[640px]">
              <h2 className="text-[32px] leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-[46px]">
                Message us on Telegram.
              </h2>
              <p className="mx-auto mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
                One note, the role name, and why. That is the whole application.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Pill
                  kind="light"
                  size="lg"
                  icon="tg"
                  href={`mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(
                    "Careers Application — Tinsae"
                  )}`}
                >
                  Apply now
                </Pill>
                <Pill
                  kind="ghost"
                  size="lg"
                  href="/about"
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                >
                  About Tinsae
                </Pill>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
