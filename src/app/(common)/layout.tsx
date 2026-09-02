import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareProvider } from "@/context/compare-context";
import { CompareDock } from "@/components/compare/compare-dock";
import { CompareToast } from "@/components/compare/compare-toast";
import { readSession } from "@/lib/auth/session";
import { authDriver } from "@/lib/auth/driver";
import type { AuthUser } from "@/lib/auth/types";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { access } = await readSession();
  let user: AuthUser | null = null;
  if (access) {
    try {
      user = await authDriver.me(access);
    } catch {
      user = null;
    }
  }

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
