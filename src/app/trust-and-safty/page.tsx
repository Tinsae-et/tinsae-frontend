import { FAQSection } from "@/components/trust-safety/faq-section";
import { FinalCTA } from "@/components/trust-safety/final-cta";
import { FreshnessBanner } from "@/components/trust-safety/freshness-banner";
import { RedFlagsSection } from "@/components/trust-safety/red-flags";
import { ReportingSection } from "@/components/trust-safety/reporting-section";
import { SafetyRules } from "@/components/trust-safety/safety-rules";
import { TrustDetails } from "@/components/trust-safety/trust-details";
import { TrustHero } from "@/components/trust-safety/trust-hero";
import { VerificationSection } from "@/components/trust-safety/verification-section";

export default function TrustAndSafetyPage() {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 py-8 md:px-8 lg:px-10">
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
