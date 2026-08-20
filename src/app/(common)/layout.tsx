import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_Ethiopic } from "next/font/google";
import "@/app/globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Carries the ትንሳኤ wordmark that appears in the logo, stat band and CTA.
const ethiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tinsae — verified shops",
  description:
    "Compare electronics prices across verified Bole shops that reconfirm their stock every day. No more wasted trips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrains.variable} ${ethiopic.variable} h-full antialiased`}
    >
      <body className="font-tn-sans text-tn-ink flex min-h-full flex-col bg-white">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
