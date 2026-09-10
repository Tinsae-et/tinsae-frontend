"use client";

import React from "react";
import HowBuyersSee from "./how-buyers-see";
import WhyVerification from "./why-verification";
import Banner from "./banner";
import Steps from "./steps";
import { useVerificationStatus } from "@/hooks/use-verification";
import type { AuthShop } from "@/lib/auth/types";
import { Icon } from "@/components/tinsae/icon";

type Props = {
  slug?: string;
  shop?: AuthShop;
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4" data-testid="verification-skeleton">
      {/* Banner Skeleton */}
      <div className="h-44 w-full rounded-3xl bg-neutral-200 animate-pulse" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Steps / Main form skeleton */}
        <div className="space-y-4 md:col-span-2">
          <div className="h-72 w-full rounded-2xl bg-neutral-200 animate-pulse" />
          <div className="h-48 w-full rounded-2xl bg-neutral-200 animate-pulse" />
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="h-44 w-full rounded-2xl bg-neutral-200 animate-pulse" />
          <div className="h-56 w-full rounded-2xl bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function VerificationPage({ slug = "", shop }: Props) {
  const { data, isLoading, error, refetch } = useVerificationStatus(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <Icon name="shield" className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-base font-bold text-rose-950">
            Unable to load verification status
          </h2>
          <p className="mt-1 text-xs text-rose-700">{error}</p>
          <div className="mt-4">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-900 px-4 py-2 text-xs font-bold text-white hover:bg-rose-950 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentState = data?.state ?? "not_submitted";
  const isVerified = Boolean(data?.is_verified || shop?.is_verified);
  const submittedAt = data?.submitted_at ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero banner */}
      <Banner state={currentState} isVerified={isVerified} />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Main Content (Submission form, pending card, or verified hero) */}
        <div className="space-y-4 md:col-span-2">
          <Steps
            slug={slug}
            state={currentState}
            supportingDetail={data?.supporting_detail}
            rejectionReason={data?.rejection_reason}
            submittedAt={submittedAt}
            reviewedAt={data?.reviewed_at}
            isVerified={isVerified}
            onSuccess={refetch}
          />
        </div>

        {/* Sidebar (Live preview & value unlocks) */}
        <div className="space-y-4">
          <HowBuyersSee
            shopName={shop?.name}
            location={shop?.city ? `${shop.city} · Addis Ababa` : undefined}
            isVerified={isVerified}
          />
          <WhyVerification />
        </div>
      </div>
    </div>
  );
}
