import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import type { AuthShop } from "@/lib/auth/types";

export default function TelegramSetup({ shop }: { shop: AuthShop }) {
  return (
    <section className="mx-auto max-w-3xl rounded-[20px] border border-tn-hair bg-white p-6 sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tn-telegram-soft text-tn-telegram">
        <Icon name="tg" size={24} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.025em] text-tn-ink">
        Connect your Telegram bot
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-tn-mute">
        Confirm stock from Telegram each day so your listings stay fresh for
        buyers.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["1", "Open Telegram", "Start a chat with @TinsaeStockBot."],
          ["2", "Choose your shop", `Link ${shop.name} when the bot asks.`],
          ["3", "Confirm daily", "Reply once a day to keep stock visible."],
        ].map(([number, title, body]) => (
          <div
            key={number}
            className="rounded-2xl border border-tn-hair bg-tn-paper p-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-tn-hair bg-white text-xs font-bold text-tn-ink">
              {number}
            </span>
            <h2 className="mt-3 text-sm font-bold text-tn-ink">{title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-tn-mute">
              {body}
            </p>
          </div>
        ))}
      </div>
      <a
        href="https://t.me/TinsaeStockBot"
        className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-tn-telegram px-6 text-[15px] font-bold text-white transition hover:brightness-95"
      >
        <Icon name="tg" size={17} />
        Open @TinsaeStockBot
      </a>
      <Link
        href="/dashboard"
        className="ml-3 inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-tn-hair px-5 text-[15px] font-bold text-tn-ink transition hover:border-tn-ink"
      >
        Back to overview
      </Link>
    </section>
  );
}
