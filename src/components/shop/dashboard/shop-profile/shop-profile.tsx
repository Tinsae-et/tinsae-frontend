"use client";

import React, { useState } from "react";
import ProfileForm from "./profile-form";
import ContactForm from "./contact-form";
import { Icon, IconName } from "@/components/tinsae/icon";
import Link from "next/link";
import { cn } from "@/lib/utils";
type NavItem = {
  text: string;
  href: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { text: "Profile", href: "/shop/dashboard/shop-profile", icon: "user" },
  { text: "Location & hours", href: "#", icon: "pin" },
  { text: "Photos", href: "#", icon: "camera" },
  { text: "Categories", href: "#", icon: "box" },
  { text: "Team", href: "#", icon: "msg" },
];

export default function ShopProfile({slug,access}:{slug :string,access:string}) {
  const [activeSection, setActiveSection] = useState("Profile");

  return (
    <div className="max-w-[1040px] mx-auto flex flex-col lg:flex-row gap-[30px]">
      {/* Section Nav: Sticky column on desktop, scrolling chip row on mobile */}
      <aside className="w-full lg:w-[220px] shrink-0 lg:sticky lg:top-[92px] self-start">
        <nav
          aria-label="Settings sections"
          className="flex flex-row overflow-x-auto lg:flex-col gap-1 pb-2 lg:pb-0"
        >
          {NAV_ITEMS.map(({ text, href, icon }) => {
            const isActive = text === activeSection;
            return (
              <Link
                key={text}
                href={href}
                onClick={(e) => {
                  if (href === "#") {
                    e.preventDefault();
                  }
                  setActiveSection(text);
                }}
                className={cn(
                  "px-3.5 py-[11px] rounded-xl text-sm font-bold flex items-center gap-3 transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-tn-red-soft text-tn-red"
                    : "text-tn-ink2 hover:bg-tn-paper"
                )}
              >
                <Icon
                  name={icon}
                  size={17}
                  className={isActive ? "text-tn-red" : "text-tn-mute"}
                />
                <span>{text}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Panels Column */}
      <div className="flex-1 max-w-[660px] flex flex-col gap-6">
        <ProfileForm slug={slug} access={access} />
        <ContactForm slug={slug} access={access}/>
      </div>
    </div>
  );
}