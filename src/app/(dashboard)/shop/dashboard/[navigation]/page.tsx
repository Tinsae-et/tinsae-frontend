import ListingsTable from "@/components/shop/dashboard/listings/listing-table"
import Overview from "@/components/shop/dashboard/overview/overview"
import ShopProfile from "@/components/shop/dashboard/shop-profile/shop-profile"
import { readSession } from "@/lib/auth/session"


type props = {
  params: Promise<{ navigation: string }>
}
const Listings = async ({ params }: props) => {

  const { navigation } = await params;
  //test slug for the shop
  const slug = "shewa-electronics"

  if (navigation === "listings") {
    const { access } = await readSession();

    return (
      <section>
          <ListingsTable access={access} slug={slug} />
      </section>
    )
  }
  else if (navigation === "overview") {
    return (
      <section>
        <Overview />
      </section>
    )
  }
  else if (navigation === "shop-profile") {
    return (
      <section className="p-5">
        <ShopProfile />
      </section>
    )
  }
  return (
    <div>
      {navigation}
    </div>
  )
}

export default Listings;