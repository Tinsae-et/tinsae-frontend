"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/tinsae/icon";

export type ErrorPageKind = "404" | "500";

type Copy = {
  chip: string;
  title: [string, string];
  body: string;
  dot: string;
};
const COPY: Record<ErrorPageKind, Copy> = {
  "404": {
    chip: "HTTP 404 · NO SUCH ADDRESS",
    title: ["This address", "doesn't exist."],
    body: "The link may be mistyped, or the page may have moved. Nothing on Tinsae is lost — here's the way back to something real.",
    dot: "#9A9A95",
  },
  "500": {
    chip: "HTTP 500 · OUR END, NOT YOURS",
    title: ["Something broke", "on our side."],
    body: "Our team has been paged automatically. Your account, saved listings and alerts are all safe — try again in a moment.",
    dot: "#B8741F",
  },
};

const LINKS: Array<{
  href: string;
  label: string;
  sub: string;
  icon: IconName;
}> = [
  { href: "/", label: "Home", sub: "Start over", icon: "home" },
  {
    href: "/products",
    label: "Browse listings",
    sub: "2,840 live",
    icon: "search",
  },
  {
    href: "/products?verified_only=1",
    label: "Verified shops",
    sub: "412 in Bole",
    icon: "shield",
  },
  { href: "/help", label: "Help center", sub: "Talk to us", icon: "msg" },
];

function Legend({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className={`absolute left-3.5 top-3.5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-tn-mono text-[11.5px] font-bold ${dark ? "bg-white/10 text-white/80" : "bg-white/95 text-tn-ink2"}`}
    >
      <span
        className={`size-[7px] rounded-full ${dark ? "bg-[#B8741F]" : "bg-[#9A9A95]"}`}
      />
      {children}
    </span>
  );
}

function MapGraphic() {
  return (
    <div className="relative aspect-[4/3.2] overflow-hidden rounded-[22px] border border-tn-hair bg-[#EAEDE7] shadow-[0_24px_60px_rgba(11,11,11,.10)]">
      <svg viewBox="0 0 400 320" className="absolute inset-0 size-full">
        <rect width="400" height="320" fill="#EAEDE7" />
        <rect x="14" y="18" width="104" height="74" rx="10" fill="#E2E0D8" />
        <rect x="262" y="26" width="118" height="66" rx="10" fill="#E2E0D8" />
        <rect x="18" y="212" width="112" height="86" rx="10" fill="#E2E0D8" />
        <rect x="256" y="204" width="126" height="94" rx="10" fill="#DDE7D6" />
        <path
          d="M0 160H400M132 0L142 320M0 108L400 100M248 0L256 320M0 244L400 238"
          stroke="white"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path d="M0 160H400" stroke="#F7CDB9" strokeWidth="14" />
      </svg>
      <span className="absolute left-[15%] top-[19%] text-[9.5px] font-bold tracking-[.05em] text-[#A7A99F]">
        ATLAS
      </span>
      <span className="absolute left-[44%] top-[78%] text-[9.5px] font-bold tracking-[.05em] text-[#A7A99F]">
        FRIENDSHIP
      </span>
      <span className="absolute left-[73%] top-[60%] text-[9.5px] font-bold tracking-[.05em] text-[#A7A99F]">
        OLYMPIA
      </span>
      <span className="absolute left-1/2 top-[54%] inline-flex size-[46px] -translate-x-1/2 -translate-y-full rotate-45 items-center justify-center rounded-[50%_50%_50%_5px] border-2 border-dashed border-tn-red bg-white/70">
        <span className="-rotate-45 font-tn-mono text-[17px] font-bold text-tn-red">
          ?
        </span>
      </span>
      <Legend>NO SHOP AT THIS ADDRESS</Legend>
    </div>
  );
}

