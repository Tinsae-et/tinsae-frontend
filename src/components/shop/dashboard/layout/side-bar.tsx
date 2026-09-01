"use client";

import React from "react";
import { Icon, IconName } from "@/components/tinsae/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { cn } from "@/lib/utils";

type NavLinkItem = {
  to: string;
  text: string;
  icon: IconName;
  count?: number;
};

const NAVLINKS: NavLinkItem[] = [
  { to: "/shop/dashboard/overview", text: "Overview", icon: "home" },
  { to: "/shop/dashboard/listings", text: "Listings", icon: "box" },
  { to: "/shop/dashboard/inquiries", text: "Inquiries", icon: "msg", count: 7 },
  { to: "/shop/dashboard/analytics", text: "Analytics", icon: "pulse" },
  { to: "/shop/dashboard/shop-profile", text: "Shop profile", icon: "building" },
  { to: "/shop/dashboard/get-verified", text: "Get verified", icon: "shield" },
  { to: "/shop/dashboard/telegram-bot", text: "Telegram bot", icon: "tg" },
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

function SideBar({ showSidebar }: { showSidebar: boolean }) {
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
            <div className="flex items-center gap-1.5">
              <span className="text-tn-red font-bold text-[19px] leading-none">ትንሳኤ</span>
              <span className="text-tn-ink font-extrabold text-[17px] leading-none">Tinsae</span>
            </div>
            <span className="text-[9.5px] font-bold tracking-[0.04em] bg-tn-paper text-tn-ink2 px-[7px] py-[3px] rounded-full">
              SHOPS
            </span>
          </div>

          {/* Shop Switcher */}
          <div className="flex items-center gap-2.5 bg-tn-paper border border-tn-hair2 rounded-[14px] p-[11px_12px] mt-4 cursor-pointer">
            <div className="size-[34px] rounded-[9px] bg-tn-ink text-white font-bold text-sm flex items-center justify-center shrink-0">
              AE
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[13px] text-tn-ink truncate">
                  Almeda Electronics
                </span>
                <VerifiedBadge size={11} />
              </div>
              <span className="font-tn-mono text-[10.5px] text-tn-mute mt-0.5">
                Bole · Atlas
              </span>
            </div>
            <Icon name="chevd" size={14} className="text-tn-mute shrink-0" />
          </div>
        </div>

        {/* Navigation */}
        <Links links={NAVLINKS} />
      </div>

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