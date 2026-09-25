"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import type { AuthShop } from "@/lib/auth/types";
import SideBar from "./side-bar";
import DashboardHeader from "./dashboard-header";

/**
 * The interactive half of the dashboard layout: only the mobile sidebar
 * drawer needs client state. The layout itself stays a Server Component, so
 * it can resolve the merchant's shop once and hand it down.
 */
export function DashboardShell({
  shop,
  children,
}: {
  shop: AuthShop;
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const pathname = usePathname();

  // Close the drawer after navigating, and on Escape.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setShowSidebar(false);
  }

  useEffect(() => {
    if (!showSidebar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSidebar(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSidebar]);

  return (
    <div className="min-h-screen bg-tn-paper flex">
      {showSidebar && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-tn-ink/40 backdrop-blur-xs z-20 lg:hidden"
        />
      )}

      <SideBar showSidebar={showSidebar} shop={shop} />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader setShowSidebar={setShowSidebar} shopSlug={shop.slug} />
        <main className="flex-1 px-4 pt-[26px] pb-12 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
