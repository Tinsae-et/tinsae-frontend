"use client";

import { usePathname } from "next/navigation";
import {
  ListingHeader,
  NewListingHeader,
  OverviewHeader,
  ProfileHeader,
  VerificationHeader,
} from "./headers";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

function TelegramHeader({ setShowSidebar }: { setShowSidebar: (val: boolean) => void }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setShowSidebar(true)} className="p-1 text-tn-ink hover:text-tn-red lg:hidden" aria-label="Open sidebar">
          <Icon name="menu" size={22} />
        </button>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-tn-mute">SETUP</span>
          <h1 className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink">Telegram</h1>
        </div>
      </div>
      <Pill kind="outline" size="sm" icon="tg" href="/dashboard">Back to dashboard</Pill>
    </div>
  );
}

export default function DashboardHeader({
  setShowSidebar,
}: {
  setShowSidebar: (val: boolean) => void;
}) {
  const pathname = usePathname();
  return (
    <header className="h-[72px] sticky top-0 z-10 bg-white/85 backdrop-blur-[14px] border-b border-tn-hair2 px-8 flex items-center justify-between shrink-0">
      {(pathname === "/shop/dashboard" ||
        pathname === "/shop/dashboard/overview" ||
        pathname === "/dashboard" ||
        pathname === "/dashboard/overview") && (
        <OverviewHeader setShowSidebar={setShowSidebar} />
      )}
      {(pathname === "/shop/dashboard/listings" || pathname === "/dashboard/listings") && (
        <ListingHeader setShowSidebar={setShowSidebar}/>
      )}
      {(pathname === "/shop/dashboard/listings/new" ||
        pathname === "/shop/dashboard/listings/edit" ||
        pathname === "/dashboard/listings/new" ||
        pathname === "/dashboard/listings/edit") && (
        <NewListingHeader setShowSidebar={setShowSidebar}/>
      )}
      {(pathname === "/shop/dashboard/shop-profile" || pathname === "/dashboard/shop-settings") && (
        <ProfileHeader setShowSidebar={setShowSidebar} />
      )}
      {pathname === "/shop/dashboard/get-verified" && <VerificationHeader setShowSidebar={setShowSidebar}/>} 
      {pathname === "/dashboard/telegram" && <TelegramHeader setShowSidebar={setShowSidebar} />}
    </header>
  );
}