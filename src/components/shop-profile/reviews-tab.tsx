import React from "react";
import { Icon } from "@/components/tinsae/icon";
import type { Shop } from "@/lib/types";

// The API has no reviews yet. The tab shows the rating breakdown at zero and an
// empty state rather than invented ratings; wire real data in here once the
// backend serves it.
const STARS = [5, 4, 3, 2, 1] as const;

function StarRow({ filled, size = 14 }: { filled: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon
          key={i}
          name="star"
          size={size}
          className={i < filled ? "text-tn-red" : "text-tn-hair"}
        />
      ))}
    </div>
  );
}

export function ReviewsTab({ shop }: { shop: Shop }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-tn-ink text-[26px] font-extrabold tracking-[-0.025em]">
          Reviews <span className="text-tn-mute font-semibold">0</span>
        </h2>
        <p className="text-tn-mute mt-1 text-[13px]">
          Ratings from buyers who completed a purchase with {shop.name}.
        </p>
      </div>

      <div className="border-tn-hair grid grid-cols-1 gap-6 rounded-2xl border bg-white p-6 sm:grid-cols-[180px_1fr] sm:gap-8">
        <div className="sm:border-tn-hair2 sm:border-r sm:pr-8">
          <div className="font-tn-mono text-tn-ink text-[44px] leading-none font-semibold tracking-tight">
            —
          </div>
          <div className="mt-3">
            <StarRow filled={0} size={16} />
          </div>
          <p className="text-tn-mute mt-2 text-xs">No ratings yet</p>
        </div>

        <div className="space-y-2">
          {STARS.map((s) => (
            <div key={s} className="flex items-center gap-3 text-xs">
              <span className="text-tn-ink2 font-tn-mono w-3 text-right">{s}</span>
              <Icon name="star" size={12} className="text-tn-mute" />
              <div className="bg-tn-hair2 h-2 flex-1 overflow-hidden rounded-full">
                <div className="bg-tn-red h-full rounded-full" style={{ width: "0%" }} />
              </div>
              <span className="text-tn-mute font-tn-mono w-8 text-right">0</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-tn-hair rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
        <div className="bg-tn-paper text-tn-mute mx-auto flex size-12 items-center justify-center rounded-2xl">
          <Icon name="msg" size={22} />
        </div>
        <h3 className="text-tn-ink mt-4 text-base font-extrabold">No reviews yet</h3>
        <p className="text-tn-mute mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed">
          Reviews will appear here once buyers who bought from {shop.name} rate their
          experience.
        </p>
      </div>
    </div>
  );
}

export default ReviewsTab;
