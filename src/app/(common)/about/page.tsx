import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/about-sections";

export const metadata: Metadata = {
  title: "About Tinsae — We made the trust legible",
  description:
    "Tinsae makes trust in Ethiopia's local electronics market legible through in-person shop verification and daily-confirmed stock.",
  openGraph: {
    title: "About Tinsae — We made the trust legible",
    description:
      "The story behind Tinsae, the verified electronics marketplace for Ethiopia.",
    url: "https://tinsae.et/about",
    siteName: "Tinsae",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
