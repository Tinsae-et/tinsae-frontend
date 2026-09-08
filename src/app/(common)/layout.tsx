import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareProvider } from "@/context/compare-context";
import { CompareDock } from "@/components/compare/compare-dock";
import { CompareToast } from "@/components/compare/compare-toast";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <CompareProvider>
      <div className="flex min-h-full flex-col bg-white">
        <SiteHeader user={user} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <CompareDock />
        <CompareToast />
      </div>
    </CompareProvider>
  );
}
