import React from "react";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import Link from "next/link";

export const OverviewHeader = ({
  setShowSidebar,
}: {
  setShowSidebar: (val: boolean) => void;
}) => {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSidebar(true)}
          className="lg:hidden p-1 text-tn-ink hover:text-tn-red cursor-pointer"
          aria-label="Open sidebar"
        >
          <Icon name="menu" size={22} />
        </button>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-tn-mute leading-none">
            DASHBOARD
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            Overview
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex h-[42px] px-4 rounded-full border border-tn-hair bg-white items-center gap-2 text-[13px] text-tn-ink shadow-[0_2px_8px_rgba(11,11,11,0.04)]">
          <Icon name="clock" size={15} className="text-tn-mute" />
          <span className="font-tn-mono text-xs">Today · Jun 4</span>
        </div>

        <Pill kind="outline" size="sm" icon="bell">
          3
        </Pill>

        <Pill kind="solid" size="sm" icon="plus" href="/shop/dashboard/listings/new">
          New listing
        </Pill>
      </div>
    </div>
  );
};

export const ListingHeader = ({
  setShowSidebar,
}: {
  setShowSidebar: (val: boolean) => void;
}) => {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSidebar(true)}
          className="lg:hidden p-1 text-tn-ink hover:text-tn-red cursor-pointer"
          aria-label="Open sidebar"
        >
          <Icon name="menu" size={22} />
        </button>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-tn-mute leading-none">
            DASHBOARD
          </span>
          <h1 className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            Listings
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill kind="outline" size="sm" icon="check">
          Confirm all stock
        </Pill>
        <Pill kind="solid" size="sm" icon="plus" href="/shop/dashboard/listings/new">
          New listing
        </Pill>
      </div>
    </div>
  );
};

export const NewListingHeader = ({
  setShowSidebar,
}: {
  setShowSidebar: (val: boolean) => void;
}) => {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSidebar(true)}
          className="lg:hidden p-1 text-tn-ink hover:text-tn-red cursor-pointer"
          aria-label="Open sidebar"
        >
          <Icon name="menu" size={22} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-tn-mute">
            <Link href="/shop/dashboard/listings" className="hover:text-tn-ink transition-colors">
              Listings
            </Link>
            <Icon name="chevron" size={11} className="text-tn-mute" />
            <span className="font-bold text-tn-ink">New listing</span>
          </div>
          <span className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            Add a listing
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill kind="outline" size="sm">
          Save draft
        </Pill>
        <Pill kind="solid" size="sm" icon="check">
          Publish listing
        </Pill>
      </div>
    </div>
  );
};

export function ProfileHeader({
  setShowSidebar,
}: {
  setShowSidebar?: (val: boolean) => void;
}) {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-3">
        {setShowSidebar && (
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="lg:hidden p-1 text-tn-ink hover:text-tn-red cursor-pointer"
            aria-label="Open sidebar"
          >
            <Icon name="menu" size={22} />
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-tn-mute leading-none">
            SHOP
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            Shop profile
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill kind="outline" size="sm" iconAfter="arrow" href="/">
          View public page
        </Pill>
      </div>
    </div>
  );
}