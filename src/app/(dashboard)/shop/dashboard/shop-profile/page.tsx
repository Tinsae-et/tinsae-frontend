import type { Metadata } from "next";

import ShopProfile from "@/components/shop/dashboard/shop-profile/shop-profile";
import { getShop } from "@/lib/api/public";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "Shop profile — Tinsae" };

export default async function ShopProfilePage() {
  const { user, shop } = await requireMerchant();
  // The editor must start from what Django has now, not the public pages'
  // cached copy, or a second edit would begin from stale values.
  const fullShop = await getShop(shop.slug, { cache: "no-store" }).catch(() => null);

  return (
    <section>
      <ShopProfile
        initialShop={fullShop}
        slug={shop.slug}
        ownerName={user.full_name || user.username}
        ownerPhone={user.phone}
        telegramUsername={user.telegram_username}
      />
    </section>
  );
}
