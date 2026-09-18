import { notFound, redirect } from "next/navigation";

import ListingsTable from "@/components/shop/dashboard/listings/listing-table";
import Overview from "@/components/shop/dashboard/overview/overview";
import ShopProfile from "@/components/shop/dashboard/shop-profile/shop-profile";
import { authDriver } from "@/lib/auth/driver";
import { hasShop } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";
import GetVerified from "@/components/shop/dashboard/get-verified/get-verified";

type Props = {
  params: Promise<{ navigation: string }>;
};

/**
 * The dashboard's section router.
 *
 * Resolves the signed-in merchant's own shop rather than a fixed slug. This
 * used to read `const slug = "shewa-electronics"`, which only ever worked for
 * the account that happened to own that shop: the merchant catalogue endpoint
 * filters on `owner=request.user` and answers 404 for anybody else, so every
 * other account — including one that had just registered — got an empty table
 * and no explanation.
 *
 * The proxy has already established that a session exists before this renders;
 * what it cannot know is whether that session owns a shop, which is the one
 * thing this page needs.
 */
export default async function DashboardSection({ params }: Props) {
  const { navigation } = await params;

  const { access } = await readSession();
  if (!access) redirect(`/signin?next=/shop/dashboard/${navigation}`);

  let user;
  try {
    user = await authDriver.me(access);
  } catch {
    // The proxy refreshes on the way in, so a 401 this late means the session
    // is genuinely finished rather than merely stale.
    redirect(`/signin?next=/shop/dashboard/${navigation}`);
  }

  if (!hasShop(user)) redirect("/shop/onboarding");
  const shop = user.shops[0];

  if (navigation === "listings") {
    return (
      <section>
        <ListingsTable slug={shop.slug} />
      </section>
    );
  }

  if (navigation === "overview") {
    return (
      <section>
        <Overview slug={shop.slug} shopName={shop.name} />
      </section>
    );
  }

  if (navigation === "shop-profile") {
    return (
      <section>
        <ShopProfile />
      </section>
    );
  }

  if (navigation === "get-verified") {
    return (
      <section>
        <GetVerified slug={shop.slug} shop={shop} />
      </section>
    );
  }

  notFound();
}
