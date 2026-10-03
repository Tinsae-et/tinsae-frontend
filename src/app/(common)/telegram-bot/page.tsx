import type { Metadata } from "next";
import { TelegramHero } from "@/components/telegram-bot/telegram-hero";
import { HowItWorksSection } from "@/components/telegram-bot/how-it-works-section";
import { TwoWaysSection } from "@/components/telegram-bot/two-ways-section";
import { BotCommandsSection } from "@/components/telegram-bot/bot-commands-section";
import { GettingStartedSection } from "@/components/telegram-bot/getting-started-section";
import { TelegramFaqSection } from "@/components/telegram-bot/telegram-faq-section";
import { TelegramFinalCta } from "@/components/telegram-bot/telegram-final-cta";

export const metadata: Metadata = {
  title: "Telegram Bot — Keep your listings fresh in one tap | Tinsae",
  description:
    "The Tinsae bot sends you a weekly digest on Telegram. Confirm your stock in a single tap, and fresh listings rank higher for buyers across Bole.",
  openGraph: {
    title: "Telegram Bot — Keep your listings fresh in one tap | Tinsae",
    description:
      "The Tinsae bot sends you a weekly digest on Telegram. Confirm your stock in a single tap, and fresh listings rank higher for buyers across Bole.",
    url: "https://tinsae.et/telegram-bot",
    siteName: "Tinsae",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TelegramBotPage() {
  return (
    <main className="text-tn-ink">
      <TelegramHero />
      <HowItWorksSection />
      <TwoWaysSection />
      <BotCommandsSection />
      <GettingStartedSection />
      <TelegramFaqSection />
      <TelegramFinalCta />
    </main>
  );
}
