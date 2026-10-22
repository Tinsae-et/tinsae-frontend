"use client";

import { usePathname } from "next/navigation";
import {
  InquiriesHeader,
  ListingHeader,
  NewListingHeader,
  OverviewHeader,
  ProfileHeader,
  TelegramHeader,
  VerificationHeader,
} from "./headers";

export default function DashboardHeader({
  setShowSidebar,
  shopSlug,
}: {
  setShowSidebar: (val: boolean) => void;
  shopSlug: string;
}) {
  const pathname = usePathname();
  return (
    <header className="h-[72px] sticky top-0 z-10 bg-white/85 backdrop-blur-[14px] border-b border-tn-hair2 px-4 sm:px-8 flex items-center justify-between shrink-0">
      {(pathname === "/shop/dashboard" ||
        pathname === "/shop/dashboard/overview") && (
        <OverviewHeader setShowSidebar={setShowSidebar} />
      )}
      {pathname === "/shop/dashboard/listings" && (
        <ListingHeader setShowSidebar={setShowSidebar} shopSlug={shopSlug} />
      )}
      {pathname.startsWith("/shop/dashboard/inquiries") && (
        <InquiriesHeader setShowSidebar={setShowSidebar} />
      )}
      {(pathname === "/shop/dashboard/listings/new" ||
        pathname === "/shop/dashboard/listings/edit") && (
        <NewListingHeader setShowSidebar={setShowSidebar} />
      )}
      {pathname === "/shop/dashboard/shop-setting" && (
        <ProfileHeader setShowSidebar={setShowSidebar} shopSlug={shopSlug} />
      )}
      {pathname === "/shop/dashboard/telegram" && (
        <TelegramHeader setShowSidebar={setShowSidebar} />
      )}
      {pathname === "/shop/dashboard/get-verified" && (
        <VerificationHeader setShowSidebar={setShowSidebar} />
      )}
    </header>
  );
}
