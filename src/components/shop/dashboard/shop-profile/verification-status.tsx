import React from "react";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { cn } from "@/lib/utils";
import type { VerificationStateResponse } from "@/lib/verification";

export const VERIFICATION_EXPLAINER_HREF = "/trust-and-safety#verification";
export const VERIFICATION_REQUEST_HREF = "/shop/dashboard/get-verified";

type Status = { label: string; tone: "verified" | "pending" | "neutral" | "rejected"; request: string };

function statusOf(isVerified: boolean, verification: VerificationStateResponse | null): Status {
  if (isVerified || verification?.is_verified || verification?.state === "approved") {
    return { label: "Verified shop", tone: "verified", request: "View verification" };
  }
  switch (verification?.state) {
    case "pending":
      return { label: "In review", tone: "pending", request: "View request" };
    case "rejected":
      return { label: "Not approved", tone: "rejected", request: "See why and resubmit" };
    default:
      return { label: "Not verified", tone: "neutral", request: "Request verification" };
  }
}

const TONE_CLASS: Record<Status["tone"], string> = {
  verified: "bg-tn-green-soft text-[#157049]",
  pending: "bg-tn-warn/15 text-tn-warn",
  rejected: "bg-tn-red-soft text-tn-red",
  neutral: "bg-tn-paper border border-tn-hair text-tn-ink2",
};

/**
 * Read-only: verification is a manual check by the Tinsae team, so this only
 * reports the state and points to the explainer and the request page.
 */
export function VerificationStatus({
  isVerified,
  verification,
}: {
  isVerified: boolean;
  verification: VerificationStateResponse | null;
}) {
  const status = statusOf(isVerified, verification);
  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5">
      <div
        className={cn(
          "px-3.5 py-[9px] rounded-xl flex items-center gap-2 text-[12.5px] font-bold",
          TONE_CLASS[status.tone],
        )}
      >
        {status.tone === "verified" ? <VerifiedBadge size={14} /> : <Icon name="shield" size={14} />}
        <span>{status.label}</span>
      </div>
      <p className="text-[11.5px] text-tn-mute sm:text-right">
        Checked by the Tinsae team.{" "}
        <Link href={VERIFICATION_EXPLAINER_HREF} className="font-bold text-tn-ink underline">
          How it works
        </Link>
        {" · "}
        <Link href={VERIFICATION_REQUEST_HREF} className="font-bold text-tn-ink underline">
          {status.request}
        </Link>
      </p>
    </div>
  );
}
