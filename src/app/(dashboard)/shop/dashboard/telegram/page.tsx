import type { Metadata } from "next";

import TelegramSetup from "@/components/shop/dashboard/telegram/telegram-setup";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = {
  title: "Telegram setup — Tinsae",
};

export default async function TelegramPage() {
  const { shop } = await requireMerchant();
  return (
    <section>
      <TelegramSetup shop={shop} />
    </section>
  );
}
