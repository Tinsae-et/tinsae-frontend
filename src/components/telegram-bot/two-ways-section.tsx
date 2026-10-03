export function TwoWaysSection() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 sm:mt-28 lg:px-7">
      <div>
        <div className="text-xs font-bold tracking-[0.12em] uppercase text-tn-red">
          TWO WAYS TO ANSWER
        </div>
        <h2 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] text-tn-ink sm:text-[42px]">
          Tap it, or just type it.
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Everything is as listed */}
        <div className="rounded-2xl border border-tn-hair bg-white p-7 shadow-xs sm:p-8">
          <div className="mb-5 font-tn-mono text-[11px] font-bold tracking-[0.12em] text-tn-mute uppercase">
            EVERYTHING IS AS LISTED
          </div>
          <div>
            <div className="inline-flex items-center justify-center rounded-lg bg-[#24A1DE] px-5 py-2.5 text-sm font-semibold text-white shadow-xs">
              All still available
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-tn-mute">
            One tap confirms every listing due this week. This is what most shops do.
          </p>
        </div>

        {/* Card 2: Something has sold */}
        <div className="rounded-2xl border border-tn-hair bg-white p-7 shadow-xs sm:p-8">
          <div className="mb-5 font-tn-mono text-[11px] font-bold tracking-[0.12em] text-tn-mute uppercase">
            SOMETHING HAS SOLD
          </div>
          <div>
            <div className="inline-flex items-center justify-center rounded-lg border border-[#CDEAA9] bg-[#E1FFC7] px-4 py-2 font-tn-mono text-sm font-bold text-tn-ink">
              sold 2 5
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-tn-mute">
            Reply with &ldquo;sold&rdquo; and the item numbers. Those listings come down
            and the rest stay fresh.
          </p>
        </div>
      </div>
    </section>
  );
}
