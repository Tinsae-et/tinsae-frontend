"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { Pill } from "@/components/tinsae/pill";
import { useSaved } from "@/hooks/use-saved";
import { getProduct } from "@/lib/api";
import { SavedListingRow, type SavedItemData } from "@/components/saved/saved-listing-row";
import { SavedSidebar } from "@/components/saved/saved-sidebar";
import { SavedEmptyState } from "@/components/saved/saved-empty-state";
import { SavedSkeleton } from "@/components/saved/saved-skeleton";

type TabId = "all" | "inStock" | "unavailable";

export default function SavedPage() {
  const { slugs, records, removeSaved, clearSaved } = useSaved();
  const [items, setItems] = useState<SavedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Refetch product data on mount and whenever slugs change
  useEffect(() => {
    let cancelled = false;

    async function fetchSavedProducts() {
      if (slugs.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const recordMap = new Map(records.map((r) => [r.slug, r.savedAt]));

      const results = await Promise.all(
        slugs.map(async (slug): Promise<SavedItemData> => {
          const savedAt = recordMap.get(slug) ?? Date.now();
          try {
            const product = await getProduct(slug);
            return { isAvailable: true, product, savedAt };
          } catch {
            return { isAvailable: false, slug, savedAt };
          }
        }),
      );

      if (!cancelled) {
        setItems(results);
        setLoading(false);
      }
    }

    fetchSavedProducts();

    return () => {
      cancelled = true;
    };
  }, [slugs, records]);

  // Tab counts
  const counts = useMemo(() => {
    const total = items.length;
    const inStock = items.filter((i) => i.isAvailable).length;
    const unavailable = items.filter((i) => !i.isAvailable).length;
    return { all: total, inStock, unavailable };
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (activeTab === "inStock") return items.filter((i) => i.isAvailable);
    if (activeTab === "unavailable") return items.filter((i) => !i.isAvailable);
    return items;
  }, [items, activeTab]);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "All saved", count: counts.all },
    { id: "inStock", label: "In stock", count: counts.inStock },
    { id: "unavailable", label: "Unavailable", count: counts.unavailable },
  ];

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      <div className="min-h-screen bg-white">
        {/* Hero band */}
        <div className="border-tn-hair2 bg-[radial-gradient(120%_100%_at_90%_-20%,#FFF1EB_0%,rgba(255,241,235,0)_50%),#FFFFFF] border-b">
          <div className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-7">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex items-center gap-1.5 text-xs text-tn-mute"
            >
              <Link href="/" className="hover:text-tn-ink transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-[#B7B5AD]" />
              <span className="font-bold text-tn-ink">Saved</span>
            </nav>

            {/* Header title & actions */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-tn-ink text-[36px] font-extrabold tracking-[-0.035em] sm:text-[46px] leading-tight">
                  Saved
                </h1>
                <p className="text-tn-mute mt-2 text-[15px] font-medium">
                  <span className="font-tn-mono text-tn-ink font-semibold">
                    {slugs.length}
                  </span>{" "}
                  {slugs.length === 1 ? "listing" : "listings"} watched
                  {items.length > 0 && (
                    <>
                      {" · "}
                      <span className="font-tn-mono text-tn-green font-semibold">
                        {counts.inStock}
                      </span>{" "}
                      in stock
                      {counts.unavailable > 0 && (
                        <>
                          {" · "}
                          <span className="font-tn-mono text-tn-red font-semibold">
                            {counts.unavailable}
                          </span>{" "}
                          unavailable
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {slugs.length > 0 && (
                  <>
                    {showClearConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            clearSaved();
                            setShowClearConfirm(false);
                          }}
                          className="bg-tn-red hover:bg-tn-red-dark h-10 rounded-full px-4 text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          Confirm clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(false)}
                          className="border-tn-hair hover:border-tn-ink h-10 rounded-full border bg-white px-4 text-xs font-bold text-tn-ink transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(true)}
                        className="border-tn-hair text-tn-mute hover:border-tn-red hover:text-tn-red flex h-10 items-center gap-1.5 rounded-full border bg-white px-4 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Clear all</span>
                      </button>
                    )}
                  </>
                )}

                <Pill kind="outline" size="md" href="/products" iconAfter="arrow">
                  Browse more
                </Pill>
              </div>
            </div>

            {/* Tabs */}
            {slugs.length > 0 && (
              <div className="mt-5 flex gap-2 border-b border-transparent">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                        isActive
                          ? "text-tn-ink border-b-[2.5px] border-tn-red -mb-[1px]"
                          : "text-tn-mute hover:text-tn-ink"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`font-tn-mono inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
                          isActive
                            ? "bg-tn-red-soft text-tn-red"
                            : "bg-tn-paper text-tn-mute"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="mx-auto flex max-w-[1240px] items-start gap-7 px-5 py-7 sm:px-7 sm:py-8">
          <main className="min-w-0 flex-1">
            {loading ? (
              <SavedSkeleton />
            ) : slugs.length === 0 ? (
              <SavedEmptyState />
            ) : filteredItems.length === 0 ? (
              <div className="border-tn-hair rounded-[18px] border bg-white p-12 text-center text-tn-mute text-sm">
                No items found under the {activeTab === "inStock" ? "in stock" : "unavailable"} filter.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {filteredItems.map((item) => (
                  <SavedListingRow
                    key={item.isAvailable ? item.product.slug : item.slug}
                    item={item}
                    onRemove={removeSaved}
                  />
                ))}
              </div>
            )}
          </main>

          <SavedSidebar />
        </div>
      </div>
    </>
  );
}
