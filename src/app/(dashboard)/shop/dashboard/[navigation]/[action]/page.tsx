import React from "react"
import NewProductForm from "@/components/shop/dashboard/new-listing/new-listing";
import { readSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { authDriver } from "@/lib/auth/driver";
import { hasShop } from "@/lib/auth/roles";

async function NewListing() {
  const { access } = await readSession()
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
  return (
    <section className="">
      <NewProductForm access={access} shopSlug={shop.slug}/>
    </section>
  )
}

export default NewListing;