import type { Metadata } from "next";
import { FAQSection } from "@/components/trust-safety/faq-section";
import { FinalCTA } from "@/components/trust-safety/final-cta";
import { FreshnessBanner } from "@/components/trust-safety/freshness-banner";
import { RedFlagsSection } from "@/components/trust-safety/red-flags";
import { ReportingSection } from "@/components/trust-safety/reporting-section";
import { SafetyRules } from "@/components/trust-safety/safety-rules";
import { TrustDetails } from "@/components/trust-safety/trust-details";
import { TrustHero } from "@/components/trust-safety/trust-hero";
import { VerificationSection } from "@/components/trust-safety/verification-section";

export const metadata: Metadata = {
  title: "Trust & Safety — Tinsae",
  description:
    "What the Tinsae verified badge means: a three-part shop check, daily stock re-confirmation, and how to buy safely in person anywhere in Ethiopia.",
};

export default function TrustAndSafetyPage() {
  return (
    <main className="text-tn-ink">
      <TrustHero />
      <VerificationSection />
      <FreshnessBanner />
      <SafetyRules />
      <RedFlagsSection />
      <TrustDetails />
      <ReportingSection />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}
