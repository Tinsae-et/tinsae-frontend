import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareProvider } from "@/context/compare-context";
import { CompareDock } from "@/components/compare/compare-dock";
import { CompareToast } from "@/components/compare/compare-toast";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublicStats } from "@/lib/api/public";
import { getNavCategories } from "@/lib/nav-categories";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, stats, categories] = await Promise.all([
    getCurrentUser(),
    getPublicStats().catch(() => null),
    getNavCategories(),
  ]);

  return (
    <CompareProvider>
      <div className="flex min-h-full flex-col bg-white">
        <SiteHeader user={user} stats={stats} categories={categories} />
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
        <SiteFooter />
        <CompareDock />
        <CompareToast />
      </div>
    </CompareProvider>
  );
}
