const redFlags = [
  {
    title: "No verified badge",
    description: "If a shop or listing is not verified, treat it with caution. It hasn&apos;t passed our verification.",
  },
  {
    title: "Wants a deposit first",
    description: "No verified shop will ask you to send money via mobile transfer or otherwise before you arrive and inspect.",
  },
  {
    title: "Price is far below market",
    description: "A deal that&apos;s wildly cheaper than every other shop is the oldest trick there is. Compare before you commit.",
  },
  {
    title: "Pushes to meet offsite",
    description: "Insisting on meeting away from the shop, or moving the chat off Telegram to a personal account, is a red flag.",
  },
  {
    title: "Rushes or pressures you",
    description: "“Someone is coming, pay now to hold it.” Real shops let you take your time to inspect.",
  },
  {
    title: "Refuses a receipt",
    description: "Any hesitation to put the shop name, item, and date in writing means walk away.",
  },
] as const;

export function RedFlagsSection() {
  return (
    <section className="rounded-[30px] bg-[#fcefe9] p-5 md:p-8 lg:p-10">
      <div className="mb-6 max-w-xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-tn-red">Red flags</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-tn-ink md:text-5xl">
          If you see any of these, stop and reconsider.
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {redFlags.map((flag) => (
          <div key={flag.title} className="flex items-start gap-3 rounded-2xl border border-[#f4d3c5] bg-white/80 p-4">
            <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-tn-red text-[10px] font-black text-white">
              !
            </span>
            <div>
              <p className="text-md font-bold leading-6 text-tn-ink">{flag.title}</p>
              <p className="text-sm leading-5 text-zinc-500">{flag.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
