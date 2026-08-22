"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/tinsae/icon";

type QuickLinkItem = {
  href: string;
  label: string;
  icon: IconName;
};

const QUICK_LINKS: QuickLinkItem[] = [
  { href: "/", label: "Back to home", icon: "building" },
  { href: "/products", label: "Browse listings", icon: "search" },
  { href: "/products?verified_only=1", label: "Verified shops", icon: "shield" },
  { href: "/how-it-works", label: "How it works", icon: "bolt" },
];

function QuickLink({ item }: { item: QuickLinkItem }) {
  return (
    <Link
      href={item.href}
      className="flex min-w-[200px] items-center gap-3 rounded-[14px] border border-tn-hair bg-white p-3.5 shadow-sm transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-[#E0DDD4] hover:shadow-[0_8px_20px_rgba(11,11,11,0.06)]"
    >
      <span className="bg-tn-paper inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px]">
        <Icon name={item.icon} size={18} className="text-tn-ink" />
      </span>
      <span className="text-tn-ink text-sm font-extrabold tracking-[-0.01em]">{item.label}</span>
      <Icon name="arrow" size={15} className="text-tn-red ml-auto" />
    </Link>
  );
}

export default function NotFound() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/products?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_55%)] px-6 py-20">
      {/* Background 404 watermark */}
      <div
        aria-hidden
        className="font-tn-amh pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[260px] leading-none font-bold text-tn-red/[0.05] select-none sm:text-[420px] lg:text-[520px]"
      >
        404
      </div>

      <div className="relative z-10 mx-auto max-w-[760px] text-center">
        {/* Status Pill */}
        <div className="font-tn-mono text-tn-ink2 inline-flex items-center gap-2 rounded-full border border-tn-hair bg-white px-3.5 py-1.5 text-[12.5px] font-bold shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
          <span className="size-2 rounded-full bg-tn-stale" />
          LAST CONFIRMED · NEVER
        </div>

        <h1 className="text-tn-ink mt-6 text-[44px] leading-none font-extrabold tracking-[-0.04em] sm:text-[60px] lg:text-[64px]">
          This page is <span className="text-tn-red">out of stock.</span>
        </h1>

        <p className="text-tn-mute mx-auto mt-5 max-w-[520px] text-base leading-relaxed font-medium sm:text-[18px]">
          The listing you&apos;re looking for may have sold, moved, or never existed. Let&apos;s get
          you back to something that&apos;s confirmed in stock.
        </p>

        {/* Search bar */}
        <form
          onSubmit={onSearch}
          className="border-tn-hair mx-auto mt-8 flex h-14 max-w-[520px] items-center overflow-hidden rounded-2xl border bg-white shadow-[0_10px_30px_rgba(11,11,11,0.06)]"
        >
          <span className="pl-4.5">
            <Icon name="search" size={20} className="text-tn-mute" />
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search verified shops & products"
            aria-label="Search listings"
            className="text-tn-ink placeholder:text-tn-mute h-full flex-1 bg-transparent px-3 text-[15.5px] font-medium outline-none"
          />
          <button
            type="submit"
            className="bg-tn-red hover:bg-tn-red-dark h-full px-6 text-[14.5px] font-bold text-white transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {QUICK_LINKS.map((item) => (
            <QuickLink key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}