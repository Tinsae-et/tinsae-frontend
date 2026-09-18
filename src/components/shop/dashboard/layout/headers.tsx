import React from "react";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import Link from "next/link";
import { Check } from "lucide-react";

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
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isEdit = pathname.includes("/edit");

  return (
    <div className="flex items-center justify-between w-full">
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
            <span className="font-bold text-tn-ink">{isEdit ? "Edit listing" : "New listing"}</span>
          </div>
          <span className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            {isEdit ? "Edit listing" : "Add a listing"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill kind="outline" size="sm">
          Save draft
        </Pill>
        <button 
          className="inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] whitespace-nowrap transition-[transform,box-shadow,background] duration-150 hover:-translate-y-px hover:bg-tn-red/90 bg-tn-red py-2 px-4 text-white cursor-pointer shadow-[0_2px_8px_rgba(204,48,0,0.2)]"
          type="submit"
          form="product-form"
        >
          <Check className="w-4 h-4"/>
          {isEdit ? "Save changes" : "Publish listing"}
        </button>
      </div>
    </div>
  );
};

export function ProfileHeader({
  setShowSidebar,
}: {
  setShowSidebar?: (val: boolean) => void;
}) {
  const [shopSlug, setShopSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.shops?.[0]?.slug) {
          setShopSlug(data.user.shops[0].slug);
        }
      })
      .catch(() => {});
  }, []);

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
        <Pill
          kind="outline"
          size="sm"
          iconAfter="arrow"
          href={shopSlug ? `/shops/${shopSlug}` : "/shops"}
        >
          View public page
        </Pill>
      </div>
    </div>
  );
}


export function VerificationHeader({
  setShowSidebar,
}: {
  setShowSidebar?: (val: boolean) => void;
}){

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
            TRUST
          </span>
          <h1 className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            Get verified
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill kind="outline" size="sm" icon="shield" href="/shop/dashboard/overview">
          Back to dashboard
        </Pill>
      </div>
    </div>
  );
}