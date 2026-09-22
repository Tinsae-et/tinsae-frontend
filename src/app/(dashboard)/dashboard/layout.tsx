import type { Metadata } from "next";
import { redirect } from "next/navigation";

import DashboardShell from "@/components/shop/dashboard/layout/dashboard-shell";
import { authDriver } from "@/lib/auth/driver";
import { readSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Shop dashboard — Tinsae",
  robots: { index: false, follow: false },
};

export default async function DashboardRouteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { access } = await readSession();
  if (!access) redirect("/signin?next=/dashboard");

  const user = await authDriver.me(access).catch(() => null);
  if (!user) redirect("/signin?next=/dashboard");

  return (
    <DashboardShell
      shop={user.shops[0] ?? null}
      userName={user.full_name || user.username}
    >
      {children}
    </DashboardShell>
  );
}