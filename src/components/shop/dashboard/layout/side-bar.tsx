"use client"

import React from "react"
import { Icon, IconName } from "@/components/tinsae/icon"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { VerifiedBadge } from "@/components/tinsae/verified-badge"

type link = {
  to: string,
  text: string,
  icon: IconName,
}

const NAVLINKS: link[] = [
  { to: "/shop/dashboard/overview", text: "Overview", icon: "building" },
  { to: "/shop/dashboard/listings", text: "Listings", icon: "box" },
  { to: "/shop/dashboard/inquiries", text: "Inquiries", icon: "msg" },
  { to: "/shop/dashboard/analytics", text: "Analytics", icon: "pulse" },
  { to: "/shop/dashboard/shop-profile", text: "Shop Profile", icon: "tg" },
  { to: "/shop/dashboard/telegram-bot", text: "Telegram Bot", icon: "tg" },
]

function Links({ links }: { links: link[] }) {
  const pathname = usePathname()
  return (
    <div className="p-3 flex flex-col gap-1 ">
      {
        links.map((l) => {
          const isActive = pathname === l.to || pathname.includes(l.to)
          return (
            <Link href={l.to} key={l.to} className={`flex items-center gap-2 font-semibold rounded-lg  ${isActive ? "bg-black text-white" : "hover:bg-gray-300"} py-2 px-3`}>
              <Icon name={l.icon} />
              <span>{l.text}</span>
            </Link>
          )
        }
        )
      }
    </div>
  )
}


function SideBar({ showSidebar }: { showSidebar: boolean }) {
  return (
    <section className={`h-screen w-64 border  border-gray-200 ${showSidebar ? "" : "hidden"}  lg:block z-12 fixed bg-white`}>

      <div className="flex items-center justify-between px-2">
        <div className="pt-4 flex gap-1">
          <span className="text-red-500 font-bold text-xl">ትንሳኤ</span>
          <span className="font-bold text-xl">Tinsae</span>
        </div>
        <span className="text-[10px] font-semibold bg-gray-200 px-1 rounded-full self-end mb-1">SHOPS</span>
      </div>
      <div className="flex items-center gap-2 bg-gray-100 m-3 border border-gray-300 rounded-xl p-3">
        <span className="bg-blue-900 p-2 rounded-lg font-bold text-white size-10 flex items-center justify-center">AE</span>
        <div className="flex flex-col h-10">
          <span className="font-bold w-25 flex-1 whitespace-nowrap overflow-hidden">Almeda Electronics</span>
          <span className="text-xs">Bole . Atlas</span>
        </div>
        <div className="flex items-start">
          <VerifiedBadge />
        </div>
        <Icon name="chevd" />
      </div>
      <Links links={NAVLINKS} />

      <div className="w-full px-3 absolute bottom-3 ">
        <div className="p-3 bg-blue-50 rounded-xl  w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Icon name="tg" className="text-blue-600" />
              <span className="font-bold">Bot Connected</span>
            </div>
            <div className="w-4 h-4 bg-green-200 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-800 rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">last ping 9:15</span>
            <span className="text-sm text-gray-600">@TinsaeStockBot</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SideBar;