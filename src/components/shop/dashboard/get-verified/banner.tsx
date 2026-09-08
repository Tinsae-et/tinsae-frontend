import { Icon } from "@/components/tinsae/icon";
import React from "react";
import type { VerificationState } from "@/lib/verification";

type Props = {
  state?: VerificationState;
  isVerified?: boolean;
};

export default function Banner({
  state = "not_submitted",
  isVerified = false,
}: Props) {
  const verified = isVerified || state === "approved";
  const pending = state === "pending";
  const rejected = state === "rejected";

  const stepCount = verified ? "4/4" : pending ? "2/4" : rejected ? "2/4" : "1/4";
  const stepLabel = verified
    ? "steps complete"
    : pending
      ? "under manual review"
      : rejected
        ? "action needed"
        : "steps complete";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-neutral-950 via-neutral-900 to-emerald-950 px-8 py-7 shadow-xs">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start sm:items-center gap-5">
          {/* Circular shield badge per design handoff */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black/40 border border-white/10">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                verified
                  ? "border-emerald-500 bg-emerald-950/60 text-emerald-400"
                  : pending
                    ? "border-amber-500 bg-amber-950/60 text-amber-400"
                    : rejected
                      ? "border-rose-500 bg-rose-950/60 text-rose-400"
                      : "border-emerald-500/80 bg-emerald-950/30 text-white"
              }`}
            >
              <Icon name="shield" className="h-6 w-6" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400">
              {verified
                ? "OFFICIALLY VERIFIED"
                : pending
                  ? "VERIFICATION UNDER REVIEW"
                  : rejected
                    ? "ACTION REQUIRED"
                    : "VERIFICATION IN PROGRESS"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {verified
                ? "Your shop is verified"
                : pending
                  ? "Verification in progress"
                  : rejected
                    ? "Application needs attention"
                    : "Earn your verified badge"}
            </h1>
            <p className="max-w-lg text-sm text-neutral-400 leading-relaxed">
              {verified
                ? "Your listings display the verified trust badge and appear higher in search results across Addis Ababa."
                : pending
                  ? "Our compliance team is manually inspecting your documents and storefront location. Review takes 24–48 hours."
                  : rejected
                    ? "Your submission was reviewed and returned with feedback. Review the notes below to update and resubmit."
                    : "Verified shops appear higher in search, win buyer trust, and get the badge on every listing."}
            </p>
          </div>
        </div>

        {/* Steps counter and manual SLA indicator */}
        <div className="text-left sm:text-right shrink-0">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {stepCount}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">{stepLabel}</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {verified ? "Verified merchant" : "Manual review • 24–48h SLA"}
          </div>
        </div>
      </div>
    </div>
  );
}