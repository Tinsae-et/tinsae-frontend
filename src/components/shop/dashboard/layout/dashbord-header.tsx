"use client"
import { usePathname } from "next/navigation";
import { ListingHeader, NewListingHeader, OverviewHeader, ProfileHeader } from "./headers";



export default function DashboardHeader({ setShowSidebar }: { setShowSidebar: (val: boolean) => void }) {
    const pathname = usePathname()
    return (
        <header className="border  bg-white right-0 left-0 fixed z-5 lg:ml-64 p-4">
            {
                (pathname === "/shop/dashboard/overview") && <OverviewHeader setShowSidebar={setShowSidebar} />
            }
            {
                (pathname === "/shop/dashboard/listings") && <ListingHeader setShowSidebar={setShowSidebar} />
            }
            {
                (pathname === "/shop/dashboard/listings/new") && <NewListingHeader setShowSidebar={setShowSidebar} />
            }
            {
                (pathname === "/shop/dashboard/listings/edit") && <NewListingHeader setShowSidebar={setShowSidebar} />
            }
            {
                (pathname === "/shop/dashboard/shop-profile") && <ProfileHeader />
            }
        </header>
    )
}