import type { Metadata } from "next";
import "@/app/globals.css";
import { SITE_URL } from "@/lib/config";
import { fontVariables } from "@/lib/fonts";
import { WebVitals } from "@/components/web-vitals";

export const metadata: Metadata = {
  // Resolves the relative canonical and Open Graph URLs set by pages.
  metadataBase: new URL(SITE_URL),
  title: "Tinsae — verified shops",
  description:
    "Compare electronics prices across verified shops all over Ethiopia that reconfirm their stock every day. No more wasted trips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="font-tn-sans text-tn-ink min-h-full bg-white">
        <WebVitals />
        {children}
      </body>
    </html>
  );
}