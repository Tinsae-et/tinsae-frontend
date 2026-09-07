"use client";

import { usePathname } from "next/navigation";
import {
  ListingHeader,
  NewListingHeader,
  OverviewHeader,
  ProfileHeader,
} from "./headers";

export default function DashboardHeader({
  setShowSidebar,
}: {
  setShowSidebar: (val: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <header className="h-[72px] sticky top-0 z-10 bg-white/85 backdrop-blur-[14px] border-b border-tn-hair2 px-8 flex items-center justify-between shrink-0">
      {(pathname === "/shop/dashboard" ||
        pathname === "/shop/dashboard/overview") && (
        <OverviewHeader setShowSidebar={setShowSidebar} />
      )}
      {pathname === "/shop/dashboard/listings" && (
        <ListingHeader setShowSidebar={setShowSidebar} />
      )}
      {(pathname === "/shop/dashboard/listings/new" ||
        pathname === "/shop/dashboard/listings/edit") && (
        <NewListingHeader setShowSidebar={setShowSidebar} />
      )}
      {pathname === "/shop/dashboard/shop-profile" && (
        <ProfileHeader setShowSidebar={setShowSidebar} />
      )}
    </header>
  );
}