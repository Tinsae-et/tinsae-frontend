import React from "react";
import Link from "next/link";
import { Icon, IconName } from "@/components/tinsae/icon";

type Item = {
  icon: IconName;
  title: string;
  description: string;
};

const UNLOCKS: Item[] = [
  {
    icon: "search",
    title: "Higher in search",
    description: "Verified shops rank above unverified",
  },
  {
    icon: "heart",
    title: "More buyer trust",
    description: "The badge is the #1 thing buyers look for",
  },
  {
    icon: "bolt",
    title: "Priority support",
    description: "Faster help and featured-listing eligibility",
  },
];

export default function WhyVerification() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
      <h3 className="text-sm font-semibold text-neutral-900">
        What verification unlocks
      </h3>

      <div className="mt-4 space-y-4">
        {UNLOCKS.map(({ icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Icon name={icon} className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-800">
                {title}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                {description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-neutral-100">
        <Link
          href="/trust-and-safety"
          className="group flex items-center justify-between text-xs font-semibold text-neutral-700 hover:text-emerald-700 transition-colors"
        >
          <span>What verification does &amp; does not mean</span>
          <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">
            &rarr;
          </span>
        </Link>
        <p className="mt-1 text-[11px] text-neutral-400 leading-normal">
          Learn our verification criteria, security protocols, and merchant guidelines.
        </p>
      </div>
    </div>
  );
}