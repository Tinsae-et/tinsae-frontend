const STEPS: [string, string, string][] = [
  ["01", "Search the product", "Type what you want. We show every verified shop carrying it, with live prices."],
  ["02", "Check the freshness", "Each listing shows when the shop last confirmed it in stock, so you can see how current the price is."],
  ["03", "Contact on Telegram", "Reach the shop directly, ask questions, agree on a price and a time to come by."],
  ["04", "Visit and pay in person", "Walk in, inspect the item, complete the purchase. Tinsae stays out of the money."],
];

export function HowItWorks() {
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-tn-red mb-3.5 text-[13px] font-bold tracking-[0.10em] uppercase">
          How it works
        </p>
        <h2 className="text-tn-ink text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[44px]">
          From search to shop floor in four steps.
        </h2>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
        {STEPS.map(([n, title, body]) => (
          <div key={n}>
            <p className="font-tn-mono text-tn-red mb-3.5 text-sm font-semibold">{n}</p>
            <div className="bg-tn-hair relative mb-4 h-px">
              <span className="bg-tn-red absolute top-[-3px] left-0 size-[7px] rounded-full" />
            </div>
            <h3 className="text-tn-ink mb-2 text-[18px] font-extrabold tracking-tight">{title}</h3>
            <p className="text-tn-mute text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
