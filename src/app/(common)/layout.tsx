import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { fontVariables } from "@/lib/fonts";

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
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="font-tn-sans text-tn-ink flex min-h-full flex-col bg-white">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
