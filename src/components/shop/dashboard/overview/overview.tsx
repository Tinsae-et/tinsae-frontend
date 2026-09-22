"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyStockCheckIn, RecentActivities } from "./activities";
import { ShopProduct } from "@/lib/types";
import { useShopProducts } from "@/hooks/use-products";
import { formatETB, Freshness, freshness } from "@/lib/format";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import {
  ProdPlaceholder,
  kindForSlug,
} from "@/components/tinsae/prod-placeholder";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  confirmFreshness,
  markSold,
  pauseProduct,
  resumeProduct,
} from "@/lib/api";
import DeleteListing from "../listings/delete-listing";
import {
  Loader2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Tag,
  Trash,
} from "lucide-react";
import { GuidedFirstRun } from "./guided-first-run";

type KpiItem = {
  label: string;
  /** `null` when the backend cannot answer this yet — rendered as an em dash. */
  value: string | null;
  sub: string;
  delta?: string;
  up?: boolean;
  spark?: number[];
};

/**
 * The four tiles, built from what the API actually returns.
 *
 * Three of them cannot be answered at all today: `ShopProductSerializer` has no
 * views, no inquiries and no reply timestamps (docs/backend-requirements.md §1).
 * They used to render 1,284 views and a 98% response rate on every shop in the
 * system, complete with a rising sparkline — numbers a merchant could have made
 * a pricing decision on. A dash is worth more than a plausible number: it is
 * the difference between "we do not track this yet" and a lie.
 *
 * No delta chip and no sparkline without a value, for the same reason — a trend
 * line over data we do not have is the most confident-looking part of the lie.
 */
