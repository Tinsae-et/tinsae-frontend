"use client";

import { useCallback, useEffect, useState } from "react";
import ProfileForm from "./profile-form";
import ContactForm from "./contact-form";
import LocationPanel from "./location-panel";
import PhotosPanel from "./photos-panel";
import CategoriesPanel from "./categories-panel";
import TeamPanel from "./team-panel";
import { SettingsCard } from "./settings-card";
import { Pill } from "@/components/tinsae/pill";
import { Icon, IconName } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import type { Shop } from "@/lib/types";
import { getShop } from "@/lib/api/public";

type SectionId = "profile" | "location" | "photos" | "categories" | "team";

type NavItem = {
  id: SectionId;
  text: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { id: "profile", text: "Profile", icon: "user" },
  { id: "location", text: "Location & hours", icon: "pin" },
  { id: "photos", text: "Photos", icon: "gallery" },
  { id: "categories", text: "Categories", icon: "box" },
  { id: "team", text: "Team", icon: "msg" },
];

export default function ShopProfile({
  initialShop,
  slug,
  ownerName,
  ownerPhone,
  telegramUsername,
}: {
  initialShop: Shop | null;
  slug: string;
  ownerName: string;
  ownerPhone?: string;
  telegramUsername?: string;
}) {
  const [shop, setShop] = useState<Shop | null>(initialShop);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  const loadShop = useCallback(() => {
    getShop(slug, { cache: "no-store" })
      .then(setShop)
      .catch(() => setLoadFailed(true));
  }, [slug]);

  const retryLoad = () => {
    setLoadFailed(false);
    loadShop();
  };

  // The server read failed; try once from the browser before showing an error.
  useEffect(() => {
    if (!initialShop) loadShop();
  }, [initialShop, loadShop]);

  return (
    // Full width by choice: the design caps this at 1040px with a 660px panel
    // column; here the panels fill whatever the 220px nav leaves.
    <div className="w-full flex flex-col lg:flex-row gap-[30px] items-start">
      {/* Section nav: sticky column on desktop, scrolling chip row below 1024px */}
      <aside className="w-full lg:w-[220px] shrink-0 lg:sticky lg:top-[92px]">
        <nav
          aria-label="Shop profile sections"
          className="flex flex-row overflow-x-auto lg:flex-col gap-1 lg:gap-[3px] pb-1 lg:pb-0"
        >
          {NAV_ITEMS.map(({ id, text, icon }) => {
            const isActive = id === activeSection;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "px-3.5 py-[11px] rounded-xl text-sm font-bold flex items-center gap-3 transition-colors whitespace-nowrap cursor-pointer text-left shrink-0 lg:w-full",
                  isActive ? "bg-tn-red-soft text-tn-red" : "text-tn-ink2 hover:bg-tn-paper",
                )}
              >
                <Icon name={icon} size={17} className={isActive ? "text-tn-red" : "text-tn-mute"} />
                <span>{text}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 w-full">
        {!shop ? (
          <SettingsCard title="Shop profile" sub="How your shop appears across Tinsae search and listings.">
            {loadFailed ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-[13.5px] text-tn-ink2">
                  We couldn&rsquo;t load your shop details. Editing is paused so nothing gets overwritten.
                </p>
                <Pill kind="outline" size="sm" onClick={retryLoad}>
                  Try again
                </Pill>
              </div>
            ) : (
              <p className="text-[13.5px] text-tn-mute">Loading your shop…</p>
            )}
          </SettingsCard>
        ) : (
          <>
            {activeSection === "profile" && (
              <div className="flex flex-col gap-[18px]">
                <ProfileForm
                  shop={shop}
                  slug={slug}
                  telegramUsername={telegramUsername}
                  onShopUpdated={setShop}
                />
                <ContactForm shop={shop} slug={slug} onShopUpdated={setShop} />
              </div>
            )}
            {activeSection === "location" && <LocationPanel shop={shop} />}
            {activeSection === "photos" && <PhotosPanel />}
            {activeSection === "categories" && <CategoriesPanel />}
            {activeSection === "team" && (
              <TeamPanel ownerName={ownerName} ownerPhone={shop.phone || ownerPhone} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
