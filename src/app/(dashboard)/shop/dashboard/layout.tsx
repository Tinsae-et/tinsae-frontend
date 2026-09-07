"use client";

import React, { useState } from "react";
import SideBar from "@/components/shop/dashboard/layout/side-bar";
import DashboardHeader from "@/components/shop/dashboard/layout/dashboard-header";

function ShopDashboardLayout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-tn-paper flex">
      {/* Mobile backdrop scrim */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-tn-ink/40 backdrop-blur-xs z-20 lg:hidden"
          aria-hidden="true"
        />
      )}

      <SideBar showSidebar={showSidebar} />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader setShowSidebar={setShowSidebar} />
        <main
          onClick={() => {
            if (showSidebar) setShowSidebar(false);
          }}
          className="flex-1 px-8 pt-[26px] pb-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default ShopDashboardLayout;