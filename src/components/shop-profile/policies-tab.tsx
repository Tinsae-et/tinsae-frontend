import React from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/tinsae/icon";
import type { Shop } from "@/lib/types";

// Protections that hold for every shop on Tinsae, whatever the shop's own terms.
const PLATFORM_PROTECTIONS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "pulse",
    title: "Daily stock confirmation",
    body: "The shop re-confirms its products are still in stock. Products left unconfirmed too long drop out of search.",
  },
  {
    icon: "eye",
    title: "Inspect before you pay",
    body: "Every sale happens in person. Check the item, the box and the serial number before handing over money.",
  },
  {
    icon: "tag",
    title: "Direct shop pricing",
    body: "Prices come from the shop itself. Tinsae adds no broker or buyer fees.",
  },
];

export function PoliciesTab({ shop }: { shop: Shop }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-tn-ink text-[26px] font-extrabold tracking-[-0.025em]">Policies</h2>
        <p className="text-tn-mute mt-1 text-[13px]">
          What Tinsae guarantees when you buy from {shop.name}.
        </p>
      </div>

      <div className="border-tn-hair rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-2.5">
          <div className="bg-tn-green-soft text-tn-green flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Icon name="shield" size={16} />
          </div>
          <div>
            <p className="text-tn-ink text-sm font-extrabold tracking-tight">
              Tinsae buyer protection
            </p>
            <p className="text-tn-mute text-xs">Applies to every shop on Tinsae</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLATFORM_PROTECTIONS.map((p) => (
            <div key={p.title} className="bg-tn-paper rounded-xl p-4">
              <Icon name={p.icon} size={18} className="text-tn-green" />
              <p className="text-tn-ink mt-2.5 text-[13.5px] font-extrabold">{p.title}</p>
              <p className="text-tn-ink2 mt-1 text-[12.5px] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="text-tn-mute mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] font-semibold">
          <Link href="/trust-and-safety" className="hover:text-tn-ink inline-flex items-center gap-1">
            Trust &amp; safety <Icon name="arrow" size={12} />
          </Link>
          <Link href="/returns" className="hover:text-tn-ink inline-flex items-center gap-1">
            Returns on Tinsae <Icon name="arrow" size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PoliciesTab;
