"use client";

import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

export function GuidedFirstRun({
  shopName,
  basePath = "/shop/dashboard",
}: {
  shopName: string;
  basePath?: string;
}) {
  return (
    <div className="rounded-3xl border border-tn-hair bg-white p-6 sm:p-8 shadow-sm">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-tn-hair">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tn-green-soft text-[#157049] text-xs font-bold mb-3">
            <Icon name="check" size={12} strokeWidth={3} />
            <span>Shop registered & active</span>
          </div>
          <h2 className="text-2xl font-extrabold text-tn-ink tracking-tight">
            Welcome to Tinsae, {shopName || "merchant"}!
          </h2>
          <p className="text-sm text-tn-mute mt-1.5 max-w-[540px] leading-relaxed">
            Your store is live. Start adding products so local buyers in your city can discover your stock and contact you directly.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Pill
            kind="solid"
            size="md"
            icon="plus"
            href={`${basePath}/listings/new`}
          >
            Add your first product
          </Pill>
          <Pill
            kind="outline"
            size="md"
            icon="tg"
            href="https://t.me/TinsaeStockBot"
            className="text-tn-telegram hover:text-tn-telegram"
          >
            Connect Telegram
          </Pill>

        </div>
      </div>

      {/* "What happens next" section */}
      <div className="pt-6">
        <div className="flex items-center gap-2 text-xs font-extrabold text-tn-ink uppercase tracking-wider mb-4">
          <Icon name="clock" size={14} className="text-tn-red" />
          <span>What happens next</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-tn-hair bg-tn-paper p-4 flex flex-col justify-between">
            <div>
              <div className="size-8 rounded-xl bg-white border border-tn-hair flex items-center justify-center font-bold text-xs text-tn-ink mb-3 shadow-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-tn-ink">List your stock</h3>
              <p className="text-xs text-tn-mute mt-1.5 leading-relaxed">
                Add an item with title, photos, and price in ETB. Your product appears in buyer search immediately.
              </p>
            </div>
            <Link
              href={`${basePath}/listings/new`}
              className="text-xs font-bold text-tn-red hover:underline mt-4 inline-flex items-center gap-1"
            >
              Add product →
            </Link>
          </div>

          <div className="rounded-2xl border border-tn-hair bg-tn-paper p-4 flex flex-col justify-between">
            <div>
              <div className="size-8 rounded-xl bg-white border border-tn-hair flex items-center justify-center font-bold text-xs text-tn-ink mb-3 shadow-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-tn-ink">Daily 1-tap freshness</h3>
              <p className="text-xs text-tn-mute mt-1.5 leading-relaxed">
                Confirm your stock is still available every morning. Only confirmed, fresh products stay visible to buyers.
              </p>
            </div>
            <span className="text-xs font-semibold text-tn-mute mt-4">
              Via web or @TinsaeStockBot
            </span>
          </div>

          <div className="rounded-2xl border border-tn-hair bg-tn-paper p-4 flex flex-col justify-between">
            <div>
              <div className="size-8 rounded-xl bg-white border border-tn-hair flex items-center justify-center font-bold text-xs text-tn-ink mb-3 shadow-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-tn-ink">Get verified</h3>
              <p className="text-xs text-tn-mute mt-1.5 leading-relaxed">
                Upload your business registration to get the verified badge and build trust with shoppers across Addis Ababa.
              </p>
            </div>
            <Link
              href="/shop/dashboard/get-verified"
              className="text-xs font-bold text-tn-red hover:underline mt-4 inline-flex items-center gap-1"
            >
              Request verification →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
