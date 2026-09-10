"use client";

import React, { useState } from "react";
import MainSection from "./main-section";
import type { Shop, Product, Paginated } from "@/lib/types";

type TabId = "listings" | "about" | "policies" | "reviews";

export function TabsBar({
  shop,
  initialProducts,
}: {
  shop: Shop;
  initialProducts?: Paginated<Product> | null;
}) {
  const [tab, setTab] = useState<TabId>("listings");

  const listingsCount = initialProducts?.count ?? 0;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "listings", label: "Listings", count: listingsCount },
    { id: "about", label: "About" },
    { id: "policies", label: "Policies" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <>
      <div className="border-tn-hair2 sticky top-[68px] z-20 -mx-6 mt-8 border-b bg-white/85 px-6 backdrop-blur-md lg:-mx-7 lg:px-7">
        <div className="flex gap-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex cursor-pointer items-center gap-1.5 border-b-[2.5px] px-4 py-3.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-tn-red text-tn-ink font-extrabold"
                    : "text-tn-mute hover:text-tn-ink border-transparent"
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`font-tn-mono text-xs ${
                      active ? "text-tn-mute" : "text-neutral-300"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <MainSection tab={tab} shop={shop} initialProducts={initialProducts} />
    </>
  );
}

export default TabsBar;