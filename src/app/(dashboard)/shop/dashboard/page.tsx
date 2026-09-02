import { redirect } from "next/navigation";

/**
 * Index route for /shop/dashboard.
 * Redirects directly to the canonical Overview dashboard section.
 */
export default function ShopDashboardIndex() {
  redirect("/shop/dashboard/overview");
}
