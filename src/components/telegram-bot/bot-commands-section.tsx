import { COMMANDS } from "./types";

export function BotCommandsSection() {
  return (
    <section
      id="commands"
      className="mx-auto mt-20 max-w-[1240px] scroll-mt-24 px-6 sm:mt-28 lg:px-7"
    >
      <div>
        <div className="text-xs font-bold tracking-[0.12em] uppercase text-tn-red">
          MENU &amp; COMMANDS
        </div>
        <h2 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] text-tn-ink sm:text-[42px]">
          Everything you can do from the chat.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed font-medium text-tn-mute sm:text-[17px]">
          Open the menu button (≡) in Telegram, or type a slash. The bot is @tinsae_et_bot.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-tn-hair bg-white divide-y divide-tn-hair shadow-xs">
        {COMMANDS.map((item) => (
          <div
            key={item.command}
            className="flex flex-col gap-1.5 px-6 py-4.5 transition-colors hover:bg-tn-paper/40 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <div className="w-40 shrink-0 font-tn-mono text-sm font-bold text-[#0088CC] sm:w-48">
              {item.command}
            </div>
            <div className="text-sm leading-relaxed text-tn-ink2">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
