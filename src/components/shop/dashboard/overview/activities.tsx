"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import type { ShopProduct, TelegramState } from "@/lib/types";
import { freshness } from "@/lib/format";
import { Pill } from "@/components/tinsae/pill";
import { confirmSelectedFreshness, getTelegramState } from "@/lib/api/client";

/**
 * The weekly stock check-in.
 *
 * Shows real confirmation counts and live connection status from the Telegram bot.
 */
export function DailyStockCheckIn({
  products,
  shopSlug,
  telegramState,
  onProductsUpdated,
}: {
  products: ShopProduct[];
  shopSlug?: string;
  telegramState?: TelegramState | null;
  onProductsUpdated?: () => void;
}) {
  const [fetchedState, setFetchedState] = useState<TelegramState | null>(null);

  useEffect(() => {
    if (telegramState !== undefined || !shopSlug) return;
    getTelegramState(shopSlug)
      .then(setFetchedState)
      .catch(() => {});
  }, [shopSlug, telegramState]);

  const state = telegramState !== undefined ? telegramState : fetchedState;
  const [confirming, setConfirming] = useState(false);

  const active = products.filter((p) => p.is_available);
  const confirmed = active.filter(
    (p) => freshness(p.last_confirmed_at, p.confirmation_status).tone === "fresh",
  ).length;
  const needsAttention = active.length - confirmed;

  const isConnected = state?.status === "connected";
  const isBlocked = state?.status === "blocked";

  const handleConfirmAll = async () => {
    if (!shopSlug || needsAttention <= 0 || confirming) return;
    const slugsToConfirm = active
      .filter((p) => freshness(p.last_confirmed_at, p.confirmation_status).tone !== "fresh")
      .map((p) => p.slug);
    if (slugsToConfirm.length === 0) return;

    setConfirming(true);
    try {
      await confirmSelectedFreshness(shopSlug, slugsToConfirm);
      onProductsUpdated?.();
    } catch {
      // Keep state on failure
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="bg-tn-ink rounded-[18px] p-[22px] flex flex-col justify-between gap-5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="bg-tn-telegram size-10 rounded-[11px] flex items-center justify-center text-white shrink-0">
            <Icon name="tg" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-[14px] leading-tight">
              Weekly stock check-in
            </span>
            <span className="font-tn-mono text-[11.5px] text-white/65 mt-0.5">
              @tinsae_et_bot
            </span>
          </div>
        </div>
        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1F8A5B]/25 text-[#34D399]">
            <Icon name="check" size={12} strokeWidth={2.5} />
            Connected
          </span>
        ) : isBlocked ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
            Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/70">
            Not connected
          </span>
        )}
      </div>

      <div className="bg-white/6 rounded-[13px] px-[15px] py-[13px] font-tn-mono text-[12.5px] leading-[1.7] text-white/85">
        {active.length > 0 ? (
          <>
            <div>
              Confirmed{" "}
              <strong className="font-bold text-white">
                {confirmed} of {active.length} products
              </strong>
              {needsAttention > 0 ? ` · ${needsAttention} need attention` : ""}
            </div>
            <div className="text-white/60">
              {isConnected
                ? "Weekly digests sent to your linked Telegram chat."
                : isBlocked
                  ? "Bot is blocked. Open Telegram to unblock and restart."
                  : "Weekly check-ins start once the bot is connected."}
            </div>
          </>
        ) : (
          <div className="text-white/60">
            No active products to confirm yet.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Pill
          kind="light"
          size="sm"
          icon={confirming ? undefined : "check"}
          disabled={confirming || needsAttention === 0}
          onClick={handleConfirmAll}
        >
          {confirming
            ? "Confirming…"
            : needsAttention === 0
              ? "All fresh"
              : "Confirm all now"}
        </Pill>
        <Pill
          kind="ghost"
          size="sm"
          href="/shop/dashboard/telegram"
          className="border-white/25 text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          {isConnected ? "Manage bot" : "Connect the bot"}
        </Pill>
      </div>
    </div>
  );
}


/**
 * Recent activity.
 *
 * There is no activity endpoint — not a missing field, no feed exists at all
 * (docs/backend-requirements.md). This used to render six fixed rows naming
 * buyers who do not exist ("Yonas T. asked about iPhone 15 Pro"), identically
 * for every shop. Inventing a buyer is worse than inventing a number: a
 * merchant could go looking for that conversation.
 *
 * The card stays so the two-up layout holds and the section keeps its place;
 * what it says is that the feed is not live yet.
 */
export function RecentActivities() {
  return (
    <div className="bg-white border border-tn-hair rounded-[18px] px-5 py-[18px] flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-extrabold text-[14.5px] text-tn-ink">Recent activity</h4>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
        <div className="size-11 rounded-[13px] bg-tn-paper flex items-center justify-center">
          <Icon name="pulse" size={18} className="text-tn-mute" />
        </div>
        <p className="text-[13px] font-bold text-tn-ink">No activity yet</p>
        <p className="text-xs text-tn-mute max-w-[240px]">
          Buyer messages, bot confirmations and your own edits will appear here.
        </p>
      </div>
    </div>
  );
}
