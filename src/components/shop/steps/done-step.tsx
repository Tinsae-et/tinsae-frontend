"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import type { OnboardingState } from "@/lib/shop/onboarding-state";

export function DoneStep({ state }: { state: OnboardingState }) {
  const router = useRouter();

  return (
    <div className="py-6 text-center">
      <div className="bg-tn-green-soft inline-flex size-20 items-center justify-center rounded-full">
        <span className="bg-tn-green flex size-14 items-center justify-center rounded-full text-white">
          <Icon name="check" size={30} strokeWidth={3} />
        </span>
      </div>

      <h1 className="text-tn-ink mt-6 text-[32px] font-extrabold tracking-tight">
        {state.name || "Your shop"} is registered!
      </h1>
      <p className="text-tn-mute mx-auto mt-3 max-w-[440px] text-[15.5px] leading-relaxed">
        Verification is under review — you&apos;ll hear back on Telegram within 24 hours. Meanwhile,
        set up the bot so your stock stays current.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="bg-tn-warn/15 text-tn-warn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
          <Icon name="clock" size={12} />
          Verification pending
        </span>
        {state.cats.slice(0, 3).map((category) => (
          <span
            key={category}
            className="bg-tn-paper text-tn-ink2 rounded-full px-3 py-1 text-xs font-bold"
          >
            {category}
          </span>
        ))}
        <span className="bg-tn-paper text-tn-ink2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
          <Icon name="pin" size={11} />
          Bole · {state.area}
        </span>
      </div>

      <div className="bg-tn-ink mt-8 rounded-3xl p-6 text-left text-white shadow-xl sm:p-7">
        <div className="flex items-center gap-3.5">
          <span className="bg-tn-telegram flex size-12 shrink-0 items-center justify-center rounded-2xl text-white">
            <Icon name="tg" size={24} />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-white">Connect your Telegram bot</h2>
            <p className="text-[13px] text-white/65">
              Confirm stock in one tap each week so buyers only ever see what&apos;s available.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Pill kind="light" size="md" iconAfter="arrow" onClick={() => router.push("/shop/dashboard/overview")}>
            Go to dashboard
          </Pill>
          <Pill
            kind="ghost"
            size="md"
            icon="tg"
            onClick={() => router.push("/shop/dashboard/telegram")}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Connect Telegram bot
          </Pill>
        </div>
      </div>
    </div>
  );
}
