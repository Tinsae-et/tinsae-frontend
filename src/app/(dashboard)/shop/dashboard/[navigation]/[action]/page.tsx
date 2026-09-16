import React from "react"
import { readSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { authDriver } from "@/lib/auth/driver";
import { hasShop } from "@/lib/auth/roles";
import { Form } from "@/components/shop/dashboard/new-listing/product-forms";

type Props = {
  params: Promise<{action: string}>
}
async function NewListing(props: Props) {
  const { action } = await props.params
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
      <Form access={access} shopSlug={shop.slug} action={action}/>
    </section>
  )
}

export default NewListing;