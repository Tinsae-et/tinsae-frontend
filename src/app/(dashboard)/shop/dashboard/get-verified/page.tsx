import type { Metadata } from "next";

import GetVerified from "@/components/shop/dashboard/get-verified/get-verified";
import { requireMerchant } from "@/lib/auth/merchant";

export const metadata: Metadata = { title: "Get verified — Tinsae" };

export default async function GetVerifiedPage() {
  const { shop } = await requireMerchant();
  return (
    <section>
      <GetVerified slug={shop.slug} shop={shop} />
    </section>
  );
}
