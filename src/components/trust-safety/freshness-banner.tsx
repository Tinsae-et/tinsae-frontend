import { Eyebrow } from "./section-head";

// Dark-ground variants of the freshness tokens: #B8741F and #9A9A95 are too
// dim on black, so the design shifts them lighter here.
const freshnessStates = [
  {
    color: "#1F8A5B",
    label: "In stock",
    when: "Confirmed within 6 hours",
    note: "Buy with confidence",
  },
  {
    color: "#D89A3C",
    label: "Aging",
    when: "6 to 24 hours ago",
    note: "Worth a quick message first",
  },
  {
    color: "#8C8C86",
    label: "Hidden",
    when: "Over a day with no reply",
    note: "Tinsae stops showing it",
  },
] as const;

export function FreshnessBanner() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <div className="bg-tn-ink relative overflow-hidden rounded-[24px] px-7 py-10 sm:px-10 lg:px-12 lg:py-[52px]">
        <span
          aria-hidden
          className="font-tn-amh pointer-events-none absolute -right-[30px] -bottom-[70px] text-[240px] leading-none font-bold text-white/[0.045]"
        >
          ት
        </span>

        <div className="relative grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div>
            <Eyebrow color="text-[#7FD3AC]">Beyond the badge</Eyebrow>
            <h2 className="text-[30px] leading-[1.07] font-extrabold tracking-[-0.03em] text-white sm:text-[38px]">
              Verified is who. Fresh is <span className="text-[#7FD3AC]">when.</span>
            </h2>
            <p className="mt-[18px] max-w-[440px] text-base leading-[1.6] text-white/[0.66]">
              A verified shop can still sell out. That&rsquo;s why every listing carries a freshness
              dot &mdash; the shop&rsquo;s own daily confirmation that the item is still on the shelf
              at that price.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {freshnessStates.map((state) => (
              <div
                key={state.label}
                className="flex items-center gap-4 rounded-[14px] border border-white/[0.09] bg-white/[0.06] px-[18px] py-4"
              >
                <span
                  className="size-3.5 shrink-0 rounded-full"
                  style={{
                    background: state.color,
                    boxShadow: `0 0 0 5px ${state.color}26`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-extrabold text-white">
                    {state.label}{" "}
                    <span className="font-tn-mono text-[12.5px] font-medium text-white/50">
                      &middot; {state.when}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[13px] text-white/60">{state.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
