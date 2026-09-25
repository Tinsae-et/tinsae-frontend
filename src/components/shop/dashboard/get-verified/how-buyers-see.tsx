import React from "react";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "AE";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

type Props = {
  shopName?: string;
  location?: string;
  isVerified?: boolean;
};

export default function HowBuyersSee({
  shopName = "Your Shop",
  location = "Addis Ababa",
  isVerified = false,
}: Props) {
  const initials = getInitials(shopName);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
      <h3 className="text-sm font-semibold border-b border-neutral-100 px-5 py-3.5 text-neutral-900">
        How buyers will see you
      </h3>

      <div className="mt-5 mx-5 flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-[#f8f8f8] p-3.5">
        <div className="relative">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f2a4d] text-sm font-bold text-white shadow-xs">
            {initials}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate font-semibold text-sm text-neutral-900">
              {shopName}
            </span>
            {isVerified ? (
              <VerifiedBadge size={12} title="Verified shop badge" />
            ) : (
              <span
                title="Verified badge unlocked after review"
                className="size-3.5 rounded-full border border-dashed border-neutral-400 shrink-0 inline-block"
              />
            )}
          </div>
          <div className="truncate text-xs text-neutral-400 mt-0.5">
            {location} · 142 listings
          </div>
        </div>
      </div>

      <p className="m-5 text-center text-xs leading-relaxed text-neutral-400">
        {isVerified ? (
          <>
            Your{" "}
            <span className="font-semibold text-emerald-700">
              verified badge
            </span>{" "}
            is active on all listings and your public profile.
          </>
        ) : (
          <>
            Finish all 4 steps to unlock the{" "}
            <span className="font-semibold text-neutral-600">
              verified badge
            </span>{" "}
            shown here.
          </>
        )}
      </p>
    </div>
  );
}