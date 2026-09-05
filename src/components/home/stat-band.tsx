// Design block 10. All four figures are the design deck's demo copy — the
// backend doesn't expose confirmation-rate or response-time aggregates yet,
// and per the decision they stay static until it does.

import { ShopMetrics } from "@/lib/types";

export async function StatBand({statCounts}:{statCounts: ShopMetrics}) {
  
  const STATS: [string, string][] = [
    [`${Number(statCounts.total_products).toLocaleString()}`, "listings live today"],
    [`${Number(statCounts.verified_shops).toLocaleString()}`, "verified shops in Bole"],
    ["96%", "reconfirmed within 24h"],
    ["~3.4h", "average shop response"],
  ];
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-20 lg:px-7">
      <div className="bg-tn-ink relative overflow-hidden rounded-3xl px-7 py-10 sm:px-12 sm:py-13">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -top-16 -right-10 text-[300px] leading-none font-bold text-white/[0.04]"
        >
          ትንሳኤ
        </span>
        <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map(([n, label], i) => (
            <div
              key={label}
              className={i > 0 ? "sm:border-l sm:border-white/15 sm:pl-8 lg:pl-7" : ""}
            >
              <p className="font-tn-mono text-[32px] leading-none font-semibold tracking-[-0.03em] text-white sm:text-[46px]">
                {n}
              </p>
              <p className="mt-2.5 text-[13.5px] font-medium text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
