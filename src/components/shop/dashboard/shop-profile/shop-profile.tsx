"use client";

import { useCallback, useState } from "react";
import ProfileForm from "./profile-form";
import ContactForm from "./contact-form";
import LocationPanel from "./location-panel";
import CategoriesPanel from "./categories-panel";
import TeamPanel from "./team-panel";
import { Icon, IconName } from "@/components/tinsae/icon";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { cn } from "@/lib/utils";
import type { Shop, ShopPhoto, TelegramState } from "@/lib/types";
import type { VerificationStateResponse } from "@/lib/verification";

type SectionId = "profile" | "location" | "categories" | "team";

type NavItem = {
  id: SectionId;
  text: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { id: "profile", text: "Profile", icon: "user" },
  { id: "location", text: "Location", icon: "pin" },
  { id: "categories", text: "Categories", icon: "box" },
  { id: "team", text: "Team", icon: "msg" },
];

export default function ShopProfile({
  initialShop,
  initialCover,
  slug,
  ownerName,
  ownerPhone,
  telegram,
  telegramUsername,
  verification,
}: {
  initialShop: Shop;
  initialCover: ShopPhoto | null;
  slug: string;
  ownerName: string;
  ownerPhone?: string;
  telegram: TelegramState | null;
  telegramUsername?: string;
  verification: VerificationStateResponse | null;
}) {
  const [shop, setShop] = useState<Shop>(initialShop);
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  // Each form reports whether it holds unsaved edits; one page-level guard
  // then covers reloads and links out of settings.
  const [dirtyForms, setDirtyForms] = useState<Record<string, boolean>>({});
  const markDirty = useCallback((form: string, dirty: boolean) => {
    setDirtyForms((prev) => (Boolean(prev[form]) === dirty ? prev : { ...prev, [form]: dirty }));
  }, []);
  useUnsavedChangesWarning(Object.values(dirtyForms).some(Boolean));

  return (
    // Full width by choice: the design caps this at 1040px with a 660px panel
    // column; here the panels fill whatever the 220px nav leaves.
    <div className="w-full flex flex-col lg:flex-row gap-[30px] items-start">
      {/* Section nav: sticky column on desktop, scrolling chip row below 1024px */}
      <aside className="w-full lg:w-[220px] shrink-0 lg:sticky lg:top-[92px]">
        <nav
          aria-label="Shop settings sections"
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
                  isActive
                    ? "bg-tn-red-soft text-tn-red"
                    : "text-tn-ink2 hover:bg-tn-paper",
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

      {/* Every section stays mounted, so switching sections keeps unsaved edits. */}
      <div className="flex-1 min-w-0 w-full">
        <div
          className={cn(
            "flex-col gap-[18px]",
            activeSection === "profile" ? "flex" : "hidden",
          )}
        >
          <ProfileForm
            shop={shop}
            slug={slug}
            initialCover={initialCover}
            telegram={telegram}
            telegramUsername={telegramUsername}
            verification={verification}
            onShopUpdated={setShop}
            onDirtyChange={(dirty) => markDirty("profile", dirty)}
          />
          <ContactForm
            shop={shop}
            slug={slug}
            onShopUpdated={setShop}
            onDirtyChange={(dirty) => markDirty("contact", dirty)}
          />
        </div>
        <div hidden={activeSection !== "location"}>
          <LocationPanel
            shop={shop}
            slug={slug}
            onShopUpdated={setShop}
            onDirtyChange={(dirty) => markDirty("location", dirty)}
          />
        </div>
        <div hidden={activeSection !== "categories"}>
          <CategoriesPanel
            shop={shop}
            slug={slug}
            onShopUpdated={setShop}
            onDirtyChange={(dirty) => markDirty("categories", dirty)}
          />
        </div>
        <div hidden={activeSection !== "team"}>
          <TeamPanel ownerName={ownerName} ownerPhone={shop.phone || ownerPhone} />
        </div>
      </div>
    </div>
  );
}
