"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Tag,
  Trash,
} from "lucide-react";

import { Icon } from "@/components/tinsae/icon";
import { ListingRow } from "./listing-row";
import DeleteListing from "./delete-listing";
import { ShopProduct } from "@/lib/types";
import {
  confirmSelectedFreshness,
  confirmFreshness,
  markSold,
  pauseProduct,
  resumeProduct,
  ShopProductQuery,
} from "@/lib/api";
import { useShopProducts } from "@/hooks/use-products";
import { formatETB, Freshness, freshness } from "@/lib/format";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { Pill } from "@/components/tinsae/pill";
import { cn } from "@/lib/utils";

type TabKey = "all" | "live" | "needs-attention" | "drafts" | "sold";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "needs-attention", label: "Needs attention" },
  { key: "drafts", label: "Drafts" },
  { key: "sold", label: "Sold" },
];

function StatusFilter({
  activeTab,
  setActiveTab,
  products,
  total,
}: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  products: ShopProduct[];
  total: number;
}) {
  const counts = useMemo(() => {
    let live = 0;
    let needsAttention = 0;
    let sold = 0;
    let drafts = 0;

    for (const p of products) {
      if (p.is_available) {
        live++;
        const f = freshness(p.last_confirmed_at, p.confirmation_status);
        if (f.tone !== "fresh") {
          needsAttention++;
        }
      } else if (p.status === "draft") {
        drafts++;
      } else {
        sold++;
      }
    }

    return {
      all: total || products.length,
      live,
      "needs-attention": needsAttention,
      drafts,
      sold,
    };
  }, [products, total]);

  return (
    <div className="bg-white border-b border-tn-hair px-7 flex items-center overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "py-[15px] px-1.5 mx-2.5 text-[13.5px] font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors border-b-2",
              isActive
                ? "text-tn-ink border-tn-ink"
                : "text-tn-mute border-transparent hover:text-tn-ink",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "font-tn-mono text-[11px] font-bold px-[7px] py-px rounded-full",
                isActive ? "bg-tn-ink text-white" : "bg-tn-paper text-tn-mute",
              )}
            >
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ToolBar({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  ordering,
  setOrdering,
  view,
  setView,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  ordering: string;
  setOrdering: (o: string) => void;
  view: "rows" | "grid";
  setView: (view: "rows" | "grid") => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-[360px]">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tn-mute"
          size={16}
        />
        <input
          type="text"
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[42px] rounded-[11px] border border-tn-hair bg-white pl-9 pr-3 text-sm text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-[42px] rounded-[11px] border border-tn-hair bg-white px-3.5 text-sm font-bold text-tn-ink cursor-pointer focus:outline-none focus:border-tn-ink"
        >
          <option value="">All categories</option>
          <option value="phones">Phones</option>
          <option value="laptops">Laptops</option>
          <option value="audio">Audio</option>
          <option value="tablets">Tablets</option>
          <option value="accessories">Accessories</option>
          <option value="cameras">Cameras</option>
        </select>

        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="h-[42px] rounded-[11px] border border-tn-hair bg-white px-3.5 text-sm font-semibold text-tn-ink cursor-pointer focus:outline-none focus:border-tn-ink"
        >
          <option value="-created_at">Newest first</option>
          <option value="last_confirmed_at">Oldest confirmed</option>
          <option value="-last_confirmed_at">Recently confirmed</option>
          <option value="-price">Price: high → low</option>
          <option value="price">Price: low → high</option>
        </select>

        <div className="p-[3px] rounded-[10px] border border-tn-hair bg-tn-paper flex items-center gap-1 ml-auto md:ml-0">
          <button
            type="button"
            aria-label="Table view"
            onClick={() => setView("rows")}
            className={cn(
              "w-[38px] h-[34px] rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              view === "rows"
                ? "bg-tn-ink text-white"
                : "text-tn-mute hover:text-tn-ink",
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => setView("grid")}
            className={cn(
              "w-[38px] h-[34px] rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              view === "grid"
                ? "bg-tn-ink text-white"
                : "text-tn-mute hover:text-tn-ink",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TableHeader({
  allSelected,
  toggleAll,
}: {
  allSelected: boolean;
  toggleAll: () => void;
}) {
  return (
    <thead>
      <tr className="border-b border-tn-hair2 bg-tn-paper text-[10.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
        <th className="w-12 py-3 pl-5 pr-2 text-left">
          <button
            type="button"
            role="checkbox"
            aria-checked={allSelected}
            aria-label="Select all visible listings"
            onClick={toggleAll}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors cursor-pointer",
              allSelected
                ? "border-tn-red bg-tn-red text-white"
                : "border-tn-hair bg-white",
            )}
          >
            {allSelected && <Icon name="check" size={12} strokeWidth={3} />}
          </button>
        </th>
        <th className="px-3 py-3 text-left">Product</th>
        <th className="px-3 py-3 text-right">Price</th>
        <th className="px-3 py-3 text-left">Stock · status</th>
        <th className="px-3 py-3 text-left">Confirmed</th>
        <th className="px-3 py-3 text-right">Views</th>
        <th className="px-3 py-3 text-right">Inq</th>
        <th className="py-3 pl-2 pr-5 text-right">Actions</th>
      </tr>
    </thead>
  );
}

function ListingGridCard({
  product,
  shopSlug,
  isSelected,
  toggleOne,
  openMenuId,
  setOpenMenuId,
  onProductUpdated,
  onProductDeleted,
  onError,
}: {
  product: ShopProduct;
  shopSlug: string;
  isSelected: boolean;
  toggleOne: (slug: string) => void;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  onProductUpdated?: (updated: ShopProduct) => void;
  onProductDeleted?: (slug: string) => void;
  onError?: (msg: string) => void;
}) {
  const [fresh, setFresh] = useState<Freshness>(() =>
    freshness(product.last_confirmed_at, product.confirmation_status),
  );
  const [available, setAvailable] = useState<boolean>(product.is_available);
  const [status, setStatus] = useState<string>(product.status || (product.is_available ? "live" : "sold"));
  const [inFlightAction, setInFlightAction] = useState<"confirm" | "pause" | "resume" | "sold" | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const isMenuOpen = openMenuId === product.id;
  const needConfirm = available && fresh.tone !== "fresh";

  const dotColor =
    fresh.tone === "fresh"
      ? "bg-tn-green shadow-[0_0_0_3px_#1F8A5B22]"
      : fresh.tone === "stale"
        ? "bg-tn-mute"
        : "bg-tn-warn";

  const handleConfirm = async () => {
    if (inFlightAction) return;
    const prevFresh = fresh;
    setInFlightAction("confirm");
    setCardError(null);

    // Optimistic UI update
    setFresh({ ...fresh, tone: "fresh", age: "Just now", confirmed: "Confirmed moments ago" });

    try {
      const updated = await confirmFreshness(shopSlug, product.slug);
      setFresh(freshness(updated.last_confirmed_at, updated.confirmation_status));
      setAvailable(updated.is_available);
      onProductUpdated?.(updated);
    } catch {
      // Rollback
      setFresh(prevFresh);
      const err = `Failed to confirm "${product.name}".`;
      setCardError(err);
      onError?.(err);
    } finally {
      setInFlightAction(null);
    }
  };

  const handlePauseToggle = async () => {
    if (inFlightAction) return;
    const prevAvailable = available;
    const prevStatus = status;
    const action = available ? "pause" : "resume";
    setInFlightAction(action);
    setCardError(null);
    setOpenMenuId(null);

    // Optimistic update
    setAvailable(!available);
    setStatus(available ? "paused" : "live");

    try {
      const updated = available
        ? await pauseProduct(shopSlug, product.slug)
        : await resumeProduct(shopSlug, product.slug);
      setAvailable(updated.is_available);
      setStatus(updated.status || (updated.is_available ? "live" : "paused"));
      onProductUpdated?.(updated);
    } catch {
      // Rollback
      setAvailable(prevAvailable);
      setStatus(prevStatus);
      const err = `Failed to ${action} "${product.name}".`;
      setCardError(err);
      onError?.(err);
    } finally {
      setInFlightAction(null);
    }
  };

  const handleMarkSold = async () => {
    if (inFlightAction) return;
    const prevAvailable = available;
    const prevStatus = status;
    setInFlightAction("sold");
    setCardError(null);
    setOpenMenuId(null);

    // Optimistic update
    setAvailable(false);
    setStatus("sold");

    try {
      const updated = await markSold(shopSlug, product.slug);
      setAvailable(updated.is_available);
      setStatus(updated.status || "sold");
      onProductUpdated?.(updated);
    } catch {
      // Rollback
      setAvailable(prevAvailable);
      setStatus(prevStatus);
      const err = `Failed to mark "${product.name}" as sold.`;
      setCardError(err);
      onError?.(err);
    } finally {
      setInFlightAction(null);
    }
  };

  const getImage = () => {
    if (!product.images || product.images.length === 0) return "";
    const image = product.images.find((i) => i.is_primary) ?? product.images[0];
    return image?.url || "";
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border-[1.5px] overflow-hidden flex flex-col justify-between transition-all",
        isSelected
          ? "border-tn-red ring-[3px] ring-tn-red/10"
          : "border-tn-hair hover:border-tn-hair/80",
      )}
    >
      <div className="aspect-[16/10] bg-tn-paper relative flex items-center justify-center overflow-hidden">
        {getImage() ? (
          <Image
            src={getImage()}
            alt={product.name}
            width={240}
            height={150}
            className="object-cover size-full"
          />
        ) : (
          <ProdPlaceholder kind={kindForSlug(product.category)} />
        )}

        {/* Checkbox overlay top-left */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Select ${product.name}`}
          onClick={() => toggleOne(product.slug)}
          className={cn(
            "size-[22px] rounded-[7px] border flex items-center justify-center absolute top-2.5 left-2.5 transition-colors cursor-pointer z-10",
            isSelected
              ? "border-tn-red bg-tn-red text-white"
              : "border-white/70 bg-black/25 text-transparent hover:border-white",
          )}
        >
          {isSelected && <Icon name="check" size={13} strokeWidth={3} />}
        </button>

        {/* Status tag top-right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {available ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-green-soft text-tn-green shadow-xs">
              Live
            </span>
          ) : status === "sold" ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-paper text-tn-mute shadow-xs">
              Sold
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 shadow-xs">
              Paused
            </span>
          )}
        </div>

        {/* Freshness chip bottom-left */}
        {available && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/92 backdrop-blur-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs z-10">
            <span className={cn("size-2 rounded-full", dotColor)} />
            <span className="font-tn-mono text-[11px] font-semibold text-tn-ink">
              {fresh.age}
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
            {product.category || "General"}
          </span>
          <h3 className="text-[14.5px] font-extrabold text-tn-ink truncate mt-0.5">
            {product.name}
          </h3>
          <p className="text-xs text-tn-mute truncate mt-0.5">
            {product.description ? `${product.description} · ` : ""}
            {product.condition || "New"}
          </p>

          {cardError && (
            <p className="text-[11px] font-semibold text-tn-red mt-1">
              {cardError}
            </p>
          )}

          <div className="mt-2.5 flex items-center justify-between">
            <span className="font-tn-mono text-[15px] font-semibold text-tn-ink">
              {formatETB(product.price)}
            </span>
            <span
              className={cn(
                "font-tn-mono text-xs",
                product.stock === 0 ? "text-tn-red font-semibold" : "text-tn-mute",
              )}
            >
              {product.stock !== undefined ? `${product.stock} in stock` : "—"}
            </span>
          </div>

          <div className="mt-1 text-[11px] font-tn-mono text-tn-mute">
            {available ? fresh.confirmed : "—"}
          </div>
        </div>

        <div>
          <div className="my-2.5 border-t border-tn-hair2" />
          <div className="flex items-center justify-between">
            <span className="font-tn-mono text-xs text-tn-mute">
              {product.views ?? "—"} views · {product.inquiries ?? "—"} inq
            </span>

            <div className="flex items-center gap-2">
              {needConfirm ? (
                <Pill
                  kind="solid"
                  size="sm"
                  icon="check"
                  disabled={Boolean(inFlightAction)}
                  onClick={handleConfirm}
                >
                  {inFlightAction === "confirm" ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Pill>
              ) : (
                <button
                  type="button"
                  aria-label="Listing confirmed"
                  className="size-8 rounded-full border border-tn-hair flex items-center justify-center text-tn-green bg-white cursor-default"
                >
                  <Icon name="check" size={14} />
                </button>
              )}

              <div className="relative inline-block" data-row-action>
                <button
                  type="button"
                  aria-label="Row actions"
                  aria-expanded={isMenuOpen}
                  onClick={() => setOpenMenuId(isMenuOpen ? null : product.id)}
                  className="size-8 rounded-full border border-tn-hair flex items-center justify-center text-tn-mute hover:border-tn-ink hover:text-tn-ink transition-colors bg-white cursor-pointer"
                >
                  <MoreHorizontal className="size-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1 z-30 min-w-[140px] rounded-[12px] border border-tn-hair bg-white p-1.5 shadow-[0_8px_24px_rgba(11,11,11,0.12)] flex flex-col gap-1 text-left">
                    <Link
                      href={`/shop/dashboard/listings/edit?slug=${product.slug}`}
                      onClick={() => setOpenMenuId(null)}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-tn-ink hover:bg-tn-paper cursor-pointer"
                    >
                      <Pencil className="size-3.5 text-tn-mute" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={Boolean(inFlightAction)}
                      onClick={handlePauseToggle}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 cursor-pointer disabled:opacity-50"
                    >
                      {inFlightAction === "pause" || inFlightAction === "resume" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : available ? (
                        <Pause className="size-3.5 text-amber-600" />
                      ) : (
                        <Play className="size-3.5 text-green-600" />
                      )}
                      {available ? "Pause listing" : "Resume listing"}
                    </button>

                    {available && (
                      <button
                        type="button"
                        disabled={Boolean(inFlightAction)}
                        onClick={handleMarkSold}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50 cursor-pointer disabled:opacity-50"
                      >
                        {inFlightAction === "sold" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Tag className="size-3.5 text-blue-700" />
                        )}
                        Mark as sold
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={Boolean(inFlightAction)}
                      onClick={() => {
                        setOpenMenuId(null);
                        setShowDeleteModal(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-tn-red hover:bg-tn-red-soft cursor-pointer disabled:opacity-50"
                    >
                      <Trash className="size-3.5 text-tn-red" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteListing
          product={product}
          shopSlug={shopSlug}
          setDeleteItem={setShowDeleteModal}
          onDeleted={onProductDeleted}
        />
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-[18px] border border-tn-hair bg-white overflow-hidden animate-pulse">
      <div className="h-10 bg-tn-paper border-b border-tn-hair2" />
      <div className="divide-y divide-tn-hair2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center px-5 py-4 gap-4">
            <div className="size-4 bg-tn-paper rounded" />
            <div className="size-10 bg-tn-paper rounded-[10px]" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 bg-tn-paper rounded" />
              <div className="h-2.5 w-1/4 bg-tn-paper rounded" />
            </div>
            <div className="h-4 w-20 bg-tn-paper rounded" />
            <div className="h-6 w-16 bg-tn-paper rounded-full" />
            <div className="h-8 w-20 bg-tn-paper rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function ListingsTable({ slug }: { slug: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [page, setPage] = useState<number>(1);
  const [view, setView] = useState<"rows" | "grid">("rows");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [bulkInFlight, setBulkInFlight] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleCategoryChange = (c: string) => {
    setCategory(c);
    setPage(1);
  };

  const handleOrderingChange = (o: string) => {
    setOrdering(o);
    setPage(1);
  };

  // Build query for the API
  const query: ShopProductQuery = useMemo(() => {
    const q: ShopProductQuery = {
      page,
      pageSize: PAGE_SIZE,
      ordering,
    };
    if (debouncedQuery) q.q = debouncedQuery;
    if (category) q.category = category;

    // Freshness filter: use ?fresh=. Do not use ?freshness= per technical notes.
    if (activeTab === "needs-attention") {
      q.fresh = "false";
    } else if (activeTab === "live") {
      q.status = "live";
    } else if (activeTab === "drafts") {
      q.status = "draft";
    } else if (activeTab === "sold") {
      q.status = "sold";
    }

    return q;
  }, [page, ordering, debouncedQuery, category, activeTab]);

  const { products, setProducts, total, loading, error, refetch } = useShopProducts(
    query,
    slug,
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const allVisibleSelected =
    products.length > 0 && products.every((p) => selected.includes(p.slug));

  const toggleAll = () => {
    if (allVisibleSelected) {
      const visibleSlugs = new Set(products.map((p) => p.slug));
      setSelected(selected.filter((slug) => !visibleSlugs.has(slug)));
    } else {
      const newSelected = new Set([...selected, ...products.map((p) => p.slug)]);
      setSelected(Array.from(newSelected));
    }
  };

  const toggleOne = (productSlug: string) => {
    if (selected.includes(productSlug)) {
      setSelected(selected.filter((i) => i !== productSlug));
    } else {
      setSelected([...selected, productSlug]);
    }
  };

  // Bulk confirm
  const handleBulkConfirm = async () => {
    if (selected.length === 0 || bulkInFlight) return;
    setBulkInFlight(true);
    setGlobalError(null);
    setGlobalSuccess(null);

    try {
      const res = await confirmSelectedFreshness(slug, selected);
      const confirmedSlugs = new Set(res.confirmed);

      // In-place update of confirmed items
      setProducts((prev) =>
        prev.map((p) => {
          if (confirmedSlugs.has(p.slug)) {
            return {
              ...p,
              confirmation_status: "fresh",
              last_confirmed_at: new Date().toISOString(),
              is_available: true,
            };
          }
          return p;
        }),
      );

      setSelected([]);
      setGlobalSuccess(`Successfully confirmed ${res.confirmed.length} listings.`);
      refetch();
    } catch {
      setGlobalError("Failed to confirm selected listings. Please try again.");
    } finally {
      setBulkInFlight(false);
    }
  };

  // In-place product updates
  const handleProductUpdated = (updated: ShopProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.slug === updated.slug ? { ...p, ...updated } : p)),
    );
  };

  const handleProductDeleted = (deletedSlug: string) => {
    setProducts((prev) => prev.filter((p) => p.slug !== deletedSlug));
    setSelected((prev) => prev.filter((s) => s !== deletedSlug));
    setGlobalSuccess("Listing successfully removed.");
    refetch();
  };

  useEffect(() => {
    if (openMenuId === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-row-action]")) {
        setOpenMenuId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const isFiltered =
    activeTab !== "all" || Boolean(debouncedQuery) || Boolean(category);

  return (
    <div className="flex flex-col gap-5">
      {/* Global notifications */}
      {globalError && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <span>{globalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalError(null)}
            className="text-red-700 hover:text-red-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {globalSuccess && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-emerald-600" />
            <span>{globalSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <StatusFilter
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        products={products}
        total={total}
      />

      {/* Toolbar */}
      <ToolBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={handleCategoryChange}
        ordering={ordering}
        setOrdering={handleOrderingChange}
        view={view}
        setView={setView}
      />

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="px-[18px] py-3 bg-tn-ink rounded-[13px] text-white flex items-center justify-between gap-3.5 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="text-[13.5px] font-bold">
              {selected.length} selected{" "}
              <span className="font-normal text-white/60 text-xs">
                (visible rows)
              </span>
            </span>
            <div className="h-4 w-px bg-white/18" />
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={bulkInFlight}
                onClick={handleBulkConfirm}
                className="flex items-center gap-1.5 text-xs font-bold text-tn-green hover:underline cursor-pointer disabled:opacity-50"
              >
                {bulkInFlight ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Icon name="check" size={14} />
                )}
                Confirm stock
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-xs font-bold text-white/70 hover:text-white cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Content: Loading Skeleton vs Empty State vs Rows vs Grid */}
      {loading && products.length === 0 ? (
        <TableSkeleton />
      ) : error && products.length === 0 ? (
        <div className="py-16 px-5 text-center bg-white rounded-[18px] border border-tn-hair">
          <AlertCircle className="size-10 text-tn-red mx-auto mb-3" />
          <h2 className="text-lg font-bold text-tn-ink">Couldn&apos;t load listings</h2>
          <p className="text-sm text-tn-mute mt-1 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-tn-ink text-white rounded-lg text-sm font-semibold hover:bg-black cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 px-5 flex flex-col items-center text-center bg-white rounded-[18px] border border-tn-hair">
          <div className="size-[84px] rounded-[22px] bg-tn-paper flex items-center justify-center text-tn-mute mb-4">
            <Icon name="box" size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-tn-ink">
            {isFiltered ? "No listings here yet" : "No listings"}
          </h2>
          <p className="text-[15px] text-tn-mute max-w-[380px] mt-2 mb-6">
            {isFiltered
              ? "Nothing matches these filters. Try clearing search or switching tabs."
              : "Add your first product, or import your stock straight from Telegram in one go."}
          </p>
          <div className="flex items-center gap-3">
            <Pill
              kind="solid"
              size="md"
              icon="plus"
              href="/shop/dashboard/listings/new"
            >
              Add a listing
            </Pill>
            <Pill
              kind="outline"
              size="md"
              icon="tg"
              className="text-tn-telegram hover:text-tn-telegram"
              href="/shop/dashboard/telegram"
            >
              Import from Telegram
            </Pill>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4">
          {products.map((item) => (
            <ListingGridCard
              key={item.id}
              product={item}
              shopSlug={slug}
              isSelected={selected.includes(item.slug)}
              toggleOne={toggleOne}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onProductUpdated={handleProductUpdated}
              onProductDeleted={handleProductDeleted}
              onError={setGlobalError}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-tn-hair bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[760px]">
              <TableHeader
                allSelected={allVisibleSelected}
                toggleAll={toggleAll}
              />
              <tbody>
                {products.map((item) => (
                  <ListingRow
                    key={item.id}
                    product={item}
                    shopSlug={slug}
                    isSelected={selected.includes(item.slug)}
                    toggleOne={toggleOne}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    onProductUpdated={handleProductUpdated}
                    onProductDeleted={handleProductDeleted}
                    onError={setGlobalError}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2">
          <div className="font-tn-mono text-[12.5px] text-tn-mute">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–
            {Math.min(page * PAGE_SIZE, total)} of {total} listings
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-lg border border-tn-hair bg-white text-xs font-bold text-tn-ink hover:bg-tn-paper disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                Previous
              </button>
              <span className="font-tn-mono text-xs text-tn-mute px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-lg border border-tn-hair bg-white text-xs font-bold text-tn-ink hover:bg-tn-paper disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