function PulseGraphic() {
  return (
    <div className="relative flex aspect-[4/3.2] items-center justify-center overflow-hidden rounded-[22px] border border-tn-hair bg-tn-ink shadow-[0_24px_60px_rgba(11,11,11,.16)]">
      <Legend dark>SIGNAL LOST</Legend>
      <svg viewBox="0 0 320 120" className="h-[70px] w-[78%]">
        <path
          d="M0 60H70L100 22L118 98L134 60H152"
          stroke="#B8741F"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M152 60H320"
          stroke="white"
          strokeOpacity=".16"
          strokeWidth="3"
          strokeDasharray="7 8"
        />
        <circle cx="152" cy="60" r="5" fill="#B8741F" />
      </svg>
    </div>
  );
}

export default function NotFound({ kind = "404" }: { kind?: ErrorPageKind }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const copy = COPY[kind];
  function search(event: React.FormEvent) {
    event.preventDefault();
    router.push(
      query.trim()
        ? `/products?q=${encodeURIComponent(query.trim())}`
        : "/products",
    );
  }
  return (
    <div className="relative flex min-h-[80vh] items-center overflow-hidden bg-[radial-gradient(110%_80%_at_88%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_52%),#fff] px-6 py-16 lg:px-7 lg:py-[84px]">
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 lg:grid-cols-[1.04fr_.96fr] lg:gap-14">
        <div>
          <div className="font-tn-mono inline-flex items-center gap-2 rounded-full border border-tn-hair bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-tn-ink2 shadow-sm">
            <span
              className="size-[7px] rounded-full"
              style={{ backgroundColor: copy.dot }}
            />
            {copy.chip}
          </div>
          <h1 className="mt-6 text-[42px] font-extrabold leading-none tracking-[-.04em] text-tn-ink sm:text-[54px]">
            {copy.title[0]}
            <br />
            <span className="text-tn-red">{copy.title[1]}</span>
          </h1>
          <p className="mt-5 max-w-[470px] text-[17.5px] font-medium leading-[1.55] text-tn-mute">
            {copy.body}
          </p>
          {kind === "500" ? (
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-tn-red inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
              >
                <Icon name="pulse" size={16} />
                Try again
              </button>
              <Link
                href="/help"
                className="inline-flex items-center rounded-full border border-tn-hair px-5 py-3 text-sm font-bold"
              >
                Contact support
              </Link>
            </div>
          ) : (
            <form
              onSubmit={search}
              className="mt-8 flex h-14 max-w-[470px] overflow-hidden rounded-[15px] border border-tn-hair bg-white shadow-[0_10px_30px_rgba(11,11,11,.06)]"
            >
              <span className="inline-flex items-center pl-[18px]">
                <Icon name="search" size={20} className="text-tn-mute" />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search verified shops & products"
                aria-label="Search listings"
                className="min-w-0 flex-1 bg-transparent px-3.5 outline-none"
              />
              <button
                type="submit"
                className="bg-tn-red px-[22px] text-sm font-bold text-white"
              >
                Search
              </button>
            </form>
          )}
          <div className="mt-[22px] grid max-w-[470px] grid-cols-2 gap-[11px]">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-0 items-center gap-3 rounded-[14px] border border-tn-hair bg-white px-4 py-3.5 hover:shadow-md"
              >
                <span className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-tn-paper">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-extrabold">
                    {item.label}
                  </span>
                  <span className="text-[11.5px] text-tn-mute">{item.sub}</span>
                </span>
                <Icon name="arrow" size={15} className="ml-auto text-tn-red" />
              </Link>
            ))}
          </div>
          <p className="font-tn-mono mt-[22px] flex items-center gap-2 text-xs text-tn-mute">
            <Icon name="tg" size={14} className="text-[#229ED9]" />
            Followed a broken link?{" "}
            <Link href="/help" className="font-bold text-tn-red">
              Tell us where
            </Link>
          </p>
        </div>
        <div>{kind === "404" ? <MapGraphic /> : <PulseGraphic />}</div>
      </div>
    </div>
  );
}
