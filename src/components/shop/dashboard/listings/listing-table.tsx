"use client";

import React, { useState, useMemo, useEffect } from "react";
import { List, LayoutGrid, MoreHorizontal } from "lucide-react";
import { Icon } from "@/components/tinsae/icon";
import { ListingRow } from "./listing-row";
import { ShopProduct } from "@/lib/types";
import { confirmAllFreshness, confirmFreshness, ShopProductQuery } from "@/lib/api";
import { useShopProducts } from "@/hooks/use-products";
import { formatETB, Freshness, freshness } from "@/lib/format";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { Pill } from "@/components/tinsae/pill";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { ActionMenu } from "../overview/overview";

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
}: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  products: ShopProduct[];
}) {
  const counts = useMemo(() => {
    let live = 0;
    let needsAttention = 0;
    let sold = 0;
    for (const p of products) {
      if (p.is_available) {
        live++;
        const f = freshness(p.last_confirmed_at, p.confirmation_status);
        if (f.tone !== "fresh") {
          needsAttention++;
        }
      } else {
        sold++;
      }
    }
    return {
      all: products.length,
      live,
      "needs-attention": needsAttention,
      drafts: 0,
      sold,
    };
  }, [products]);

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
                : "text-tn-mute border-transparent hover:text-tn-ink"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "font-tn-mono text-[11px] font-bold px-[7px] py-px rounded-full",
                isActive ? "bg-tn-ink text-white" : "bg-tn-paper text-tn-mute"
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
  setQuery,
  query,
  view,
  setView,
}: {
  setQuery: (query: ShopProductQuery) => void;
  query: ShopProductQuery;
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
          value={query.q ?? ""}
          onChange={(e) => setQuery({ ...query, q: e.target.value })}
          className="w-full h-[42px] rounded-[11px] border border-tn-hair bg-white pl-9 pr-3 text-sm text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={query.category ?? ""}
          onChange={(e) =>
            setQuery({ ...query, category: e.target.value || undefined })
          }
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
          value={query.ordering ?? "-created_at"}
          onChange={(e) =>
            setQuery({ ...query, ordering: e.target.value || undefined })
          }
          className="h-[42px] rounded-[11px] border border-tn-hair bg-white px-3.5 text-sm font-semibold text-tn-ink cursor-pointer focus:outline-none focus:border-tn-ink"
        >
          <option value="-created_at">Newest first</option>
          <option value="last_confirmed_at">Oldest confirmed</option>
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
                : "text-tn-mute hover:text-tn-ink"
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
                : "text-tn-mute hover:text-tn-ink"
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
                : "border-tn-hair bg-white"
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
  selected,
  access,
  toggleOne,
  openMenuId,
  setOpenMenuId
}: {
  product: ShopProduct;
  selected: string[];
  access: string;
  toggleOne: (slug: string) => void;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null)=>void;
}) {
  const [fresh, setFresh] = useState<Freshness>(()=>freshness(product.last_confirmed_at, product.confirmation_status))
  const [needConfirm, setNeedConfirm] = useState<boolean>(()=>(product.is_available && fresh.tone !== "fresh"));
  const [available, setAvailable] = useState<boolean>(product.is_available)

  const dotColor =
    fresh.tone === "fresh"
      ? "bg-tn-green shadow-[0_0_0_3px_#1F8A5B22]"
      : fresh.tone === "stale"
      ? "bg-tn-mute"
      : "bg-tn-warn";
  const isSelected = selected.includes(product.slug);
  const isMenuOpen = openMenuId === product.id;

  const confirm = async () => {
      if (!product.shop_slug) return;
      await confirmFreshness(product.shop_slug, product.slug, access);
      setNeedConfirm(false);
      setFresh({...fresh, age: "Just now"})
    }

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border-[1.5px] overflow-hidden flex flex-col justify-between transition-all",
        isSelected
          ? "border-tn-red ring-[3px] ring-tn-red/10"
          : "border-tn-hair hover:border-tn-hair/80"
      )}
    >
      <div className="aspect-[16/10] bg-tn-paper relative flex items-center justify-center overflow-hidden">
        <ProdPlaceholder kind={kindForSlug(product.category)} />

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
              : "border-white/70 bg-black/25 text-transparent hover:border-white"
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
          ) : (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-paper text-tn-mute shadow-xs">
              Sold
            </span>
          )}
        </div>

        {/* Freshness chip bottom-left */}
        {product.is_available && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/92 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs z-10">
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

          <div className="mt-2.5 flex items-center justify-between">
            <span className="font-tn-mono text-[15px] font-semibold text-tn-ink">
              {formatETB(product.price)}
            </span>
            <span className="font-tn-mono text-xs text-tn-mute">— in stock</span>
          </div>
        </div>

        <div>
          <div className="my-2.5 border-t border-tn-hair2" />
          <div className="flex items-center justify-between">
            <span className="font-tn-mono text-xs text-tn-mute">— views · — inq</span>
            <div className="flex items-center gap-2">
              {needConfirm && (
                <Pill kind="solid" size="sm" icon="check" onClick={confirm}>
                  Confirm
                </Pill>
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
              {isMenuOpen && <ActionMenu product={product} onClose={() => setOpenMenuId(null)} access={access} setAvailable={setAvailable} />}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsTable({ slug, access }: { slug: string, access: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState<ShopProductQuery>({});
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [view, setView] = useState<"rows" | "grid">("rows");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { products: apiProducts } = useShopProducts(query, slug);

  // The API already applies q / category / ordering — see the proxy route's
  // allowlist and shops/views.py. Re-filtering here would only ever disagree
  // with it, so the fetched list is the list.
  const baseProducts = apiProducts;

  const confirmStocks = async () => {
    await confirmAllFreshness(slug, access, selected);
    redirect("/shop/dashboard/overview/")
  }

  const displayedProducts = useMemo(() => {
    return baseProducts.filter((p) => {
      if (activeTab === "live") return p.is_available;
      if (activeTab === "needs-attention") {
        return (
          p.is_available &&
          freshness(p.last_confirmed_at, p.confirmation_status).tone !== "fresh"
        );
      }
      if (activeTab === "drafts") return false;
      if (activeTab === "sold") return !p.is_available;
      return true;
    });
  }, [baseProducts, activeTab]);

  const allVisibleSelected =
    displayedProducts.length > 0 &&
    displayedProducts.every((p) => selected.includes(p.slug));

  const toggleAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(displayedProducts.map((p) => p.slug));
      setSelected(selected.filter((slug) => !visibleIds.has(slug)));
    } else {
      const newSelected = new Set([...selected, ...displayedProducts.map((p) => p.slug)]);
      setSelected(Array.from(newSelected));
    }
  };

  const toggleOne = (slug: string) => {
    if (selected.includes(slug)) {
      setSelected(selected.filter((i) => i !== slug));
    } else {
      setSelected([...selected, slug]);
    }
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
    activeTab !== "all" || Boolean(query.q) || Boolean(query.category);

  return (
    <div className="flex flex-col gap-5">
      {/* Status Filter Tabs */}
      <StatusFilter
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        products={baseProducts}
      />

      {/* Toolbar */}
      <ToolBar
        setQuery={setQuery}
        query={query}
        view={view}
        setView={setView}
      />

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="px-[18px] py-3 bg-tn-ink rounded-[13px] text-white flex items-center justify-between gap-3.5 shadow-md">
          <div className="flex items-center gap-3.5">
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
                onClick={confirmStocks}
                className="flex items-center gap-1.5 text-xs font-bold text-tn-green hover:underline cursor-pointer"
              >
                <Icon name="check" size={14} /> Confirm stock
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Bulk mark sold mutation
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-white hover:underline cursor-pointer"
              >
                <Icon name="tag" size={14} /> Mark sold
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Bulk delete mutation
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-tn-red hover:underline cursor-pointer"
              >
                <Icon name="minus" size={14} /> Delete
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

      {/* Content: Empty State vs Rows vs Grid */}
      {displayedProducts.length === 0 ? (
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
              href="/shop/    return baseProducts.filter((p) => {
dashboard/listings/new"
            >
              Add a listing
            </Pill>
            <Pill
              kind="outline"
              size="md"
              icon="tg"
              className="text-tn-telegram hover:text-tn-telegram"
              onClick={() => {
                // TODO: Import from Telegram handler
              }}
            >
              Import from Telegram
            </Pill>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4">
          {displayedProducts.map((item) => (
            <ListingGridCard
              key={item.id}
              product={item}
              selected={selected}
              toggleOne={toggleOne}
              access={access}
              setOpenMenuId={setOpenMenuId}
              openMenuId={openMenuId}
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
                {displayedProducts.map((item) => (
                  <ListingRow
                    key={item.id}
                    selected={selected}
                    product={item}
                    toggleOne={toggleOne}
                    access={access}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer count line */}
      {displayedProducts.length > 0 && (
        <div className="font-tn-mono text-[12.5px] text-center text-tn-mute py-2">
          Showing {displayedProducts.length} of {baseProducts.length} listings
        </div>
      )}
    </div>
  );
}

