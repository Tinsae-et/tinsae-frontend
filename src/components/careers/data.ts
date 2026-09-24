import { IconName } from "@/components/tinsae/icon";

export const CAREERS_EMAIL = "careers@tinsae.et";
export const CAREERS_TELEGRAM = "TinsaeJobs";

export type RoleType = "full-time" | "part-time" | "contract" | "internship";

export interface Role {
  id: string;
  title: string;
  department: string;
  location: string;
  type: RoleType;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  postedAt: string;
  openings?: number;
  urgent?: boolean;
}

export interface InfoCard {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  iconTone: "orange" | "blue" | "purple" | "green";
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
    iconTone: "orange",
  },
  {
    id: "team",
    title: "Small team, real ownership",
    description:
      "Eleven people. You will own a surface end to end and talk to the people who use it, not to a proxy three layers away.",
    icon: "bolt",
    iconTone: "blue",
  },
  {
    id: "language",
    title: "Amharic and English, both first-class",
    description:
      "Our users message in both. Our team works in both. Neither is the translation of the other.",
    icon: "msg",
    iconTone: "purple",
  },
  {
    id: "trust",
    title: "Trust over growth",
    description:
      "We have turned away shops that would have grown the catalogue. If a decision trades trust for numbers, we do not take it.",
    icon: "shield",
    iconTone: "green",
  },
];

