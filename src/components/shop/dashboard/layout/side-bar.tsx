"use client";

import React from "react";
import Image from "next/image";
import { Icon, IconName } from "@/components/tinsae/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { cn } from "@/lib/utils";

import { LogoutButton } from "@/components/auth/logout-button";
import type { AuthShop } from "@/lib/auth/types";
import { getInitials } from "@/lib/shops-data";

type NavLinkItem = {
  to: string;
  text: string;
  icon: IconName;
  count?: number;
};

const NAVLINKS: NavLinkItem[] = [
  { to: "/shop/dashboard/overview", text: "Overview", icon: "home" },
  { to: "/shop/dashboard/listings", text: "Listings", icon: "box" },
  { to: "/shop/dashboard/shop-profile", text: "Shop profile", icon: "building" },
  { to: "/shop/dashboard/get-verified", text: "Get verified", icon: "shield" },
];

function Links({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <div className="px-3 py-1 flex flex-col gap-0.5">
      {links.map((l) => {
        const isActive =
          pathname === l.to ||
          pathname.startsWith(l.to + "/") ||
          (l.to === "/shop/dashboard/overview" &&
            (pathname === "/shop/dashboard" || pathname === "/shop/dashboard/"));

        return (
          <Link
            href={l.to}
            key={l.to}
            className={cn(
              "flex items-center justify-between px-3 py-[11px] my-[2px] rounded-[11px] text-[13.5px] transition-colors",
              isActive
                ? "bg-tn-ink text-white font-bold"
                : "text-tn-ink2 font-semibold hover:bg-tn-paper"
            )}
          >
            <div className="flex items-center gap-[11px]">
              <Icon
                name={l.icon}
                size={17}
                className={isActive ? "text-white" : "text-tn-mute"}
              />
              <span>{l.text}</span>
            </div>

            {typeof l.count === "number" && (
              <span
                className={cn(
                  "font-tn-mono text-[10.5px] font-bold rounded-full px-[7px] py-0.5",
                  isActive ? "bg-white text-tn-ink" : "bg-tn-red text-white"
                )}
              >
                {l.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function SideBar({ showSidebar, shop }: { showSidebar: boolean; shop: AuthShop }) {
  return (
    <aside
      className={cn(
        "w-[248px] shrink-0 h-screen border-r border-tn-hair bg-white flex flex-col justify-between z-30 transition-transform",
        "fixed inset-y-0 left-0 lg:sticky lg:top-0",
        showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div>
        {/* Header */}
        <div className="px-[18px] pt-5 pb-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex shrink-0 items-center hover:opacity-80 transition-opacity"
              aria-label="Tinsae Home"
            >
              <Image
                src="/tinsae-logo.svg"
                alt="Tinsae"
                width={184}
                height={53}
                unoptimized
                className="h-[27px] w-auto"
                priority
              />
            </Link>
            <span className="text-[9.5px] font-bold tracking-[0.04em] bg-tn-paper text-tn-ink2 px-[7px] py-[3px] rounded-full">
              SHOPS
            </span>
          </div>

          {/* The signed-in merchant's shop. This used to be a hard-coded demo
              shop, so every merchant saw "Almeda Electronics" here. */}
          <div className="flex items-center gap-2.5 bg-tn-paper border border-tn-hair2 rounded-[14px] p-[11px_12px] mt-4">
            <div className="size-[34px] rounded-[9px] bg-tn-ink text-white font-bold text-sm flex items-center justify-center shrink-0">
              {getInitials(shop.name)}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[13px] text-tn-ink truncate">
                  {shop.name}
                </span>
                {shop.is_verified && <VerifiedBadge size={11} />}
              </div>
              {shop.city && (
                <span className="font-tn-mono text-[10.5px] text-tn-mute mt-0.5 truncate">
                  {shop.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Links links={NAVLINKS} />

        {/* Sign out */}
        <div className="px-3 mt-1 pt-1 border-t border-tn-hair2">
          <LogoutButton variant="nav" />
        </div>
      </div>

      {/* PLACEHOLDER: bot status is not reported by the API yet; this card is
          the same for every shop. */}
      {/* Bot status card */}
      <div className="p-3.5 mt-auto">
        <div className="bg-tn-green-soft rounded-[14px] px-[14px] py-[13px] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="tg" size={15} className="text-tn-telegram" />
              <span className="font-extrabold text-[12.5px] text-tn-ink">
                Bot connected
              </span>
            </div>
            <span className="size-[7px] rounded-full bg-tn-green shadow-[0_0_0_3px_#1F8A5B33]" />
          </div>
          <span className="font-tn-mono text-[11px] text-tn-ink2 mt-0.5">
            Last ping 09:14 · @TinsaeStockBot
          </span>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;