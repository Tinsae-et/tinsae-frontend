"use client"
import React, { useState } from 'react';
import MainSection from './main-section';

type TabId = "listings" | "about" | "policies" | "reviews";
type Tab = {
  id: TabId;
  label: string;
  count?: number;
}
const TABS: Tab[] = [
  { id: "listings", label: "Listings", count: 142 },
  { id: "about", label: "About" },
  { id: "policies", label: "Policies" },
  { id: "reviews", label: "Reviews", count: 296 },
];


function TabsBar() {
    const [tab, setTab] = useState<TabId>("listings");
    return (
        <>
            <div className="mt-8 flex gap-8 border-b border-gray-200">
                {TABS.map((t) => {
                    const active = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 pb-3 text-sm font-semibold px-3 cursor-pointer transition-colors ${active
                                    ? "border-b-2 border-orange-600 text-neutral-900"
                                    : "border-b-2 border-transparent text-neutral-400 hover:text-neutral-600"
                                }`}
                        >
                            {t.label}
                            {t.count !== undefined && (
                                <span
                                    className={active ? "text-neutral-400" : "text-neutral-300"}
                                >
                                    {t.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            <MainSection tab={tab} />
        </>
    )
}

export default TabsBar