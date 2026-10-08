import React from "react";
import MapInfoSidebar from "./map-info-sidebar";
import ListingSection from "./listing-section";
import AboutTab from "./about-tab";
import PoliciesTab from "./policies-tab";
import ReviewsTab from "./reviews-tab";
import type { Shop, Product, Paginated } from "@/lib/types";

export function MainSection({
  tab,
  shop,
  initialProducts,
}: {
  tab: string;
  shop: Shop;
  initialProducts?: Paginated<Product> | null;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-7 py-8 lg:grid-cols-[1fr_320px]">
      <div className={tab === "listings" ? "block" : "hidden"}>
        <ListingSection slug={shop.slug} initialProducts={initialProducts} />
      </div>
      {tab === "about" && (
        <AboutTab shop={shop} listingsCount={initialProducts?.count ?? 0} />
      )}
      {tab === "policies" && <PoliciesTab shop={shop} />}
      {tab === "reviews" && <ReviewsTab shop={shop} />}
      {/* Map + info sidebar */}
      <MapInfoSidebar shop={shop} />
    </div>
  );
}

export default MainSection;