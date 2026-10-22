"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Icon, IconName } from "@/components/tinsae/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { cn } from "@/lib/utils";

import { LogoutButton } from "@/components/auth/logout-button";
import type { AuthShop } from "@/lib/auth/types";
import { getInitials } from "@/lib/shops-data";
import { getTelegramState } from "@/lib/api/client";
import type { TelegramState } from "@/lib/types";

type NavLinkItem = {
  to: string;
  text: string;
  icon: IconName;
  count?: number;
};

const NAVLINKS: NavLinkItem[] = [
  { to: "/shop/dashboard/overview", text: "Overview", icon: "home" },
  { to: "/shop/dashboard/listings", text: "Listings", icon: "box" },
  { to: "/shop/dashboard/inquiries", text: "Inquiries", icon: "msg" },
  { to: "/shop/dashboard/listings/new", text: "Add product", icon: "plus" },
  { to: "/shop/dashboard/shop-setting", text: "Shop settings", icon: "user" },
  { to: "/shop/dashboard/telegram", text: "Telegram setup", icon: "tg" },
  { to: "/shop/dashboard/get-verified", text: "Get verified", icon: "shield" },
];

function Links({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <div className="px-3 py-1 flex flex-col gap-0.5">
      {links.map((l) => {
        const isActive =
          pathname === l.to ||
          (l.to === "/shop/dashboard/overview" &&
            (pathname === "/shop/dashboard" ||
              pathname === "/shop/dashboard/")) ||
          (l.to === "/shop/dashboard/listings/new" &&
            (pathname === "/shop/dashboard/listings/new" ||
              pathname.startsWith("/shop/dashboard/listings/edit"))) ||
          (l.to === "/shop/dashboard/listings" &&
            pathname === "/shop/dashboard/listings") ||
          (l.to !== "/shop/dashboard/overview" &&
            l.to !== "/shop/dashboard/listings" &&
            l.to !== "/shop/dashboard/listings/new" &&
            pathname.startsWith(l.to + "/"));

        return (
          <Link
            href={l.to}
            key={l.to}
            className={cn(
              "flex items-center justify-between px-3 py-[11px] my-[2px] rounded-[11px] text-[13.5px] transition-colors",
              isActive
                ? "bg-tn-ink text-white font-bold"
                : "text-tn-ink2 font-semibold hover:bg-tn-paper",
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
                  isActive ? "bg-white text-tn-ink" : "bg-tn-red text-white",
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

function SideBar({
  showSidebar,
  shop,
}: {
  showSidebar: boolean;
  shop: AuthShop;
}) {
  const [teleState, setTeleState] = useState<TelegramState | null>(null);
  const [unreadInquiries, setUnreadInquiries] = useState<number>(0);

  useEffect(() => {
    getTelegramState(shop.slug)
      .then(setTeleState)
      .catch(() => {});

    fetch("/api/inquiries/shop/unreads")
      .then((r) => (r.ok ? r.json() : { unread_count: 0 }))
      .then((data) => setUnreadInquiries(data.unread_count ?? 0))
      .catch(() => {});
  }, [shop.slug]);

  const isConnected = teleState?.status === "connected";
  const isBlocked = teleState?.status === "blocked";

  return (
    <aside
      className={cn(
        "w-[248px] shrink-0 h-screen border-r border-tn-hair bg-white flex flex-col justify-between z-30 transition-transform",
        "fixed inset-y-0 left-0 lg:sticky lg:top-0",
        showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
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

          {/* The signed-in merchant's shop. */}
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
        <Links
          links={NAVLINKS.map((link) =>
            link.to === "/shop/dashboard/inquiries" && unreadInquiries > 0
              ? { ...link, count: unreadInquiries }
              : link,
          )}
        />

        {/* Sign out */}
        <div className="px-3 mt-1 pt-1 border-t border-tn-hair2">
          <LogoutButton variant="nav" />
        </div>
      </div>

      {/* Bot status card */}
      <div className="p-3.5 mt-auto">
        <Link
          href="/shop/dashboard/telegram"
          className={cn(
            "rounded-[14px] p-3 flex flex-col gap-1 transition hover:opacity-95 block",
            isConnected
              ? "bg-tn-green-soft"
              : isBlocked
                ? "bg-amber-50 border border-amber-200"
                : "bg-tn-paper border border-tn-hair",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon name="tg" size={14} className="text-tn-telegram shrink-0" />
              <span className="font-extrabold text-xs text-tn-ink truncate">
                {isConnected
                  ? "Bot connected"
                  : isBlocked
                    ? "Bot blocked"
                    : "Bot not linked"}
              </span>
            </div>
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                isConnected
                  ? "bg-tn-green shadow-[0_0_0_3px_#1F8A5B33]"
                  : isBlocked
                    ? "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]"
                    : "bg-tn-mute shadow-[0_0_0_3px_rgba(0,0,0,0.06)]",
              )}
            />
          </div>
          <div className="flex flex-col text-[11px] leading-snug text-tn-mute mt-0.5">
            {isConnected ? (
              <>
                <span className="text-tn-ink2 font-medium">
                  Weekly check-in
                </span>
                <span className="font-tn-mono text-[10.5px] text-tn-telegram font-semibold truncate">
                  @tinsae_et_bot
                </span>
              </>
            ) : isBlocked ? (
              <span className="text-amber-700 font-medium">
                Tap to unblock & restart
              </span>
            ) : (
              <span>Tap to connect @tinsae_et_bot</span>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}

export default SideBar;
