"use client";

import React, { useState, useEffect } from "react";
import ProfileForm from "./profile-form";
import ContactForm from "./contact-form";
import LocationPanel from "./location-panel";
import PhotosPanel from "./photos-panel";
import CategoriesPanel from "./categories-panel";
import TeamPanel from "./team-panel";
import { Icon, IconName } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import type { Shop } from "@/lib/types";
import { getShop } from "@/lib/api";

type SectionId = "profile" | "location" | "photos" | "categories" | "team";

type NavItem = {
  id: SectionId;
  text: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { id: "profile", text: "Profile", icon: "user" },
  { id: "location", text: "Location & hours", icon: "pin" },
  { id: "photos", text: "Photos", icon: "camera" },
  { id: "categories", text: "Categories", icon: "box" },
  { id: "team", text: "Team", icon: "msg" },
];

export default function ShopProfile({
  initialShop,
  slug,
  access,
}: {
  initialShop?: Shop | null;
  slug: string;
  access: string;
}) {
  const [shop, setShop] = useState<Shop | null>(initialShop ?? null);
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  useEffect(() => {
    if (!shop) {
      getShop(slug)
        .then((res) => setShop(res))
        .catch(() => {
          // Handled gracefully in child forms
        });
    }
  }, [slug, shop]);

  return (
    <div className="max-w-[1040px] mx-auto flex flex-col lg:flex-row gap-[30px] items-start">
      {/* Section Nav: Sticky column on desktop, scrolling chip row on mobile */}
      <aside className="w-full lg:w-[220px] shrink-0 lg:sticky lg:top-[92px]">
        <nav
          aria-label="Shop settings sections"
          className="flex flex-row overflow-x-auto lg:flex-col gap-1 pb-2 lg:pb-0"
        >
          {NAV_ITEMS.map(({ id, text, icon }) => {
            const isActive = id === activeSection;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "px-3.5 py-[11px] rounded-xl text-sm font-bold flex items-center gap-3 transition-colors whitespace-nowrap cursor-pointer text-left w-full",
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
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Panels Column */}
      <div className="flex-1 max-w-[660px] w-full">
        {activeSection === "profile" && (
          <div className="flex flex-col gap-6">
            <ProfileForm
              key={
                shop
                  ? `profile-${shop.id}-${shop.name}`
                  : `profile-${slug}`
              }
              shop={shop}
              slug={slug}
              access={access}
              onShopUpdated={setShop}
            />
            <ContactForm
              key={
                shop ? `contact-${shop.id}-${shop.phone}` : `contact-${slug}`
              }
              shop={shop}
              slug={slug}
              access={access}
              onShopUpdated={setShop}
            />
          </div>
        )}

        {activeSection === "location" && (
          <LocationPanel shop={shop} slug={slug} />
        )}

        {activeSection === "photos" && <PhotosPanel />}

        {activeSection === "categories" && <CategoriesPanel />}

        {activeSection === "team" && <TeamPanel shop={shop} />}
      </div>
    </div>
  );
}