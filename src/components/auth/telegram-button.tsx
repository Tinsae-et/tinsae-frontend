"use client";

import { Icon } from "@/components/tinsae/icon";

/**
 * The primary path, per the design: Telegram is where Ethiopian buyers already
 * message shops, and where the freshness bot lives.
 *
 * The real thing is Telegram's Login Widget — a script from telegram.org that
 * needs the bot's domain registered and hands back a signed payload the backend
 * verifies against the bot token. That integration is a separate ticket; until
 * it exists this button posts a stand-in payload, which the mock driver accepts
 * and the real endpoint would (correctly) reject.
 */
export function TelegramButton({
  onClick,
  pending,
  disabled,
}: {
  onClick: () => void;
  pending?: boolean;
  disabled?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending || disabled}
        className="inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-[13px] bg-tn-telegram text-[15px] font-bold text-white shadow-[0_8px_22px_rgba(34,158,217,0.28)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon name="tg" size={19} />
        {pending ? "Opening Telegram…" : "Continue with Telegram"}
      </button>

      {/* Keep this line — it justifies the hierarchy. */}
      <p className="mt-2.25 flex items-center justify-center gap-1.5 text-[11.5px] text-tn-mute">
        <Icon name="bolt" size={12} />
        Fastest — most buyers chat shops here anyway
      </p>
    </>
  );
}

/** Two hairlines around "OR". */
export function OrDivider() {
  return (
    <div className="my-5.5 flex items-center gap-3.5">
      <span className="h-px flex-1 bg-tn-hair" />
      <span className="text-[11.5px] font-bold tracking-[0.04em] text-tn-mute">OR</span>
      <span className="h-px flex-1 bg-tn-hair" />
    </div>
  );
}
