import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ShopProfile from "@/components/shop/dashboard/shop-profile/shop-profile";
import {
  getOwnShop,
  getShopCover,
  getTelegramState,
  getVerificationState,
} from "@/lib/api/server";
import { ApiError } from "@/lib/api/public";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "Shop settings - Tinsae" };

export default async function ShopSettingsPage() {
  const { user, shop } = await requireMerchant();

  const [ownShop, cover, telegram, verification] = await Promise.all([
    // A shop this account can't read as its owner 404s: never an empty form
    // that would save blanks over someone's details. Anything else is a real
    // failure and goes to the dashboard error boundary.
    getOwnShop(shop.slug).catch((err: unknown) => {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) notFound();
      throw err;
    }),
    // The form still works without these: no cover shows the gradient, and
    // the status chips say they couldn't be read.
    getShopCover(shop.slug).catch(() => null),
    getTelegramState(shop.slug).catch(() => null),
    getVerificationState(shop.slug).catch(() => null),
  ]);

  return (
    <section>
      <ShopProfile
        initialShop={ownShop}
        initialCover={cover}
        slug={shop.slug}
        ownerName={user.full_name || user.username}
        ownerPhone={user.phone}
        telegram={telegram}
        telegramUsername={user.telegram_username}
        verification={verification}
      />
    </section>
  );
}
