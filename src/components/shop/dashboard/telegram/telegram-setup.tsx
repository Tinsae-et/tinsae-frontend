"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { cn } from "@/lib/utils";
import type { AuthShop } from "@/lib/auth/types";
import type { TelegramConnectResult, TelegramState } from "@/lib/types";
import {
  connectTelegram,
  disconnectTelegram,
  getTelegramState,
} from "@/lib/api/client";

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "recently";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffHours = Math.max(0, (Date.now() - date.getTime()) / 36e5);
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return "today";
  const days = Math.floor(diffHours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Telegram Chat Mock Preview ─────────────────────────────────
function TelegramBubble({
  side = "bot",
  time = "9:00",
  buttons,
  children,
}: {
  side?: "bot" | "me";
  time?: string;
  buttons?: string[];
  children: React.ReactNode;
}) {
  const isBot = side === "bot";
  return (
    <div
      className={cn(
        "mb-2.5 flex flex-col",
        isBot ? "items-start" : "items-end",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed shadow-xs",
          isBot
            ? "rounded-tl-xs bg-white text-tn-ink"
            : "rounded-tr-xs bg-[#EEFFDE] text-tn-ink",
        )}
      >
        <div>{children}</div>
        <div className="mt-1 flex items-center justify-end gap-1 font-tn-mono text-[10px] text-tn-mute">
          <span>{time}</span>
          {!isBot && (
            <Icon
              name="check"
              size={11}
              strokeWidth={3}
              className="text-tn-telegram"
            />
          )}
        </div>
      </div>
      {buttons && buttons.length > 0 && (
        <div className="mt-1.5 flex w-[85%] flex-col gap-1.5">
          {buttons.map((btn, i) => (
            <div
              key={i}
              className="rounded-lg bg-white/95 px-3 py-2 text-center text-xs font-bold text-tn-telegram shadow-xs"
            >
              {btn}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TelegramChatPreview({
  shopName,
  status,
  botUsername,
}: {
  shopName: string;
  status: TelegramState["status"];
  botUsername?: string;
}) {
  const isConnected = status === "connected";
  const displayBotHandle = botUsername
    ? `@${botUsername.replace(/^@/, "")}`
    : "@TinsaeStockBot";

  return (
    <aside className="sticky top-6 flex w-full flex-col overflow-hidden rounded-[26px] border border-tn-hair bg-white shadow-xl">
      {/* Telegram header */}
      <div className="flex items-center gap-3 bg-tn-telegram px-4 py-3.5 text-white">
        <span className="flex size-10 items-center justify-center rounded-full bg-white/20">
          <Icon name="tg" size={20} className="text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold">Tinsae Stock Bot</div>
          <div className="text-[11.5px] text-white/80">
            {isConnected ? "online · bot" : "bot"}
          </div>
        </div>
        <Icon name="ellipsis" size={18} className="text-white/80" />
      </div>

      {/* Messages area */}
      <div className="min-h-[380px] bg-gradient-to-b from-[#A8C8DC] to-[#B5D2C4] p-3.5 sm:p-4">
        <div className="mb-3 text-center">
          <span className="rounded-full bg-black/15 px-3 py-0.5 text-[11px] font-semibold text-white">
            Today
          </span>
        </div>

        <TelegramBubble side="me" time="9:01">
          /start
        </TelegramBubble>

        <TelegramBubble side="bot" time="9:01">
          👋 Hi! I&apos;m <b>{displayBotHandle}</b>. I&apos;ll help keep your listings
          fresh on Tinsae with a one-tap weekly check-in.
        </TelegramBubble>

        {isConnected ? (
          <>
            <TelegramBubble side="bot" time="9:02">
              ✅ Connected to <b>{shopName}</b>. Your shop is verified and linked.
            </TelegramBubble>
            <TelegramBubble
              side="bot"
              time="9:05"
              buttons={[
                "✅ All still available",
                "✏️ Review listings one by one",
              ]}
            >
              ☀️ Good morning! Weekly check-in: are your active listings still in stock?
            </TelegramBubble>
            <TelegramBubble side="me" time="9:06">
              ✅ All still available
            </TelegramBubble>
            <TelegramBubble side="bot" time="9:06">
              Perfect — all listings re-confirmed and marked fresh for buyers.
              See you next week! 🎉
            </TelegramBubble>
          </>
        ) : (
          <TelegramBubble side="bot" time="9:02">
            Send your shop link code (e.g. <code>/link TIN-...</code>) to link your shop.
          </TelegramBubble>
        )}
      </div>
    </aside>
  );
}

// ── Main Component ─────────────────────────────────────────────
type TelegramSetupProps = {
  shop: AuthShop;
  initialState?: TelegramState;
};

export default function TelegramSetup({
  shop,
  initialState,
}: TelegramSetupProps) {
  const [state, setState] = useState<TelegramState>(
    initialState ?? { status: "idle", linked_at: null, blocked_at: null },
  );
  const [connectResult, setConnectResult] =
    useState<TelegramConnectResult | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  // Initial load if no initial state was passed from SSR
  useEffect(() => {
    if (!initialState) {
      getTelegramState(shop.slug)
        .then(setState)
        .catch(() => {
          // Keep fallback state
        });
    }
  }, [initialState, shop.slug]);

  // Handle polling when connectResult is active and status is idle
  const startPolling = useCallback(() => {
    clearPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const next = await getTelegramState(shop.slug);
        if (next.status !== "idle") {
          setState(next);
          clearPolling();
        }
      } catch {
        // Ignore transient poll errors
      }
    }, 2500);
  }, [clearPolling, shop.slug]);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const res = await connectTelegram(shop.slug);
      setConnectResult(res);
      startPolling();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate Telegram link. Please try again.",
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualCheck = async () => {
    setError(null);
    try {
      const next = await getTelegramState(shop.slug);
      setState(next);
      if (next.status !== "idle") {
        clearPolling();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed checking connection status.",
      );
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setIsDisconnecting(true);
    try {
      await disconnectTelegram(shop.slug);
      setState({ status: "idle", linked_at: null, blocked_at: null });
      setConnectResult(null);
      setConfirmDisconnect(false);
      clearPolling();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to disconnect Telegram bot. Please try again.",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const botHandle =
    connectResult?.bot_username || "TinsaeStockBot";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]">
        {/* Left Column: Flow & Controls */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tn-telegram-soft px-3 py-1 text-xs font-extrabold text-tn-telegram">
              <Icon name="tg" size={14} className="text-tn-telegram" />
              Telegram Bot
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-tn-ink sm:text-3xl">
              Keep your listings fresh
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-tn-mute sm:text-base">
              The bot sends a weekly digest so you can verify stock in a single
              tap. Fresh listings rank higher for buyers across Ethiopia.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-tn-red/20 bg-tn-red-soft p-4 text-sm text-tn-red">
              <Icon name="close" size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* STATE: CONNECTED */}
          {state.status === "connected" && (
            <div className="rounded-[22px] border border-tn-hair bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-tn-green-soft text-tn-green">
                  <Icon name="check" size={24} strokeWidth={2.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-extrabold text-tn-ink sm:text-xl">
                      Connected to Telegram
                    </h2>
                    <span className="rounded-full bg-tn-green/10 px-2.5 py-0.5 text-xs font-bold text-tn-green">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-tn-mute">
                    Linked {formatRelativeTime(state.linked_at)} to{" "}
                    <span className="font-bold text-tn-ink">{shop.name}</span>.
                  </p>
                </div>
              </div>

              {/* Cadence Summary Card */}
              <div className="mt-6 rounded-2xl border border-tn-hair bg-tn-paper p-4 text-sm">
                <div className="flex items-center gap-2 font-bold text-tn-ink">
                  <Icon name="clock" size={16} className="text-tn-telegram" />
                  <span>Weekly check-in cadence</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-tn-mute">
                  One message each week on your due date. Tap{" "}
                  <b className="text-tn-ink">✅ All still available</b>, or reply{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-tn-mono text-tn-ink">
                    all
                  </code>{" "}
                  /{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-tn-mono text-tn-ink">
                    sold 2 5
                  </code>
                  .
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-tn-mute">
                  <Icon name="shield" size={13} className="text-tn-mute" />
                  <span>Quiet hours observed: 21:00–07:00 EAT</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Pill
                  kind="outline"
                  size="md"
                  iconAfter="arrow"
                  href="/shop/dashboard/listings"
                >
                  Manage listings
                </Pill>

                {!confirmDisconnect ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDisconnect(true)}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-tn-hair px-5 text-sm font-bold text-tn-mute hover:border-tn-red/40 hover:text-tn-red transition-colors"
                  >
                    Disconnect bot
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border border-tn-red/30 bg-tn-red-soft px-3 py-1.5">
                    <span className="text-xs font-bold text-tn-red">
                      Unlink chat?
                    </span>
                    <button
                      type="button"
                      disabled={isDisconnecting}
                      onClick={handleDisconnect}
                      className="rounded-full bg-tn-red px-3 py-1 text-xs font-bold text-white hover:bg-tn-red-dark transition-colors disabled:opacity-50"
                    >
                      {isDisconnecting ? "Disconnecting…" : "Yes, disconnect"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDisconnect(false)}
                      className="text-xs font-bold text-tn-mute hover:text-tn-ink underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE: BLOCKED */}
          {state.status === "blocked" && (
            <div className="rounded-[22px] border border-tn-warn/30 bg-tn-warn-soft/40 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-tn-warn/20 text-tn-warn">
                  <Icon name="close" size={22} strokeWidth={2.5} />
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-tn-ink sm:text-xl">
                    Telegram bot is blocked
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-tn-ink2">
                    Telegram is disconnected because you blocked the bot. Open
                    Telegram, search{" "}
                    <b className="text-tn-ink">@{botHandle}</b>, and press{" "}
                    <b>Start / Restart</b>. The block clears automatically on
                    the next message.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Pill
                  kind="solid"
                  size="md"
                  onClick={handleManualCheck}
                  className="bg-tn-telegram hover:brightness-95"
                >
                  I&apos;ve unblocked the bot — check connection
                </Pill>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-tn-hair px-5 text-sm font-bold text-tn-mute hover:text-tn-red"
                >
                  {isDisconnecting ? "Unlinking…" : "Reset connection"}
                </button>
              </div>
            </div>
          )}

          {/* STATE: IDLE (UNLINKED) */}
          {state.status === "idle" && (
            <div className="rounded-[22px] border border-tn-hair bg-white p-6 sm:p-8 shadow-xs">
              {!connectResult ? (
                /* Step A: Explanation before clicking connect */
                <div>
                  <div className="grid gap-3.5 sm:grid-cols-3">
                    {[
                      [
                        "1",
                        "Weekly check-in",
                        "One message each week on your due date to confirm listings.",
                      ],
                      [
                        "2",
                        "One-tap answer",
                        "Tap 'All still available' or reply 'sold 2 5'.",
                      ],
                      [
                        "3",
                        "Higher ranking",
                        "Fresh listings appear first when buyers browse.",
                      ],
                    ].map(([number, title, body]) => (
                      <div
                        key={number}
                        className="rounded-2xl border border-tn-hair bg-tn-paper p-4"
                      >
                        <span className="flex size-7 items-center justify-center rounded-xl bg-white font-tn-mono text-xs font-extrabold text-tn-ink shadow-xs">
                          {number}
                        </span>
                        <h3 className="mt-3 text-sm font-bold text-tn-ink">
                          {title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-tn-mute">
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-tn-telegram px-7 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(34,158,217,0.32)] transition hover:brightness-95 disabled:opacity-60"
                    >
                      <Icon name="tg" size={18} className="text-white" />
                      {isConnecting ? "Generating link…" : "Connect Telegram"}
                    </button>
                    <Link
                      href="/shop/dashboard/overview"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-tn-hair px-5 text-sm font-bold text-tn-mute hover:border-tn-ink hover:text-tn-ink transition-colors"
                    >
                      Back to overview
                    </Link>
                  </div>
                </div>
              ) : (
                /* Step B: Code generated, awaiting connection */
                <div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tn-paper font-tn-mono text-xs font-extrabold text-tn-ink">
                        1
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-tn-ink">
                          Open the bot in Telegram
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-tn-mute">
                          Tap the button below, or search @
                          {connectResult.bot_username || "TinsaeStockBot"} in
                          Telegram.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tn-paper font-tn-mono text-xs font-extrabold text-tn-ink">
                        2
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-tn-ink">
                          Press Start
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-tn-mute">
                          Telegram opens the chat — tap <b>Start</b> to link
                          automatically.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tn-paper font-tn-mono text-xs font-extrabold text-tn-ink">
                        3
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-tn-ink">
                          Or confirm with your shop code
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-tn-mute">
                          If you open the bot manually, send{" "}
                          <code>/link {connectResult.code}</code>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shop Code Box */}
                  <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-tn-hair bg-tn-paper/70 p-4 sm:p-5">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-tn-mute">
                        Your Link Code
                      </div>
                      <div className="mt-1 font-tn-mono text-2xl font-bold tracking-wider text-tn-ink sm:text-3xl">
                        {connectResult.code}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCode(connectResult.code)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-tn-hair bg-white px-4 text-xs font-bold text-tn-ink hover:border-tn-ink transition-colors"
                    >
                      <Icon
                        name={copied ? "check" : "box"}
                        size={14}
                        className={copied ? "text-tn-green" : "text-tn-mute"}
                      />
                      {copied ? "Copied!" : "Copy code"}
                    </button>
                  </div>

                  {/* Primary CTA */}
                  <div className="mt-6">
                    {connectResult.deep_link ? (
                      <a
                        href={connectResult.deep_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tn-telegram px-6 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(34,158,217,0.32)] transition hover:brightness-95"
                      >
                        <Icon name="tg" size={19} className="text-white" />
                        Open @{connectResult.bot_username || "TinsaeStockBot"}
                      </a>
                    ) : (
                      <div className="rounded-xl border border-tn-hair bg-tn-paper p-3 text-center text-xs text-tn-mute">
                        Bot deep link unavailable. Open Telegram, search @
                        {connectResult.bot_username || "the bot"}, and send{" "}
                        <code className="font-bold text-tn-ink">
                          /link {connectResult.code}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Polling status & manual check */}
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-tn-hair bg-tn-paper px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-tn-mute">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-tn-telegram opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-tn-telegram" />
                      </span>
                      <span>Waiting for you to start the bot…</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleManualCheck}
                      className="text-xs font-bold text-tn-ink underline hover:text-tn-telegram"
                    >
                      Check now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bot Commands & Shortcuts Reference Card */}
          <BotCommandsReference />
        </div>

        {/* Right Column: Interactive Chat Preview */}
        <div>
          <TelegramChatPreview
            shopName={shop.name}
            status={state.status}
            botUsername={connectResult?.bot_username}
          />
        </div>
      </div>
    </div>
  );
}

// ── Bot Commands Reference Component ───────────────────────────
function BotCommandsReference() {
  const [activeTab, setActiveTab] = useState<"commands" | "replies" | "quicksold" | "rules">("commands");

  return (
    <div className="rounded-[22px] border border-tn-hair bg-white p-6 sm:p-7 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tn-hair pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-tn-telegram/10 text-tn-telegram">
              <Icon name="tg" size={14} />
            </span>
            <h2 className="text-base font-extrabold text-tn-ink">
              Bot Menus & Commands Guide
            </h2>
          </div>
          <p className="mt-1 text-xs text-tn-mute">
            Everything you can do through the Telegram bot with your shop
          </p>
        </div>
        <span className="rounded-full bg-tn-paper px-2.5 py-1 font-tn-mono text-[11px] font-bold text-tn-ink">
          Available in @tinsae_et_bot
        </span>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl bg-tn-paper p-1.5">
        {[
          { id: "commands", label: "Menu & Commands" },
          { id: "replies", label: "Weekly Check-in" },
          { id: "quicksold", label: "Quick Sold Anytime" },
          { id: "rules", label: "Freshness & Rules" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === tab.id
                ? "bg-white text-tn-ink shadow-xs"
                : "text-tn-mute hover:text-tn-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {activeTab === "commands" && (
          <div className="space-y-3">
            <p className="text-xs text-tn-mute">
              These commands are accessible from Telegram&apos;s menu button (<b>☰</b>) or by typing a slash (<b>/</b>):
            </p>
            <div className="divide-y divide-tn-hair rounded-xl border border-tn-hair bg-tn-paper/50">
              {[
                {
                  cmd: "/menu",
                  desc: "Opens the interactive navigation hub with buttons for stock, status, and web dashboard.",
                },
                {
                  cmd: "/myproducts",
                  desc: "View and manage your listings with 1-tap inline buttons (Confirm, Sold, Pause, Resume).",
                },
                {
                  cmd: "/status",
                  desc: "Summary of fresh, due, and hidden items, plus your next check-in schedule.",
                },
                {
                  cmd: "/pause_shop",
                  desc: "Vacation mode: immediately pauses all your listings so buyers don't see outdated stock while you're away.",
                },
                {
                  cmd: "/resume_shop",
                  desc: "Resumes all your paused listings when you return from vacation.",
                },
                {
                  cmd: "/unlink",
                  desc: "Disconnects this Telegram chat from your shop (can be re-linked anytime).",
                },
                {
                  cmd: "/help",
                  desc: "Displays full instructions, command summaries, and reply examples in the chat.",
                },
              ].map((item) => (
                <div key={item.cmd} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3.5">
                  <code className="shrink-0 font-tn-mono text-xs font-bold text-tn-telegram">
                    {item.cmd}
                  </code>
                  <span className="text-xs text-tn-ink">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "replies" && (
          <div className="space-y-4">
            <p className="text-xs text-tn-mute">
              Every 7 days, the bot sends a morning digest listing products due for confirmation. You can reply in 4 convenient ways:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-tn-hair bg-tn-paper/60 p-3.5">
                <div className="flex items-center gap-1.5 font-tn-mono text-xs font-bold text-tn-green">
                  <span>✅</span> All still available
                </div>
                <p className="mt-1 text-xs text-tn-ink">
                  Tap the button or reply <code className="font-bold">all</code>, <code className="font-bold">yes</code>, or <code className="font-bold">ሁሉም</code>. Confirms all due items in one go and resets their freshness timer to 7 days.
                </p>
              </div>

              <div className="rounded-xl border border-tn-hair bg-tn-paper/60 p-3.5">
                <div className="flex items-center gap-1.5 font-tn-mono text-xs font-bold text-tn-red">
                  <span>❌</span> sold 2 5
                </div>
                <p className="mt-1 text-xs text-tn-ink">
                  Reply with the numbers from the list (e.g. <code className="font-bold">sold 2 5</code>). Marks items 2 and 5 out of stock, and confirms the rest are available.
                </p>
              </div>

              <div className="rounded-xl border border-tn-hair bg-tn-paper/60 p-3.5">
                <div className="flex items-center gap-1.5 font-tn-mono text-xs font-bold text-tn-telegram">
                  <span>✏️</span> Check one by one
                </div>
                <p className="mt-1 text-xs text-tn-ink">
                  Tap this button to review each due item individually with 1-tap Available / Sold buttons.
                </p>
              </div>

              <div className="rounded-xl border border-tn-hair bg-tn-paper/60 p-3.5">
                <div className="flex items-center gap-1.5 font-tn-mono text-xs font-bold text-tn-ink">
                  <span>🕒</span> Reminders & Expiry
                </div>
                <p className="mt-1 text-xs text-tn-ink">
                  If unanswered, the bot sends at most one reminder. If unconfirmed after 14 days, the listing is hidden from search until you confirm it.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "quicksold" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-tn-telegram/30 bg-tn-telegram/5 p-4">
              <h3 className="text-xs font-bold text-tn-ink">
                ⚡ Instant Quick Sold with 1-Tap Undo
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-tn-mute">
                You don&apos;t have to wait for the weekly check-in! Whenever you make a sale in your physical store or online, simply send:
              </p>
              <div className="mt-2.5 rounded-lg border border-tn-hair bg-white px-3 py-2 font-tn-mono text-xs font-bold text-tn-ink">
                sold [product name] <span className="font-normal text-tn-mute">(e.g., &quot;sold iPhone 15&quot; or &quot;sold Galaxy S24&quot;)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-tn-ink">
              <div className="flex items-start gap-2">
                <span className="font-bold text-tn-green">✓</span>
                <span>The bot searches your active catalog and marks the matching item sold out immediately.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-tn-green">✓</span>
                <span>The bot sends a confirmation with a 1-tap <b>Undo</b> button in case of accidental entry.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-tn-green">✓</span>
                <span>If multiple products match, the bot asks you to clarify by tapping the exact item.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="font-tn-mono text-xs font-bold text-emerald-800">
                  ≤ 7 days
                </div>
                <div className="mt-1 text-xs font-bold text-emerald-900">
                  Fresh
                </div>
                <p className="mt-0.5 text-[11px] text-emerald-700">
                  Green freshness dot. Ranked highest in buyer search results.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                <div className="font-tn-mono text-xs font-bold text-amber-800">
                  7 – 14 days
                </div>
                <div className="mt-1 text-xs font-bold text-amber-900">
                  Due for check-in
                </div>
                <p className="mt-0.5 text-[11px] text-amber-700">
                  Amber freshness label. Included in your weekly bot morning digest.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-100/70 p-3.5">
                <div className="font-tn-mono text-xs font-bold text-neutral-800">
                  &gt; 14 days
                </div>
                <div className="mt-1 text-xs font-bold text-neutral-900">
                  Expired & Hidden
                </div>
                <p className="mt-0.5 text-[11px] text-neutral-600">
                  Hidden from buyer search until you re-confirm via bot or dashboard.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-tn-hair bg-tn-paper p-3.5 text-xs text-tn-mute">
              <div className="font-bold text-tn-ink">🌙 Quiet Hours Policy: 21:00 – 07:00 EAT</div>
              <p className="mt-0.5">
                The bot respects your night rest and will never send automated digests or reminders between 9:00 PM and 7:00 AM East Africa Time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
