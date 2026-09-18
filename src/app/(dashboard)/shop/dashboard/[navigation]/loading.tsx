import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-tn-paper rounded-lg" />
          <div className="h-4 w-72 bg-tn-paper rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-tn-paper rounded-full" />
          <div className="h-9 w-32 bg-tn-paper rounded-full" />
        </div>
      </div>

      {/* Content table skeleton */}
      <div className="rounded-[18px] border border-tn-hair bg-white overflow-hidden">
        <div className="h-14 bg-tn-paper border-b border-tn-hair2 px-6 flex items-center justify-between">
          <div className="h-4 w-32 bg-tn-hair rounded" />
          <div className="h-8 w-40 bg-tn-hair rounded-lg" />
        </div>
        <div className="divide-y divide-tn-hair2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center px-6 py-4 gap-4">
              <div className="size-4 bg-tn-paper rounded" />
              <div className="size-11 bg-tn-paper rounded-[10px]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-tn-paper rounded" />
                <div className="h-3 w-1/4 bg-tn-paper rounded" />
              </div>
              <div className="h-4 w-20 bg-tn-paper rounded" />
              <div className="h-6 w-16 bg-tn-paper rounded-full" />
              <div className="h-8 w-20 bg-tn-paper rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
