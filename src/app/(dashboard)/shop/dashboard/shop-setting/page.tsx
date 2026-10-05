import type { Metadata } from "next";

import ShopProfile from "@/components/shop/dashboard/shop-setting/shop-setting";
import { getShop } from "@/lib/api/public";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "Shop settings - Tinsae" };

export default async function ShopSettingsPage() {
  const { user, shop } = await requireMerchant();
  const fullShop = await getShop(shop.slug, { cache: "no-store" }).catch(
    () => null,
  );

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
