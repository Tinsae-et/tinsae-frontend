import { Icon } from "@/components/tinsae/icon";

export function TelegramChatMockup() {
  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-[26px] border border-[#A7CEBE] shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
      {/* Telegram Blue Header */}
      <div className="flex items-center gap-3.5 bg-[#24A1DE] px-5 py-3.5 text-white">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Icon name="tg" size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-extrabold leading-tight tracking-tight text-white">
            Tinsae
          </div>
          <div className="text-xs font-normal text-white/80">
            @tinsae_et_bot · bot
          </div>
        </div>
      </div>

      {/* Telegram Chat Wallpaper Area */}
      <div className="flex flex-col gap-3 bg-[#96BFB1] p-4 sm:p-5">
        {/* Date Badge */}
        <div className="mx-auto inline-block rounded-full bg-[#356153]/35 px-3.5 py-0.5 text-[11px] font-medium text-white shadow-xs select-none">
          Monday
        </div>

        {/* Message 1: Weekly check-in from Bot */}
        <div className="max-w-[88%] self-start rounded-2xl bg-white p-4 text-tn-ink shadow-sm">
          <p className="text-[13px] leading-snug">
            <strong className="font-extrabold text-tn-ink">Weekly check-in</strong> for Almeda Electronics.
          </p>
          <p className="mt-1 text-[13px] leading-snug text-tn-mute">
            12 listings are due this week.
          </p>

          {/* Inline Buttons */}
          <div className="mt-3.5 flex flex-col gap-1.5">
            <button
              type="button"
              className="w-full rounded-lg border border-[#E3EDF3] bg-white py-2 px-3 text-center text-xs font-bold text-[#24A1DE] shadow-xs transition hover:bg-[#F7FAFC]"
            >
              All still available
            </button>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                className="rounded-lg border border-[#E3EDF3] bg-white py-2 px-3 text-center text-xs font-bold text-[#24A1DE] shadow-xs transition hover:bg-[#F7FAFC]"
              >
                Mark some sold
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#E3EDF3] bg-white py-2 px-3 text-center text-xs font-bold text-[#24A1DE] shadow-xs transition hover:bg-[#F7FAFC]"
              >
                My products
              </button>
            </div>
          </div>

          <div className="mt-1.5 font-tn-mono text-right text-[10px] text-tn-mute">
            09:00
          </div>
        </div>

        {/* Message 2: Shop reply */}
        <div className="max-w-[72%] self-end rounded-2xl bg-[#E1FFC7] px-4 py-2.5 text-tn-ink shadow-sm">
          <div className="font-tn-mono text-[13px] font-bold text-tn-ink">
            sold 2 5
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-1 font-tn-mono text-[10px] text-[#55823D]">
            <span>09:02</span>
            <span className="font-bold tracking-tighter text-[#4BAE4F]" aria-label="Read">
              ✓✓
            </span>
          </div>
        </div>

        {/* Message 3: Bot confirmation reply */}
        <div className="max-w-[85%] self-start rounded-2xl bg-white p-3.5 text-tn-ink shadow-sm">
          <p className="text-[13px] leading-snug text-tn-ink">
            Done. Items 2 and 5 are marked sold. The other 10 are confirmed fresh.
          </p>
          <div className="mt-1 font-tn-mono text-right text-[10px] text-tn-mute">
            09:02
          </div>
        </div>
      </div>
    </div>
  );
}
