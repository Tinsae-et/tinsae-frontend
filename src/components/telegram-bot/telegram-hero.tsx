import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { TelegramChatMockup } from "./telegram-chat-mockup";

export function TelegramHero() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 pt-12 pb-16 lg:px-7 lg:pt-16 lg:pb-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        {/* Left Column: Explainer & CTA */}
        <div>
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-tn-hair bg-white px-3.5 py-1.5 text-xs font-semibold text-tn-ink shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Icon name="tg" size={13} className="text-tn-red" />
            <span>Telegram bot</span>
          </div>

          {/* Heading */}
          <h1 className="mt-5 text-[38px] leading-[1.04] font-extrabold tracking-[-0.035em] text-tn-ink sm:text-[54px] lg:text-[62px]">
            Keep your listings
            <br />
            <span className="text-tn-red">fresh in one tap.</span>
          </h1>

          {/* Intro Paragraph */}
          <p className="mt-5 max-w-[480px] text-base leading-relaxed font-medium text-tn-mute sm:text-[17px]">
            The Tinsae bot sends you a weekly digest on Telegram. Confirm your stock in a
            single tap, and fresh listings rank higher for buyers across Bole.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Pill kind="solid" size="lg" iconAfter="arrow" href="/signup">
              Create your shop account
            </Pill>
            <a
              href="#commands"
              className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full border-[1.5px] border-tn-hair bg-white px-6 text-base font-bold text-tn-ink transition-colors hover:border-tn-ink"
            >
              <span>See the commands</span>
              <Icon name="chevd" size={15} />
            </a>
          </div>

          {/* Microcopy note */}
          <p className="mt-4 text-xs font-medium text-tn-mute sm:text-[13px]">
            You&apos;ll connect Telegram after you sign up, from your dashboard.
          </p>

          {/* Cadence Info */}
          <div className="mt-7 flex flex-col gap-2 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 text-tn-mute">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" size={14} className="text-tn-mute" />
                <span>
                  <strong className="font-tn-mono font-bold text-tn-ink">1</strong> message a week
                </span>
              </span>
              <span className="select-none text-tn-hair font-bold">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="bolt" size={14} className="text-tn-telegram" />
                <span>
                  <strong className="font-tn-mono font-bold text-tn-telegram">1</strong> tap to confirm
                </span>
              </span>
              <span className="select-none text-tn-hair font-bold">·</span>
            </div>
            <div className="font-tn-mono text-sm font-bold text-tn-ink sm:text-[15px]">
              @tinsae_et_bot
            </div>
          </div>
        </div>

        {/* Right Column: Chat Mockup */}
        <div className="flex justify-center lg:justify-end">
          <TelegramChatMockup />
        </div>
      </div>
    </section>
  );
}
