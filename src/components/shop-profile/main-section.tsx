import React from "react";
import MapInfoSidebar from "./map-info-sidebar";
import ListingSection from "./listing-section";
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
      {tab === "listings" ? (
        <ListingSection slug={shop.slug} initialProducts={initialProducts} />
      ) : (
        <div className="border-tn-hair rounded-2xl border bg-white p-8 text-center">
          <h3 className="text-tn-ink text-lg font-bold capitalize">{tab}</h3>
          <p className="text-tn-mute mt-1.5 text-sm">
            Detailed {tab} information for {shop.name} is coming soon.
          </p>
        </div>
      )}
      {/* Map + info sidebar */}
      <MapInfoSidebar shop={shop} />
    </div>
  );
}

export default MainSection;