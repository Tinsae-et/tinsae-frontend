import { IconName } from "@/components/tinsae/icon";

export interface InfoCard {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
}

export interface Role {
  id: string;
  title: string;
  openings?: number;
  description: string;
  department: string;
  location: string;
  type: string;
}

export interface Benefit {
  id: string;
  label: string;
  description: string;
}

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const CARDS: InfoCard[] = [
  {
    id: "shops",
    title: "We work where the shops are",
    description:
      "Everyone — engineers included — spends time inside real shops in Bole. You cannot design a daily check-in you have never watched someone do.",
    icon: "pin",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    id: "team",
    title: "Small team, real ownership",
    description:
      "Eleven people. You will own a surface end to end and talk to the people who use it, not to a proxy three layers away.",
    icon: "bolt",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    id: "language",
    title: "Amharic and English, both first-class",
    description:
      "Our users message in both. Our team works in both. Neither is the translation of the other.",
    icon: "msg",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
  },
  {
    id: "trust",
    title: "Trust over growth",
    description:
      "We have turned away shops that would have grown the catalogue. If a decision trades trust for numbers, we do not take it.",
    icon: "shield",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export const ROLES: Role[] = [
  {
    id: "verification-agent",
    title: "Verification Agent",
    openings: 3,
    description:
      "Walk into shops, check documents against reality, and decide who earns a badge. The most important job at Tinsae.",
    department: "Operations",
    location: "Bole · field",
    type: "Full-time",
  },
  {
    id: "backend-engineer",
    title: "Senior Backend Engineer",
    description:
      "Own the stock-confirmation pipeline and the Telegram bot that 412 shops answer every morning.",
    department: "Engineering",
    location: "Addis · hybrid",
    type: "Full-time",
  },
  {
    id: "mobile-engineer",
    title: "Mobile Engineer (Android)",
    description:
      "Build the buyer app for the phones people here actually carry. Offline-first, small APK, real export constraints.",
    department: "Engineering",
    location: "Addis · hybrid",
    type: "Full-time",
  },
  {
    id: "partnerships-lead",
    title: "Shop Partnerships Lead",
    description:
      "Open the next neighbourhood. Convince 100 shop owners that a daily tap is worth it — then prove it.",
    department: "Growth",
    location: "Addis · field",
    type: "Full-time",
  },
  {
    id: "product-designer",
    title: "Product Designer",
    description:
      "Design for buyers who compare on a 6-inch screen and owners who work from behind a counter.",
    department: "Product",
    location: "Addis · hybrid",
    type: "Full-time",
  },
  {
    id: "customer-support",
    title: "Customer Support (Amharic & English)",
    description:
      "Be the human on the other end of @TinsaeSupport. Answer fast, in the language people wrote in.",
    department: "Operations",
    location: "Addis · office",
    type: "Full-time",
  },
];

export const BENEFITS: Benefit[] = [
  {
    id: "salary",
    label: "Salary",
    description: "Benchmarked against Addis tech, reviewed twice a year",
  },
  {
    id: "health",
    label: "Health",
    description: "Full medical cover for you and immediate family",
  },
  {
    id: "equipment",
    label: "Equipment",
    description: "Your choice of laptop and a work phone",
  },
  {
    id: "transport",
    label: "Transport",
    description: "Covered for all field work across the city",
  },
  {
    id: "learning",
    label: "Learning",
    description: "ETB 25,000 a year, yours to spend",
  },
  {
    id: "time-off",
    label: "Time off",
    description: "22 days plus every public holiday",
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "apply",
    number: "01",
    title: "Apply on Telegram",
    description:
      "Message @TinsaeJobs with the role and a note about why. No cover letter, no portal, no account to create.",
  },
  {
    id: "call",
    number: "02",
    title: "A 30-minute call",
    description:
      "We tell you honestly what the job is. You ask us anything. Either side can stop here.",
  },
  {
    id: "problem",
    number: "03",
    title: "A real problem",
    description:
      "Paid, scoped to about four hours, and drawn from work we actually need done. No whiteboard puzzles.",
  },
  {
    id: "day",
    number: "04",
    title: "A day in Bole",
    description:
      "Come with us to visit shops. This is the step that tells both of us whether it fits.",
  },
  {
    id: "offer",
    number: "05",
    title: "Offer within a week",
    description:
      "From first call to decision is ten days at most. We will never leave you waiting in silence.",
  },
];

export const FAQS: FaqItem[] = [
  {
    id: "amharic",
    question: "Do I need to speak Amharic?",
    answer:
      "For field and support roles, yes — you will be talking to shop owners all day. For engineering and design, English is enough to start, though you will pick up more than you expect from the shop visits.",
  },
  {
    id: "remote",
    question: "Can I work remotely?",
    answer:
      "Not right now. Every role spends real time in Addis — some of them full-time in shops — because the verification model depends on it.",
  },
  {
    id: "paid",
    question: "Is the take-home paid?",
    answer:
      "Yes. It's scoped to about four hours of work drawn from something we actually need, and we pay for your time whether or not we move forward.",
  },
  {
    id: "early-career",
    question: "What if I'm early in my career?",
    answer:
      "We care more about judgment and follow-through than years of experience. If the role's description sounds like something you could grow into fast, apply.",
  },
  {
    id: "how-to-apply",
    question: "How do I actually apply?",
    answer:
      "Message @TinsaeJobs on Telegram with the role you want and a short note on why. No portal, no account, no cover letter template.",
  },
];