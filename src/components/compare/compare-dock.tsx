"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { useCompare } from "@/hooks/use-compare";

export function CompareDock() {
  const pathname = usePathname();
  const { slugs, count, maxItems, clearCompare } = useCompare();

  // Do not show dock on the /compare page, messages page, or if no items are selected
  if (count === 0 || pathname === "/compare" || pathname?.startsWith("/messages")) return null;

  return (
    <div
      aria-label="Floating compare bar"
      className="animate-in slide-in-from-bottom-6 fixed bottom-6 left-1/2 z-40 -translate-x-1/2 px-4"
    >
      <div className="bg-tn-ink text-white flex items-center gap-3.5 rounded-full py-2 pr-2.5 pl-5 shadow-[0_16px_40px_rgba(11,11,11,0.35)]">
        <div className="flex items-center gap-2">
          <div className="bg-tn-red flex size-7 items-center justify-center rounded-full text-white">
            <Icon name="sliders" size={14} />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Compare ({count}/{maxItems})
          </span>
        </div>

        <div className="bg-white/20 h-4 w-px" />

        <div className="flex items-center gap-1.5">
          <Link
            href={`/compare?items=${slugs.join(",")}`}
            className="bg-white text-tn-ink hover:bg-tn-paper inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-extrabold shadow-sm transition-all hover:scale-105"
          >
            <span>Compare now</span>
            <Icon name="arrow" size={12} />
          </Link>

          <button
            type="button"
            onClick={clearCompare}
            aria-label="Clear all compared products"
            className="hover:bg-white/15 text-white/70 hover:text-white inline-flex size-8 items-center justify-center rounded-full transition-colors"
            title="Clear all"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
