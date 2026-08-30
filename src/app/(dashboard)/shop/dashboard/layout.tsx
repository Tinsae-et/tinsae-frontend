"use client"

import React, { useState } from "react"
import SideBar from "@/components/shop/dashboard/layout/side-bar"
import DashboardHeader from "@/components/shop/dashboard/layout/dashbord-header"


function ShopDashboardLayout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  return (
    <div className="flex">
      <SideBar showSidebar={showSidebar} />
      <DashboardHeader setShowSidebar={setShowSidebar} />
      <div
        onClick={() => setShowSidebar(false)}
        className="mt-20 bg-linear-to-b from-gray-100 to-white w-full min-h-screen lg:ml-64">
        {children}
      </div>
    </div>
  )
}

export default ShopDashboardLayout