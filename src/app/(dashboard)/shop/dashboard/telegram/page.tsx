import type { Metadata } from "next";

import TelegramSetup from "@/components/shop/dashboard/telegram/telegram-setup";
import { getTelegramState } from "@/lib/api/server";
import { requireMerchant } from "@/lib/auth/merchant";
import type { TelegramState } from "@/lib/types";

export const metadata: Metadata = {
  title: "Telegram setup — Tinsae",
};

export default async function TelegramPage() {
  const { shop } = await requireMerchant();
  let initialState: TelegramState | undefined;
  try {
    initialState = await getTelegramState(shop.slug);
  } catch {
    // If upstream is unreachable during SSR, client-side fetch handles it
  }

  return (
    <section>
      <TelegramSetup shop={shop} initialState={initialState} />
    </section>
  );
}

