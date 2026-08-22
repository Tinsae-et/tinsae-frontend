import type { Metadata } from "next";
import "@/app/globals.css";
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
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="font-tn-sans text-tn-ink min-h-full bg-white">{children}</body>
    </html>
  );
}