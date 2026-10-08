import React from "react";

/** Mirrors the settings layout: section nav, then the profile and contact cards. */
export default function ShopSettingsLoading() {
  return (
    <div
      className="w-full flex flex-col lg:flex-row gap-[30px] items-start animate-pulse"
      aria-busy="true"
      aria-label="Loading shop settings"
    >
      <div className="w-full lg:w-[220px] shrink-0 flex flex-row lg:flex-col gap-1 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[42px] w-32 lg:w-full shrink-0 bg-tn-paper rounded-xl" />
        ))}
      </div>

      <div className="flex-1 min-w-0 w-full flex flex-col gap-[18px]">
        {[3, 2].map((fields, card) => (
          <div key={card} className="border border-tn-hair rounded-[18px] bg-white overflow-hidden">
            <div className="px-[22px] pt-[18px] pb-[14px] border-b border-tn-hair2 space-y-2">
              <div className="h-4 w-32 bg-tn-paper rounded" />
              <div className="h-3 w-64 max-w-full bg-tn-paper rounded" />
            </div>
            <div className="px-[22px] py-5 grid sm:grid-cols-2 gap-4">
              {Array.from({ length: fields }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-tn-paper rounded" />
                  <div className="h-12 w-full bg-tn-paper rounded-xl" />
                </div>
              ))}
            </div>
            <div className="px-[22px] py-[14px] border-t border-tn-hair2 bg-tn-paper flex justify-end">
              <div className="h-9 w-32 bg-tn-hair rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
