import type { IconName } from "@/components/tinsae/icon";

export interface BotCommand {
  command: string;
  description: string;
}

export interface HowItWorksStep {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  stepLabel: string;
}

export interface GettingStartedStep {
  step: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: "clock",
    iconBg: "bg-[#FFF2EE]",
    iconColor: "text-[#CC3000]",
    title: "Weekly check-in",
    body: "One message each week, on your due date, to confirm your listings.",
    stepLabel: "STEP 1",
  },
  {
    icon: "bolt",
    iconBg: "bg-[#E8F6FD]",
    iconColor: "text-[#24A1DE]",
    title: "One-tap answer",
    body: 'Tap "All still available", or reply "sold 2 5" to mark items sold.',
    stepLabel: "STEP 2",
  },
  {
    icon: "pulse",
    iconBg: "bg-[#EDF8F2]",
    iconColor: "text-[#1F8A5B]",
    title: "Higher ranking",
    body: "Fresh listings appear first when buyers browse across Bole.",
    stepLabel: "STEP 3",
  },
];

export const COMMANDS: BotCommand[] = [
  {
    command: "/menu",
    description:
      "Opens the interactive hub with buttons for stock, status and your web dashboard.",
  },
  {
    command: "/myproducts",
    description:
      "View and manage your listings with one-tap inline buttons: Confirm, Sold, Pause, Resume.",
  },
  {
    command: "/status",
    description:
      "A summary of fresh, due and hidden items, plus your next check-in.",
  },
  {
    command: "/pause_shop",
    description:
      "Vacation mode. Pauses every listing at once so buyers don't see stock that may be gone.",
  },
  {
    command: "/resume_shop",
    description:
      "Resumes all your paused listings when you are back.",
  },
  {
    command: "/unlink",
    description:
      "Disconnects this Telegram chat from your shop. You can re-link any time.",
  },
  {
    command: "/help",
    description:
      "Full instructions, command summaries and reply examples, right in the chat.",
  },
];

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    step: "01",
    title: "Create your shop account",
    description:
      "Register your shop on Tinsae. This comes first: the bot only messages shops that have an account.",
  },
  {
    step: "02",
    title: "Connect Telegram",
    description:
      "From your dashboard, link your Telegram to the shop. It takes about a minute, and you can unlink any time.",
  },
  {
    step: "03",
    title: "Confirm on your due date",
    description:
      "The bot messages you once a week. One tap and every listing stays fresh.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What happens if I miss a check-in?",
    answer:
      "Your listings move from fresh to due, and then they are hidden from buyers until you confirm. Use /status any time to see which items are fresh, due or hidden.",
  },
  {
    question: "I'm going away. Can I pause everything?",
    answer:
      "Yes. Use /pause_shop in Telegram to enter vacation mode and pause all your listings at once so buyers don't see stock that may be unavailable. When you return, send /resume_shop to bring them right back online.",
  },
  {
    question: "Can I disconnect the bot?",
    answer:
      "Yes, anytime. Send /unlink in Telegram or disconnect it from your shop dashboard. You can reconnect whenever you're ready in just one click.",
  },
  {
    question: "Does the bot cost anything?",
    answer:
      "No. The Telegram bot is completely free for all shops on Tinsae. There are no fees for check-ins, listing updates, or notifications.",
  },
];
