"use client";

import { useTransition, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import type { DirectoryShop } from "@/lib/shops-data";
import { SortDropdown } from "@/components/tinsae/sort-dropdown";
import { SegToggle } from "./seg-toggle";
import { ShopCard, ShopCardSkeleton } from "./shop-card";

export const SHOP_SORT_OPTIONS = [
  { value: "Top rated", label: "Top rated" },
  { value: "Fastest reply", label: "Fastest reply" },
  { value: "Nearest", label: "Nearest" },
  { value: "Most listings", label: "Most listings" },
] as const;
export type SortOption = (typeof SHOP_SORT_OPTIONS)[number]["value"];

export function ShopsBrowser({
  initialShops,
}: {
  initialShops: DirectoryShop[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL state
  const currentHood = searchParams.get("area") || "All areas";
  const currentSort = (searchParams.get("sort") || "Top rated") as SortOption;
  const verifiedOnly = searchParams.get("verified_only") === "1";

  const hoods = useMemo(() => {
    const set = new Set(["All areas"]);
    const priority = ["Atlas", "Friendship", "Olympia", "Japan", "Medhanialem"];
    for (const p of priority) {
      if (initialShops.some((s) => s.hood.toLowerCase() === p.toLowerCase())) {
        set.add(p);
      }
    }
    for (const s of initialShops) {
      if (s.hood && s.hood !== "All areas") {
        set.add(s.hood);
      }
    }
    return Array.from(set);
  }, [initialShops]);

  const updateFilters = (params: { area?: string; sort?: string; verified_only?: string | null }) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (params.area !== undefined) {
      if (params.area === "All areas") sp.delete("area");
      else sp.set("area", params.area);
    }
    if (params.sort !== undefined) {
      if (params.sort === "Top rated") sp.delete("sort");
      else sp.set("sort", params.sort);
    }
    if (params.verified_only !== undefined) {
      if (!params.verified_only) sp.delete("verified_only");
      else sp.set("verified_only", "1");
    }

    startTransition(() => {
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  // Filter and Sort
  const filteredAndSorted = useMemo(() => {
    let result = [...initialShops];

    // Filter by hood
    if (currentHood !== "All areas") {
      result = result.filter(
        (s) => s.hood.toLowerCase() === currentHood.toLowerCase(),
      );
    }

    // Filter by verified
    if (verifiedOnly) {
      result = result.filter((s) => s.isVerified);
    }

    // Sort
    result.sort((a, b) => {
      if (currentSort === "Top rated") {
        return b.rating - a.rating || b.ratings - a.ratings;
      }
      if (currentSort === "Fastest reply") {
        return a.responseTime - b.responseTime;
      }
      if (currentSort === "Nearest") {
        return a.dist - b.dist;
      }
      if (currentSort === "Most listings") {
        return b.listings - a.listings;
      }
      return 0;
    });

    return result;
  }, [initialShops, currentHood, verifiedOnly, currentSort]);

  const verifiedCount = initialShops.filter((s) => s.isVerified).length;

  return (
    <div className="bg-white min-h-screen text-tn-ink pb-20">
      {/* ── HEADER / HERO ── */}
      <section className="border-b border-tn-hair2 bg-[radial-gradient(120%_120%_at_90%_-20%,#FFF1EB_0%,rgba(255,255,255,0)_50%)]">
        <div className="mx-auto max-w-[1480px] px-6 pt-9 pb-7 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="border-tn-hair text-tn-ink2 mb-3.5 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[12.5px] font-bold shadow-[0_2px_8px_rgba(11,11,11,0.03)]">
                <Icon name="shield" size={14} className="text-tn-green" />
                Every shop verified by Tinsae
              </div>
              <h1 className="text-tn-ink text-[34px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[40px]">
                The shops behind Bole&apos;s electronics
              </h1>
              <p className="text-tn-mute mt-2.5 max-w-[560px] text-base leading-relaxed font-medium">
                Browse <b className="text-tn-ink2">{verifiedCount} verified shops</b> by rating, reply
                speed, and distance.
              </p>
            </div>

            {/* List / Map Segmented Switcher */}
            <div className="shrink-0 pb-1">
              <SegToggle active="List" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY CONTROLS BAR ── */}
      <section className="sticky top-0 z-20 border-b border-tn-hair2 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-2.5 px-6 py-3.5 sm:px-8 lg:px-12 xl:px-16">
          {/* Area Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {hoods.map((hood) => {
              const active = currentHood === hood;
              return (
                <button
                  key={hood}
                  type="button"
                  onClick={() => updateFilters({ area: hood })}
                  className={`h-9 cursor-pointer rounded-full px-4 text-[13px] font-semibold transition-colors ${
                    active
                      ? "bg-tn-ink text-white shadow-xs"
                      : "border-tn-hair text-tn-ink2 hover:border-tn-ink hover:text-tn-ink border bg-white"
                  }`}
                >
                  {hood}
                </button>
              );
            })}
          </div>

          {/* Verified-Only Toggle Button */}
          <button
            type="button"
            onClick={() => updateFilters({ verified_only: verifiedOnly ? null : "1" })}
            className={`h-9 cursor-pointer rounded-full px-3.5 text-[12.5px] font-bold transition-colors inline-flex items-center gap-1.5 ${
              verifiedOnly
                ? "bg-tn-green text-white shadow-xs"
                : "border-tn-hair text-tn-ink2 hover:border-tn-green hover:text-tn-green border bg-white"
            }`}
          >
            <Icon name="shield" size={13} className={verifiedOnly ? "text-white" : "text-tn-green"} />
            Verified only
          </button>

          <div className="hidden flex-1 sm:block" />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SortDropdown
              value={currentSort}
              onChange={(sort) => updateFilters({ sort: sort as SortOption })}
              options={SHOP_SORT_OPTIONS}
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* ── SHOP CARDS GRID ── */}
      <section className="mx-auto max-w-[1480px] px-6 pt-7 sm:px-8 lg:px-12 xl:px-16">
        {isPending ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ShopCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSorted.map((shop, i) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                featured={Boolean(shop.top && currentSort === "Top rated" && i < 3)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="border-tn-hair bg-tn-paper mx-auto my-12 max-w-lg rounded-3xl border p-10 text-center">
            <div className="bg-tn-red-soft text-tn-red mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
              <Icon name="search" size={26} />
            </div>
            <h3 className="text-tn-ink text-xl font-extrabold tracking-tight">
              No shops match your criteria
            </h3>
            <p className="text-tn-mute mt-2 text-sm leading-relaxed">
              We couldn&apos;t find any shops in{" "}
              <b className="text-tn-ink">{currentHood}</b>
              {verifiedOnly ? " with verified status" : ""}. Try selecting all areas or clearing your filters.
            </p>
            <div className="mt-6 flex justify-center">
              <Pill
                kind="outline"
                size="md"
                onClick={() => updateFilters({ area: "All areas", verified_only: null })}
              >
                Reset filters
              </Pill>
            </div>
          </div>
        )}
      </section>

      {/* ── BOTTOM CTA BAND ── */}
      <section className="mx-auto mt-14 max-w-[1240px] px-6 lg:mt-16 lg:px-7">
        <div className="bg-tn-ink flex flex-wrap items-center justify-between gap-6 rounded-[22px] p-9 sm:p-11 text-white shadow-[0_24px_60px_rgba(11,11,11,0.22)]">
          <div className="max-w-[480px]">
            <h2 className="text-[26px] font-extrabold tracking-[-0.03em] sm:text-[28px]">
              Run a shop in Bole?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">
              Get verified, confirm your stock on Telegram each morning, and appear right here in
              front of ready-to-buy customers.
            </p>
          </div>
          <Pill kind="light" size="lg" iconAfter="arrow" href="/signup">
            List your shop
          </Pill>
        </div>
      </section>
    </div>
  );
}