export const ROLES: Role[] = [
  {
    id: "verification-agent",
    title: "Verification Agent",
    openings: 3,
    urgent: true,
    summary:
      "Walk into shops, check documents against reality, and decide who earns a badge. The most important job at Tinsae.",
    department: "Operations",
    location: "Bole · field",
    type: "full-time",
    postedAt: "2026-09-01",
    responsibilities: [
      "Visit 8–12 electronics shops in Bole and Addis Ababa daily to verify physical inventory and business legitimacy.",
      "Review trade licenses, TIN registrations, and shop identity documents against government records.",
      "Take standardized photographs of storefronts, counters, and shelf stock for shop profiles.",
      "Conduct initial onboarding and brief shop owners on how the daily Telegram confirmation bot works.",
      "Report anomalies or counterfeit concerns directly to the Trust & Safety lead.",
    ],
    requirements: [
      "Fluent in Amharic with working proficiency in English.",
      "Deep familiarity with Addis Ababa's commercial districts (especially Bole, Edna Mall, Dembel, and Piassa).",
      "High integrity and attention to detail — our trust badge is only as good as your verification.",
      "Comfortable spending most of your working day on foot visiting shops.",
    ],
    niceToHave: [
      "Prior experience in field audits, mystery shopping, courier dispatch, or retail operations.",
      "Personal knowledge of consumer electronics models (smartphones, laptops, accessories).",
    ],
  },
  {
    id: "backend-engineer",
    title: "Senior Backend Engineer",
    summary:
      "Own the stock-confirmation pipeline and the Telegram bot that 412 shops answer every morning.",
    department: "Engineering",
    location: "Addis · hybrid",
    type: "full-time",
    postedAt: "2026-09-05",
    responsibilities: [
      "Maintain and scale our core Django REST API serving buyers and shop dashboards.",
      "Own the Telegram confirmation bot architecture handling morning stock pings to hundreds of shopkeepers.",
      "Design and optimize PostgreSQL schemas and queries for fast product discovery and freshness tracking.",
      "Ensure sub-100ms API response times even during network throttling or flaky cellular conditions in Addis.",
    ],
    requirements: [
      "4+ years of backend engineering experience with Python/Django or similar web frameworks.",
      "Solid understanding of relational database design, indexing, and transactional integrity in PostgreSQL.",
      "Hands-on experience building bots (Telegram Bot API) or asynchronous event queues (Celery/Redis).",
      "Ability to work on-site with the team in Addis Ababa several days a week.",
    ],
    niceToHave: [
      "Experience building for low-bandwidth, high-latency network environments.",
      "Familiarity with Ethiopian payment systems and telecom integrations (Telebirr, Ethio Telecom).",
    ],
  },
  {
    id: "mobile-engineer",
    title: "Mobile Engineer (Android)",
    summary:
      "Build the buyer app for the phones people here actually carry. Offline-first, small APK, real export constraints.",
    department: "Engineering",
    location: "Addis · hybrid",
    type: "full-time",
    postedAt: "2026-09-08",
    responsibilities: [
      "Develop our Android application for Ethiopian consumers.",
      "Engineer aggressive offline caching so buyers can browse previously loaded listings without active data.",
      "Keep APK download size minimal (<15MB) and ensure smooth performance on budget Android devices.",
      "Work closely with product design to build intuitive search and filter gestures.",
    ],
    requirements: [
      "3+ years building and shipping production Android applications.",
      "Deep knowledge of Android performance profiling, memory management, and network caching.",
      "Strong grasp of responsive UI on low-to-mid tier screens (e.g. Transsion/Tecno/Infinix hardware).",
      "Based in Addis Ababa for regular shop visits and user testing sessions.",
    ],
    niceToHave: [
      "Experience deploying APKs outside Google Play (direct APK download, Telegram distribution).",
      "Understanding of Amharic typography and localization on Android.",
    ],
  },
  {
    id: "partnerships-lead",
    title: "Shop Partnerships Lead",
    summary:
      "Open the next neighbourhood. Convince 100 shop owners that a daily tap is worth it — then prove it.",
    department: "Growth",
    location: "Addis · field",
    type: "full-time",
    postedAt: "2026-09-10",
    responsibilities: [
      "Identify, approach, and build relationships with electronics shop owners across new Addis neighbourhoods.",
      "Convince skeptical merchants of the value of transparent pricing and daily stock confirmations.",
      "Troubleshoot initial onboarding friction and collect merchant feedback for the product team.",
      "Hit weekly targets for verified shop sign-ups and daily confirmation retention.",
    ],
    requirements: [
      "Exceptional communication and relationship-building skills in Amharic.",
      "Demonstrated sales, business development, or community engagement experience in Addis Ababa.",
      "High resilience and empathy — shopkeepers are busy and protective of their margins.",
      "Willingness to spend 80% of your time in the commercial corridors talking face-to-face.",
    ],
    niceToHave: [
      "Existing network of contacts in Addis electronics hubs.",
      "Experience in merchant acquiring, fintech agent networks, or retail distribution.",
    ],
  },
  {
    id: "product-designer",
    title: "Product Designer",
    summary:
      "Design for buyers who compare on a 6-inch screen and owners who work from behind a counter.",
    department: "Product",
    location: "Addis · hybrid",
    type: "full-time",
    postedAt: "2026-09-12",
    responsibilities: [
      "Design simple, fast, and accessible user flows across web, mobile, and Telegram touchpoints.",
      "Conduct regular user interviews in Bole shops with buyers and shopkeepers.",
      "Refine our design system with high-contrast typography, tight spacing tokens, and Amharic support.",
      "Create prototypes to validate usability before engineering commits code.",
    ],
    requirements: [
      "3+ years designing web or mobile consumer products.",
      "Proficiency with Figma and building structured design systems.",
      "Strong typography sense, specifically dealing with dual-language (Latin + Ethiopic/Ge'ez) scripts.",
      "Based in Addis Ababa to participate in field research.",
    ],
    niceToHave: [
      "Front-end prototyping skills (HTML/Tailwind/React).",
      "Experience designing for emerging market contexts.",
    ],
  },
  {
    id: "customer-support",
    title: "Customer Support (Amharic & English)",
    summary:
      "Be the human on the other end of @TinsaeSupport. Answer fast, in the language people wrote in.",
    department: "Operations",
    location: "Addis · office",
    type: "full-time",
    postedAt: "2026-09-15",
    responsibilities: [
      "Monitor and respond to user inquiries and dispute reports on Telegram (@TinsaeSupport) and email.",
      "Help buyers verify listing details and report discrepancies or ghost shops.",
      "Guide shop owners who have questions about verification or catalog updates.",
      "Log recurring complaints to help engineering and product prioritize fixes.",
    ],
    requirements: [
      "Flawless written communication in both Amharic and English.",
      "Patient, empathetic, and level-headed problem solver.",
      "Quick response times and comfortable working with Telegram and helpdesk tools.",
      "Ability to work on-site at our Bole office.",
    ],
    niceToHave: [
      "Previous customer support or operations experience in an Ethiopian tech startup.",
      "Knowledge of consumer rights and local electronics trading norms.",
    ],
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
    title: "Apply on Telegram or Email",
    description:
      "Message @TinsaeJobs or email careers@tinsae.et with your interest. No portal, no cover letter template.",
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
      "Not right now. Every role includes time inside real shops in Bole, and the team makes decisions in person. Hybrid within Addis is normal — fully remote is not something we can do well yet.",
  },
  {
    id: "paid",
    question: "Is the take-home paid?",
    answer:
      "Yes, at your day rate, and it is scoped to about four hours. It is always drawn from work we genuinely need — nothing invented for the sake of testing you.",
  },
  {
    id: "early-career",
    question: "What if I'm early in my career?",
    answer:
      "Apply. Two of the eleven joined with no formal experience and are now running their own areas. Tell us what you have built or organised, however informal.",
  },
  {
    id: "how-to-apply",
    question: "How do I actually apply?",
    answer:
      "Send an email to careers@tinsae.et with the role in the subject line, or message @TinsaeJobs on Telegram with a short note. You will hear back within three working days either way.",
  },
];

export function getRoleById(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}