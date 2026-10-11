"use client";

import Link from "next/link";

import { Icon } from "@/components/tinsae/icon";
import { TinsaeLogo } from "@/components/tinsae/logo";
import { STEPS } from "@/lib/shop/onboarding-state";
import { cn } from "@/lib/utils";

/**
 * The dark rail, and the same stepper collapsed into the mobile top bar.
 *
 * Below `lg` the 380px panel is gone entirely — the design never drew that
 * breakpoint, and a 380px fixed rail on a 360px viewport leaves nothing for the
 * form. `<Stepper compact>` carries the "where am I" job there instead.
 */
export function SidePanel({ step }: { step: number }) {
  return (
    <aside className="bg-tn-ink sticky top-0 hidden h-screen w-[380px] shrink-0 flex-col p-[34px_36px] text-white lg:flex">
      <Link href="/" aria-label="Tinsae — home">
        <TinsaeLogo tone="onDark" className="h-[52px] w-auto" />
      </Link>

      <h2 className="mt-10 text-[30px] leading-[1.12] font-extrabold tracking-[-0.03em]">
        List your shop on Tinsae
      </h2>
      <p className="mt-3.5 text-[14.5px] leading-relaxed text-white/60">
        Get verified, reach buyers across Ethiopia, and keep your stock current with a daily Telegram
        check-in.
      </p>

      <div className="mt-10">
        <Stepper step={step} />
      </div>

      <div className="mt-auto rounded-2xl bg-white/6 p-4">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {["#0F2A4D", "#3B5742", "#7A2E2E", "#2D4A5E"].map((color, i) => (
              <span
                key={color}
                style={{ background: color }}
                className="border-tn-ink inline-flex size-7.5 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white"
              >
                {["AE", "MT", "KF", "AX"][i]}
              </span>
            ))}
          </div>
          {/* Hard-coded, like the count on the auth frames. Both need the API. */}
          <span className="ml-3 text-[13px] font-semibold text-white/85">
            412 verified shops across Ethiopia
          </span>
        </div>
      </div>
    </aside>
  );
}

export function Stepper({ step, compact = false }: { step: number; compact?: boolean }) {
  return (
    <ol
      className={cn("flex", compact ? "items-center gap-1.5" : "flex-col gap-1")}
      aria-label="Progress"
    >
      {STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "active" : "todo";
        return (
          <li
            key={label}
            aria-current={state === "active" ? "step" : undefined}
            className={cn("flex items-center", compact ? "gap-1.5" : "gap-3.5 py-2.5")}
          >
            <span
              className={cn(
                "font-tn-mono inline-flex shrink-0 items-center justify-center rounded-full font-extrabold",
                compact ? "size-6 text-[11px]" : "size-7.5 text-[13px]",
                compact
                  ? state === "active"
                    ? "bg-tn-ink text-white"
                    : state === "done"
                      ? "bg-tn-green text-white"
                      : "border-tn-hair text-tn-mute border bg-white"
                  : state === "active"
                    ? "text-tn-ink bg-white"
                    : state === "done"
                      ? "bg-tn-green text-white"
                      : "border border-white/15 bg-white/10 text-white/40",
              )}
            >
              {state === "done" ? <Icon name="check" size={compact ? 12 : 15} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                compact
                  ? cn(
                      "text-[12.5px] font-bold",
                      state === "active" ? "text-tn-ink" : "text-tn-mute hidden sm:inline",
                    )
                  : cn(
                      "text-[14.5px]",
                      state === "active"
                        ? "font-extrabold text-white"
                        : state === "done"
                          ? "font-semibold text-white"
                          : "font-semibold text-white/45",
                    ),
              )}
            >
              {label}
            </span>
            {compact && i < STEPS.length - 1 ? (
              <span className="bg-tn-hair mx-0.5 h-px w-3 shrink-0" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
