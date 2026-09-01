import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareProvider } from "@/context/compare-context";
import { CompareDock } from "@/components/compare/compare-dock";
import { CompareToast } from "@/components/compare/compare-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CompareProvider>
      <div className="flex min-h-full flex-col bg-white">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <CompareDock />
        <CompareToast />
      </div>
    </CompareProvider>
  );
}
