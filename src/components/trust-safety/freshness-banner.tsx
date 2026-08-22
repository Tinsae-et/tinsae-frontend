const freshnessStatus = [
  {
    tone: "bg-[#8adec6]",
    label: "In stock",
    meta: "Confirmed within 6 hours",
    note: "Buy with confidence",
  },
  {
    tone: "bg-[#e1b56a]",
    label: "Aging",
    meta: "6 to 24 hours ago",
    note: "Worth a quick message first",
  },
  {
    tone: "bg-[#dfe3e8]",
    label: "Hidden",
    meta: "Over a day with no reply",
    note: "Tinsae stops showing it",
  },
] as const;

export function FreshnessBanner() {
  return (
    <section className="overflow-hidden rounded-[30px] bg-[#0d1114] px-5 py-7 md:px-8 md:py-9 lg:px-10 lg:py-10">
      <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-[660px]">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-[#8adec6]">Beyond the badge</p>
          <h2 className="text-[2rem] font-black leading-[0.92] tracking-[-0.065em] text-white md:text-[3rem]">
            Verified is who. Fresh is
            <span className="mt-2 block text-[#8adec6]">when.</span>
          </h2>

          <p className="mt-6 max-w-[620px] text-lg leading-8 text-zinc-300">
            A verified shop can still sell out. That&apos;s why every listing carries a freshness dot — the shop&apos;s own daily
            confirmation that the item is still on the shelf at that price.
          </p>
        </div>

        <div className="w-full max-w-[560px] justify-self-end space-y-4">
          {freshnessStatus.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-[#1b2024] px-4 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <span className={`inline-flex size-5 shrink-0 rounded-full ${item.tone}`} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[1.05rem] font-bold tracking-[-0.04em] text-white">
                  <span>{item.label}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-300">{item.meta}</span>
                </div>
                <p className="mt-1 text-base text-zinc-400">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
