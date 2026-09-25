import { DashboardShell } from "@/components/shop/dashboard/layout/dashboard-shell";
import { requireMerchant } from "@/lib/auth/merchant";

/**
 * Shell for every /shop/dashboard section.
 *
 * A Server Component, so the merchant's shop is resolved once here (and shared
 * with the page through requireMerchant's per-request cache) instead of every
 * section fetching it again. Only the mobile drawer is client-side.
 */
export default async function ShopDashboardLayout({ children }: { children: React.ReactNode }) {
  const { shop } = await requireMerchant();
  return <DashboardShell shop={shop}>{children}</DashboardShell>;
}
