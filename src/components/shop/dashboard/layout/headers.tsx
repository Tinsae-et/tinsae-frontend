import React from "react"
import { Icon } from "@/components/tinsae/icon"
import Link from "next/link"
import { usePathname } from "next/navigation"


export const OverviewHeader = ({ setShowSidebar }: { setShowSidebar: (val: boolean) => void }) => {
    return (
        <div className="flex items-center justify-between bg-white">
            <div className="flex gap-2 items-center justify-center">
                <button
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden cursor-pointer">
                    <Icon name="menu" className="h-10 w-10" />
                </button>
                <div className="flex gap-0 flex-col">
                    <span className="text-xs font-semibold text-gray-500">DASHBOARD</span>
                    <span className="font-bold text-sm">Overview</span>
                </div>
            </div>

            <div className="flex gap-1">
                <button className="md:flex items-center py-2 border hidden rounded-full px-3 text-xs gap-2">
                    <Icon name="clock" />
                    <span>Today </span>
                    <span> Jan</span>
                </button>

                <button className="flex items-center py-2 border rounded-full px-3 text-xs gap-1">
                    <Icon name="bell" size={14} />
                    <span>3</span>
                </button>

                <Link href="/shop/dashboard/listings/new" className="flex items-center whitespace-nowrap shadow-red-300 shadow-lg px-3 rounded-full bg-red-700 text-white text-xs">
                    <Icon name="plus" />
                    New Listing
                </Link>
            </div>
        </div>
    )
}

export const ListingHeader = ({ setShowSidebar }: { setShowSidebar: (val: boolean) => void }) => {

    return (
        <div className="flex items-center justify-between bg-white">
            <div className="flex gap-2 items-center">
                <button
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden cursor-pointer self-start">
                    <Icon name="menu" className="h-10 w-10" />
                </button>
                <div>
                    <h1 className="font-bold text-sm">Listings</h1>
                    <p className="text-xs text-gray-500"><span className="text-black font-bold">12</span> live <span className="text-red-500 font-bold">4</span>  need attention <span className="text-black font-bold">2</span> draft</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex items-center whitespace-nowrap font-bold text-xs p-2 border border-gray-200 rounded-full">
                    <Icon name="check" />
                    Confirm all Stock
                </button>
                <Link href="/shop/dashboard/listings/new" className="flex items-center whitespace-nowrap shadow-red-300 shadow-lg px-3 rounded-full bg-red-700 text-white text-xs">
                    <Icon name="plus" />
                    New Listing
                </Link>

                <button className="md:flex text-xs border hidden border-gray-200 px-4 rounded-lg">
                    Empty <br /> State
                </button>
            </div>
        </div>
    )
}

export const NewListingHeader = ({ setShowSidebar }: { setShowSidebar: (val: boolean) => void }) => {
    const pathname = usePathname();
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden cursor-pointer self-start">
                    <Icon name="menu" className="h-10 w-10" />
                </button>
                <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center">
                        <Link href="/shop/dashboard/listings">
                            Listing
                        </Link>
                        <Icon name="chevron" size={15} />
                        <Link href="/shop/dashboard/listings/new" className="font-bold">
                            New listing
                        </Link>
                    </div>
                    <span className="text-black font-bold text-lg">Add a listing</span>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="md:flex hidden border border-gray-300 gap-3 p-1 rounded-full text-xs">
                    <button className={`px-4 rounded-full ${pathname.endsWith("new") && "bg-black text-white font-bold"}`}>
                        New
                    </button>
                    <button className={`px-4 rounded-full ${pathname.endsWith("edit") && "bg-black text-white font-bold"}`}>
                        Edit <br /> Sample
                    </button>
                </div>
                <button className="px-4 border text-xs whitespace-nowrap border-gray-300 rounded-full text-balck font-bold">
                    Save draft
                </button>
                <button className="flex items-center text-xs whitespace-nowrap px-4 border border-gray-200 rounded-full ">
                    <Icon name="check" />
                    Publish listing
                </button>
            </div>

        </div>
    )
}


export function ProfileHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <span className="flex gap-3 text-sm">
                    SHOP
                </span>
                <span className="text-black font-bold">Shop profile</span>
            </div>
            <div className="flex gap-2">
                <Link href="/" className="flex items-center text-lg py-1 whitespace-nowrap px-4 border border-gray-200 rounded-full ">
                    View public pages
                    <Icon name="arrow" />
                </Link>
            </div>

        </div>
    )
}