import React, { useEffect, useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { confirmAllShopProducts } from "@/lib/api/client";

export const OverviewHeader = ({
  setShowSidebar,
}: {
  setShowSidebar: (val: boolean) => void;
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const formatCurrentTime = () => {
      setCurrentTime(
        new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      );
    };

    formatCurrentTime();
    const interval = window.setInterval(formatCurrentTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

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
          <span className="font-tn-mono text-xs">
            {currentTime ? `Today · ${currentTime}` : "Today"}
          </span>
        </div>

        <Pill kind="outline" size="sm" icon="bell">
          3
        </Pill>

        <Pill
          kind="solid"
          size="sm"
          icon="plus"
          href="/shop/dashboard/listings/new"
        >
          New listing
        </Pill>
      </div>
    </div>
  );
};

export const ListingHeader = ({
  setShowSidebar,
  shopSlug,
}: {
  setShowSidebar: (val: boolean) => void;
  shopSlug: string;
}) => {
  const [confirmState, setConfirmState] = useState<
    "idle" | "loading" | "success" | "empty" | "error"
  >("idle");

  const handleConfirmAll = async () => {
    if (confirmState === "loading") return;
    setConfirmState("loading");
    try {
      const confirmed = await confirmAllShopProducts(shopSlug);
      if (confirmed === 0) {
        setConfirmState("empty");
        return;
      }
      setConfirmState("success");
      window.dispatchEvent(new Event("tinsae:listings-refresh"));
    } catch {
      setConfirmState("error");
    }
  };

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
        <Pill
          kind="outline"
          size="sm"
          icon={confirmState === "loading" ? undefined : "check"}
          disabled={confirmState === "loading"}
          onClick={handleConfirmAll}
        >
          {confirmState === "loading" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Confirming...
            </>
          ) : confirmState === "success" ? (
            "All stock confirmed"
          ) : confirmState === "empty" ? (
            "No products to confirm"
          ) : confirmState === "error" ? (
            "Try again"
          ) : (
            "Confirm all stock"
          )}
        </Pill>
        <Pill
          kind="solid"
          size="sm"
          icon="plus"
          href="/shop/dashboard/listings/new"
        >
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
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
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
            <Link
              href="/shop/dashboard/listings"
              className="hover:text-tn-ink transition-colors"
            >
              Listings
            </Link>
            <Icon name="chevron" size={11} className="text-tn-mute" />
            <span className="font-bold text-tn-ink">
              {isEdit ? "Edit listing" : "New listing"}
            </span>
          </div>
          <span className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            {isEdit ? "Edit listing" : "Add a listing"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {isEdit && (
          <>
            <Pill kind="outline" size="sm">
              Save draft
            </Pill>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] whitespace-nowrap transition-[transform,box-shadow,background] duration-150 hover:-translate-y-px hover:bg-tn-red/90 bg-tn-red py-2 px-4 text-white cursor-pointer shadow-[0_2px_8px_rgba(204,48,0,0.2)]"
              type="submit"
              form="product-form"
            >
              <Check className="w-4 h-4" />
              Save changes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export function ProfileHeader({
  setShowSidebar,
  shopSlug,
}: {
  setShowSidebar?: (val: boolean) => void;
  shopSlug: string;
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
            Shop settings
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill
          kind="outline"
          size="sm"
          iconAfter="arrow"
          href={`/shops/${shopSlug}`}
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
            TRUST
          </span>
          <h1 className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            Get verified
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill
          kind="outline"
          size="sm"
          icon="shield"
          href="/shop/dashboard/overview"
        >
          Back to dashboard
        </Pill>
      </div>
    </div>
  );
}

export function TelegramHeader({
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
            TELEGRAM
          </span>
          <h1 className="text-[19px] font-extrabold tracking-[-0.025em] text-tn-ink leading-tight mt-0.5">
            Telegram setup
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Pill
          kind="outline"
          size="sm"
          icon="check"
          href="/shop/dashboard/overview"
        >
          Back to overview
        </Pill>
      </div>
    </div>
  );
}
