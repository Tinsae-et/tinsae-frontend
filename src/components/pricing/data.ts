export type BillingCycle = "monthly" | "annual";

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  annualTotal: string;
  priceNoteMonthly: string;
  priceNoteAnnual: string;
  billing: string;
  cta: string;
  featured?: boolean;
  featuresLabel?: string;
  features: string[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "List and get verified",
    monthlyPrice: "0",
    annualPrice: "0",
    annualTotal: "0",
    priceNoteMonthly: "Free forever",
    priceNoteAnnual: "Free forever",
    billing: "mo",
    cta: "Current plan",
    features: [
      "Up to 20 live listings",
      "Verified shop badge",
      "Daily Telegram stock check-in",
      "Standard storefront profile",
      "Leads & inquiries inbox",
    ],
  },
  {
    id: "featured",
    name: "Featured",
    description: "Get found first",
    monthlyPrice: "1,500",
    annualPrice: "1,250",
    annualTotal: "15,000",
    priceNoteMonthly: "Billed monthly · cancel anytime",
    priceNoteAnnual: "Billed annually (ETB 15,000/yr) · 2 months free",
    billing: "mo",
    cta: "Upgrade to Featured",
    featured: true,
    featuresLabel: "EVERYTHING IN FREE, PLUS:",
    features: [
      "Up to 100 live listings",
      "Featured placement in search",
      "Highlighted in category pages",
      "Priority pin on the map",
      "Basic performance analytics",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Maximum reach in Bole",
    monthlyPrice: "3,500",
    annualPrice: "2,916",
    annualTotal: "35,000",
    priceNoteMonthly: "Billed monthly · cancel anytime",
    priceNoteAnnual: "Billed annually (ETB 35,000/yr) · 2 months free",
    billing: "mo",
    cta: "Upgrade to Premium",
    featuresLabel: "EVERYTHING IN FEATURED, PLUS:",
    features: [
      "Unlimited live listings",
      "Top-of-search boosts",
      "Homepage shop rotation",
      "Full analytics & competitor pricing",
      "Priority support",
    ],
  },
];

export type PreviewShop = {
  initials: string;
  initialsBg: string;
  name: string;
  location: string;
  price: string;
  featured?: boolean;
};

export const PREVIEW_SHOPS: PreviewShop[] = [
  {
    initials: "AE",
    initialsBg: "#0B0B0B",
    name: "Almeda Electronics",
    location: "Bole · Atlas",
    price: "ETB 142,500",
    featured: true,
  },
  {
    initials: "MT",
    initialsBg: "#2D4543",
    name: "Mosaic Tech Hub",
    location: "Bole · Friendship",
    price: "ETB 144,800",
    featured: false,
  },
  {
    initials: "AD",
    initialsBg: "#334155",
    name: "Axum Digital",
    location: "Bole · Olympia",
    price: "ETB 145,200",
    featured: false,
  },
];

export type BillingAccount = {
  currentPlan: string;
  amount: string;
  interval: string;
  renewalDate: string;
  paymentMethod: {
    provider: string;
    accountNumber: string;
    status: string;
  };
};

export const BILLING_ACCOUNT: BillingAccount = {
  currentPlan: "Featured",
  amount: "ETB  1,500",
  interval: "/month",
  renewalDate: "July 1, 2026",
  paymentMethod: {
    provider: "telebirr",
    accountNumber: "+251 91 ••• 5678",
    status: "Active",
  },
};

export type BillingInvoice = {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
};

export const BILLING_INVOICES: BillingInvoice[] = [
  {
    id: "INV-2026-0612",
    date: "Jun 1, 2026",
    plan: "Featured · monthly",
    amount: "ETB 1,500",
    status: "Paid",
  },
  {
    id: "INV-2026-0511",
    date: "May 1, 2026",
    plan: "Featured · monthly",
    amount: "ETB 1,500",
    status: "Paid",
  },
  {
    id: "INV-2026-0410",
    date: "Apr 1, 2026",
    plan: "Featured · monthly",
    amount: "ETB 1,500",
    status: "Paid",
  },
];

export type PricingFaq = {
  question: string;
  answer: string;
};

export const PRICING_FAQS: PricingFaq[] = [
  {
    question: "Does Tinsae take a commission on my sales?",
    answer:
      "No — never. We don't handle payments and take no cut of any transaction. Featured plans are the only thing you ever pay us for.",
  },
  {
    question: "Can I cancel or change plan anytime?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your subscription at any time. When cancelling, your featured benefits continue until the end of your current billing period.",
  },
  {
    question: "What happens to my listings if I downgrade?",
    answer:
      "Your shop and listings remain intact. If you have more listings than the Free plan allows (20 listings), your newest listings will be paused until you upgrade or adjust your catalog.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "We accept telebirr, CBE Birr, and direct Ethiopian bank transfers. Corporate invoices are also available for annual plans.",
  },
];