function buildKpis(products: ShopProduct[]): KpiItem[] {
  const active = products.filter((p) => p.is_available);
  const confirmed = active.filter(
    (p) =>
      freshness(p.last_confirmed_at, p.confirmation_status).tone === "fresh",
  ).length;

  return [
    {
      label: "Active listings",
      value: String(active.length),
      sub:
        active.length > 0
          ? `${confirmed} confirmed recently`
          : "Add your first listing to get started",
    },
    { label: "Views today", value: null, sub: "Not tracked yet" },
    { label: "Inquiries today", value: null, sub: "Not tracked yet" },
    { label: "Response rate", value: null, sub: "Not tracked yet" },
  ];
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 40;
  const padTop = 6;
  const padBottom = 6;
  const plotH = h - padTop - padBottom;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = padTop + plotH - ((val - min) / range) * plotH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = points.join(" ");
  const polygonPoints = `0,${h} ${polylinePoints} ${w},${h}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-10 overflow-hidden"
    >
      <polygon points={polygonPoints} fill="#FFF1EB" />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#CC3000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusPill({
  tone,
  product,
}: {
  tone: "fresh" | "stale" | "unconfirmed";
  product: ShopProduct;
}) {
  if (tone === "fresh" && product.is_available) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-green-soft text-tn-green">
        Visible
      </span>
    );
  }
  if (tone === "stale" && product.is_available) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-paper text-tn-mute">
        Stale · hidden
      </span>
    );
  }
  if (!product.is_available) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-paper text-tn-mute">
        Sold
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#FFF6E5] text-tn-warn">
      Aging
    </span>
  );
}

function NumberCard({ numb }: { numb: KpiItem }) {
  const tracked = numb.value !== null;

  return (
    <div className="rounded-[18px] border border-tn-hair px-[22px] py-5 bg-white flex flex-col justify-between transition-shadow hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
          {numb.label}
        </span>
        {numb.delta ? (
          <span
            className={cn(
              "font-tn-mono text-[11.5px] font-extrabold px-2 py-0.5 rounded-full",
              numb.up
                ? "bg-tn-green-soft text-tn-green"
                : "bg-tn-red-soft text-tn-red",
            )}
          >
            {numb.delta}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <div
          className={cn(
            "font-tn-mono text-[34px] font-semibold tracking-[-0.03em] leading-none",
            tracked ? "text-tn-ink" : "text-tn-hair",
          )}
        >
          {tracked ? numb.value : "—"}
        </div>
        <div className="text-xs text-tn-mute mt-1.5">{numb.sub}</div>
      </div>

      {numb.spark ? (
        <div className="mt-4 -mx-1">
          <Sparkline data={numb.spark} />
        </div>
      ) : (
        // Holds the tiles to a common height so the row does not go ragged
        // where a sparkline is absent.
        <div className="mt-4 h-10" />
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Greeting({ shopName }: { shopName: string }) {
  const greeting = getGreeting();
  return (
    <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-tn-ink">
      {greeting}, {shopName} 👋
    </h1>
  );
}

function ListingTableHeader({
  selected,
  products,
}: {
  selected: number[];
  products: ShopProduct[];
}) {
  const totalCount = products.length;
  let visibleCount = 0;
  let agingCount = 0;
  let staleCount = 0;
  for (const p of products) {
    const f = freshness(p.last_confirmed_at, p.confirmation_status);
    if (f.tone === "fresh") visibleCount++;
    else if (f.tone === "stale") staleCount++;
    else agingCount++;
  }
  const subText =
    totalCount > 0
      ? `${totalCount} total · ${visibleCount} visible · ${agingCount} aging · ${staleCount} stale`
      : "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-[18px] gap-3">
      <div>
        <h2 className="text-[15px] font-extrabold text-tn-ink">
          Your listings
        </h2>
        {subText && (
          <p className="font-tn-mono text-xs text-tn-mute mt-0.5">{subText}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {selected.length > 0 && (
          <span className="font-tn-mono text-xs text-tn-mute">
            {selected.length} selected
          </span>
        )}
        <Pill kind="outline" size="sm" icon="check">
          Quick confirm
        </Pill>
        <Pill
          kind="outline"
          size="sm"
          iconAfter="arrow"
          href="/shop/dashboard/listings"
        >
          Manage all
        </Pill>
      </div>
    </div>
  );
}

export function ActionMenu({
  onClose,
  product,
  shopSlug,
  setAvailable,
  onDeleted,
  onPauseToggle,
  isNearBottom,
}: {
  onClose: () => void;
  product: ShopProduct;
  shopSlug?: string;
  setAvailable?: (val: boolean) => void;
  onDeleted?: (slug: string) => void;
  onPauseToggle?: (isAvailable: boolean) => void;
  isNearBottom?: boolean;
}) {
  const [deleteItem, setDeleteItem] = useState<boolean>(false);
  const [inFlight, setInFlight] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const slug = shopSlug || product.shop_slug;

  const handleMarkSold = async () => {
    if (!slug) return;
    try {
      setInFlight("sold");
      setActionError(null);
      await markSold(slug, product.slug);
      setAvailable?.(false);
      onClose();
    } catch {
      setActionError("Failed to mark sold");
    } finally {
      setInFlight(null);
    }
  };

  const handlePauseToggle = async () => {
    if (!slug) return;
    try {
      setInFlight("pause");
      setActionError(null);
      if (product.is_available) {
        await pauseProduct(slug, product.slug);
        setAvailable?.(false);
        onPauseToggle?.(false);
      } else {
        await resumeProduct(slug, product.slug);
        setAvailable?.(true);
        onPauseToggle?.(true);
      }
      onClose();
    } catch {
      setActionError(
        product.is_available ? "Failed to pause" : "Failed to resume",
      );
    } finally {
      setInFlight(null);
    }
  };

  return (
    <div
      data-row-action
      className={cn(
        "absolute right-0 z-40 min-w-[160px] rounded-xl border border-tn-hair bg-white p-1.5 shadow-[0_12px_32px_rgba(11,11,11,0.12)] flex flex-col gap-0.5 text-left animate-in fade-in zoom-in-95 duration-100",
        isNearBottom
          ? "bottom-full mb-1.5 origin-bottom-right"
          : "top-full mt-1.5 origin-top-right",
      )}
    >
      <Link
        href={`/shop/dashboard/listings/edit?slug=${product.slug}`}
        onClick={onClose}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer"
      >
        <Pencil className="size-3.5 text-tn-mute" />
        Edit
      </Link>

      {/* Pause / Resume action */}
      {slug && (
        <button
          type="button"
          disabled={Boolean(inFlight)}
          onClick={handlePauseToggle}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer disabled:opacity-50"
        >
          {inFlight === "pause" ? (
            <Loader2 className="size-3.5 animate-spin text-tn-mute" />
          ) : product.is_available ? (
            <Pause className="size-3.5 text-tn-mute" />
          ) : (
            <Play className="size-3.5 text-tn-green" />
          )}
          {product.is_available ? "Pause listing" : "Resume listing"}
        </button>
      )}

      {/* Mark sold action */}
      {setAvailable && product.is_available && (
        <button
          type="button"
          disabled={Boolean(inFlight)}
          onClick={handleMarkSold}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer disabled:opacity-50"
        >
          {inFlight === "sold" ? (
            <Loader2 className="size-3.5 animate-spin text-tn-mute" />
          ) : (
            <Tag className="size-3.5 text-tn-mute" />
          )}
          Mark as sold
        </button>
      )}

      <div className="my-1 border-t border-tn-hair2" />

      <button
        type="button"
        disabled={Boolean(inFlight)}
        onClick={() => setDeleteItem(true)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-red hover:bg-tn-red-soft transition-colors cursor-pointer disabled:opacity-50"
      >
        <Trash className="size-3.5 text-tn-red" />
        Remove
      </button>

      {actionError && (
        <p className="text-[10.5px] text-red-600 font-medium px-2 py-0.5 bg-red-50 rounded">
          {actionError}
        </p>
      )}

      {deleteItem && (
        <DeleteListing
          product={product}
          shopSlug={slug || ""}
          setDeleteItem={setDeleteItem}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}

function TableRow({
  product,
  isSelected,
  toggleOne,
  openMenuId,
  setOpenMenuId,
  shopSlug,
  rowIndex,
  totalRows,
}: {
  product: ShopProduct;
  isSelected: boolean;
  toggleOne: (id: number) => void;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  shopSlug?: string;
  rowIndex?: number;
  totalRows?: number;
}) {
  const [fresh, setFresh] = useState<Freshness>(() =>
    freshness(product.last_confirmed_at, product.confirmation_status),
  );
  const isMenuOpen = openMenuId === product.id;
  const isNearBottom =
    rowIndex !== undefined &&
    totalRows !== undefined &&
    totalRows > 1 &&
    rowIndex >= totalRows - 2;
  const [needConfirm, setNeedConfirm] = useState<boolean>(
    () => product.is_available && fresh.tone !== "fresh",
  );
  const [confirming, setConfirming] = useState<boolean>(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const dotColor =
    fresh.tone === "fresh"
      ? "bg-tn-green shadow-[0_0_0_3px_#1F8A5B22]"
      : fresh.tone === "stale"
        ? "bg-tn-mute"
        : "bg-tn-warn";

  const confirm = async () => {
    const sSlug = shopSlug || product.shop_slug;
    if (!sSlug) return;
    try {
      setConfirming(true);
      setRowError(null);
      await confirmFreshness(sSlug, product.slug);
      setNeedConfirm(false);
      setFresh({ ...fresh, tone: "fresh" });
    } catch {
      setRowError("Failed to confirm listing");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-tn-hair2 last:border-b-0 transition-colors",
        isSelected ? "bg-tn-red-soft" : "hover:bg-tn-paper/50",
      )}
    >
      {/* Checkbox */}
      <td className="py-[13px] pl-5 pr-2 w-12">
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Select ${product.name}`}
          onClick={() => toggleOne(product.id)}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors cursor-pointer",
            isSelected
              ? "border-tn-red bg-tn-red text-white"
              : "border-tn-hair bg-white",
          )}
        >
          {isSelected && <Icon name="check" size={12} strokeWidth={3} />}
        </button>
      </td>

      {/* Product */}
      <td className="px-3 py-[13px]">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-[10px] bg-tn-paper flex items-center justify-center shrink-0 overflow-hidden">
            <ProdPlaceholder kind={kindForSlug(product.category)} />
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-tn-ink truncate">
              {product.name}
            </div>
            <div className="text-[11.5px] text-tn-mute truncate">
              {product.description}
            </div>
            {rowError && (
              <div className="text-[10.5px] text-red-600 font-semibold mt-0.5">
                {rowError}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-sm font-semibold text-tn-ink">
        {formatETB(product.price)}
      </td>

      {/* Condition */}
      <td className="whitespace-nowrap px-3 py-[13px] text-[12.5px] font-semibold text-tn-ink">
        {product.condition || "—"}
      </td>

      {/* Confirmed */}
      <td className="whitespace-nowrap px-3 py-[13px]">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", dotColor)} />
          <span className="font-tn-mono text-xs text-tn-mute">{fresh.age}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-3 py-[13px]">
        <StatusPill tone={fresh.tone} product={product} />
      </td>

      {/* Views · Inq */}
      <td className="whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-[12.5px] text-tn-mute">
        — · —
      </td>

      {/* Action */}
      <td className="py-[13px] pl-2 pr-5 text-right">
        <div className="flex justify-end items-center">
          {needConfirm ? (
            <Pill
              kind="solid"
              size="sm"
              icon="check"
              disabled={confirming}
              onClick={confirm}
            >
              {confirming ? "Confirming..." : "Confirm"}
            </Pill>
          ) : (
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
                <ActionMenu
                  product={product}
                  shopSlug={shopSlug}
                  onClose={() => setOpenMenuId(null)}
                  isNearBottom={isNearBottom}
                />
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function ListingsTable({
  products,
  shopSlug,
}: {
  products: ShopProduct[];
  shopSlug?: string;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleOne = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
      return;
    }
    setSelected([...selected, id]);
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

  return (
    <div className="rounded-[18px] border border-tn-hair bg-white">
      {/* Header */}
      <ListingTableHeader selected={selected} products={products} />

      {/* Table */}
      <div className="overflow-x-auto min-h-[280px]">
        <table className="w-full border-collapse text-sm min-w-[760px]">
          <thead>
            <tr className="border-y border-tn-hair2 bg-tn-paper text-[10.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
              <th className="w-12 py-3 pl-5 pr-2"></th>
              <th className="px-3 py-3 text-left">Product</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-left">Condition</th>
              <th className="px-3 py-3 text-left">Confirmed</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-right">Views · Inq</th>
              <th className="py-3 pl-2 pr-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => {
              const isSelected = selected.includes(product.id);
              return (
                <TableRow
                  key={product.id}
                  product={product}
                  isSelected={isSelected}
                  toggleOne={toggleOne}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  shopSlug={shopSlug}
                  rowIndex={idx}
                  totalRows={products.length}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Numbers({
  shopName,
  products,
}: {
  shopName: string;
  products: ShopProduct[];
}) {
  const kpis = useMemo(() => buildKpis(products), [products]);

  const needsReconfirming = products.filter(
    (p) =>
      p.is_available &&
      freshness(p.last_confirmed_at, p.confirmation_status).tone !== "fresh",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Greeting shopName={shopName} />
          {/*
            The design's line is "You have {n} unanswered inquiries and {n}
            listings need re-confirmation today." We can count the second half
            and not the first — there is no inquiries endpoint — so the sentence
            says only the half we can stand behind. Restoring the full wording is
            a one-line change once inquiries exist.
          */}
          <p className="text-sm text-tn-ink2 mt-1">
            {needsReconfirming > 0 ? (
              <>
                <span className="text-tn-ink font-bold">
                  {needsReconfirming}{" "}
                  {needsReconfirming === 1 ? "listing" : "listings"}
                </span>{" "}
                need re-confirmation today.
              </>
            ) : products.length > 0 ? (
              "Every listing is confirmed. Nothing needs your attention today."
            ) : (
              "Add your first listing to start showing up in buyer searches."
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Pill kind="outline" size="md" icon="check">
            Confirm all stock
          </Pill>
          <Pill kind="solid" size="md" icon="msg">
            Reply to inquiries
          </Pill>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((n) => (
          <NumberCard key={n.label} numb={n} />
        ))}
      </div>
    </div>
  );
}

/**
 * One fetch, shared by every panel on the screen.
 *
 * The KPI tiles, the greeting's re-confirmation count, the check-in card and
 * the table are all views of the same list, so lifting the request here keeps
 * them consistent with each other and costs one round trip instead of two.
 */
export default function Overview({
  slug,
  shopName,
  basePath = "/shop/dashboard",
}: {
  slug: string;
  shopName: string;
  basePath?: string;
}) {
  const { products, loading } = useShopProducts({}, slug);

  if (loading) {
    return (
      <div
        className="flex flex-col gap-6"
        aria-busy="true"
        aria-label="Loading dashboard"
      >
        <div className="h-12 w-72 animate-pulse rounded-xl bg-tn-hair2" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[18px] border border-tn-hair bg-white"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-[18px] border border-tn-hair bg-white" />
      </div>
    );
  }

  const needsReconfirming = products.filter(
    (product) =>
      product.is_available &&
      freshness(product.last_confirmed_at, product.confirmation_status).tone !==
        "fresh",
  );

  if (products.length === 0) {
    return <GuidedFirstRun shopName={shopName} basePath={basePath} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Numbers shopName={shopName} products={products} />
      {needsReconfirming.length > 0 && (
        <section className="rounded-[20px] border border-[#FBD9C7] bg-tn-red-soft px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-tn-red">
                Needs your attention
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-tn-ink">
                {needsReconfirming.length}{" "}
                {needsReconfirming.length === 1
                  ? "listing needs"
                  : "listings need"}{" "}
                confirmation
              </h2>
              <p className="mt-1 text-sm font-medium text-tn-ink2">
                Confirm your stock so buyers see accurate availability.
              </p>
            </div>
            <Pill
              kind="solid"
              size="md"
              icon="check"
              href={`${basePath}/listings?tab=needs-attention`}
            >
              Review listings
            </Pill>
          </div>
        </section>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <DailyStockCheckIn products={products} />
        <RecentActivities />
      </div>
      <ListingsTable products={products} shopSlug={slug} />
    </div>
  );
}
