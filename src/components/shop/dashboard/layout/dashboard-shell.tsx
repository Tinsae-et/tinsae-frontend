"use client";

import React, { useState } from "react";
import type { AuthShop } from "@/lib/auth/types";
import SideBar from "@/components/shop/dashboard/layout/side-bar";
import DashboardHeader from "@/components/shop/dashboard/layout/dashboard-header";

export default function DashboardShell({
  children,
  shop,
  userName,
}: {
  children: React.ReactNode;
  shop: AuthShop | null;
  userName: string;
}) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex min-h-screen bg-tn-paper">
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 z-20 bg-tn-ink/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}
      <SideBar showSidebar={showSidebar} shop={shop} userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader setShowSidebar={() => setShowSidebar(true)} />
        <main
          onClick={() => showSidebar && setShowSidebar(false)}
          className="flex-1 px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pt-[26px]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}