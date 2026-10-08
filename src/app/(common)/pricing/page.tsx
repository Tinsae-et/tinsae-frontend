import type { Metadata } from "next";

import { PricingPage } from "@/components/pricing/pricing-page";

export const metadata: Metadata = {
  title: "Plans & Pricing for Shops — Tinsae",
  description:
    "List and verify your electronics shop for free, or choose a Tinsae featured plan to reach more buyers in Addis Ababa.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Plans & Pricing for Shops — Tinsae",
    description:
      "Simple plans for verified electronics shops in Addis Ababa. Listing and verification are always free.",
    url: "/pricing",
    siteName: "Tinsae",
    type: "website",
  },
};

export default function PricingRoute() {
  return <PricingPage />;
}
