import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

export function ShopBand() {
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-20">
      <div className="bg-tn-paper border-tn-hair grid items-center gap-8 rounded-3xl border px-6 py-10 sm:px-11 lg:grid-cols-[1.1fr_0.9fr] lg:gap-11 lg:py-12">
        <div>
          <span className="border-tn-hair text-tn-ink2 mb-4 inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[12.5px] font-bold">
            <Icon name="tg" size={14} className="text-tn-telegram" />
            For shop owners
          </span>
          <h2 className="text-tn-ink text-[28px] leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-[40px]">
            Be the shop that&rsquo;s <span className="text-tn-red">provably</span> in stock.
          </h2>
          <p className="text-tn-mute mt-4 max-w-md text-base leading-relaxed">
            Confirm your inventory each morning with one Telegram message. Tinsae routes
            ready-to-buy customers straight to your door — no commission, no payment handling.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Pill kind="solid" size="md" iconAfter="arrow" href="#">
              Open shop dashboard
            </Pill>
            <Pill kind="outline" size="md" href="#">
              How verification works
            </Pill>
          </div>
        </div>

        <div className="bg-tn-ink font-tn-mono rounded-2xl p-5">
          <div className="mb-3.5 flex items-center gap-2 border-b border-white/10 pb-3">
            <Icon name="tg" size={16} className="text-tn-telegram" />
            <span className="text-[13px] font-bold text-white">@TinsaeStockBot</span>
            <span className="bg-tn-green ml-auto rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-white">
              ONLINE
            </span>
          </div>
          <div className="flex flex-col gap-2.5 text-[12.5px]">
            <p className="max-w-[88%] self-start rounded-xl bg-[#262626] px-3 py-2.5 text-white/90">
              Morning! Still have <span className="text-[#FFB69E]">iPhone 15 Pro 256GB</span> in
              stock?
            </p>
            <p className="bg-tn-red max-w-[70%] self-end rounded-xl px-3 py-2.5 text-whitebg-tn-red max-w-[70%] self-end rounded-xl px-3 py-2.5 text-white">
              ✅ Yes · 3 units · 142,500
            </p>
            <p className="text-tn-green max-w-[88%] self-start rounded-xl bg-[#262626] px-3 py-2.5">
              Confirmed 09:14 · pinned to top of search ↑
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
