import { Icon } from "@/components/tinsae/icon";

const faqItems = [
  {
    question: "Does “verified” mean the product is guaranteed?",
    answer:
      "No. Verification confirms the shop is real and the listing has been checked recently. It does not replace your inspection before payment.",
    open: true,
  },
  {
    question: "How often is stock re-checked?",
    answer:
      "Shops re-confirm listings through Telegram each day, and the freshness dot shows how recent the confirmation is before you buy.",
  },
  {
    question: "What happens if a shop is confirmed wrong?",
    answer:
      "We flag the listing, pause its freshness status, and users can report the issue so the next buyer is protected.",
  },
  {
    question: "Is it safe to buy without a middleman?",
    answer:
      "Yes. Tinsae does not hold funds or process payments. You meet at the shop, inspect the item, and pay in person.",
  },
  {
    question: "How do I report a problem?",
    answer:
      "Use the report button on the listing, message the support channel, or tell us via the Telegram contact on the site.",
  },
] as const;

export function FAQSection() {
  return (
    <section id="faq" className="pt-5">
      <div className="mb-6 text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-tn-red">Questions</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-tn-ink md:text-5xl">Trust, answered.</h2>
      </div>

      <div className="mx-auto max-w-4xl space-y-3">
        {faqItems.map((item) => (
          <details key={item.question} className="group rounded-[20px] border border-tn-hair bg-white px-5 py-4" open={Boolean(item.open)}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-tn-ink">
              {item.question}
              <span className="inline-flex size-7 items-center justify-center rounded-full border border-tn-hair bg-tn-paper text-zinc-600">
                <Icon name="plus" size={14} />
              </span>
            </summary>
            <p className="pt-4 text-sm leading-7 text-zinc-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
