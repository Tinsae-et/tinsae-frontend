"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MoreHorizontal, Pause, Pencil, Play, Tag, Trash } from "lucide-react";

import { Icon } from "@/components/tinsae/icon";
import { formatETB, Freshness, freshness } from "@/lib/format";
import { ShopProduct } from "@/lib/types";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { Pill } from "@/components/tinsae/pill";
import { cn } from "@/lib/utils";
import { confirmFreshness, markSold, pauseProduct, resumeProduct } from "@/lib/api/client";
import DeleteListing from "./delete-listing";

export type ListingRowProps = {
  product: ShopProduct;
  shopSlug: string;
  isSelected: boolean;
  toggleOne: (slug: string) => void;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  onProductUpdated?: (updated: ShopProduct) => void;
  onProductDeleted?: (slug: string) => void;
  onError?: (msg: string) => void;
  rowIndex?: number;
  totalRows?: number;
};

export function ListingRow({
  product,
  shopSlug,
  isSelected,
  toggleOne,
  openMenuId,
  setOpenMenuId,
  onProductUpdated,
  onProductDeleted,
  onError,
  rowIndex,
  totalRows,
}: ListingRowProps) {
  const [fresh, setFresh] = useState<Freshness>(() =>
    freshness(product.last_confirmed_at, product.confirmation_status),
  );
  const [available, setAvailable] = useState<boolean>(product.is_available);
  const [status, setStatus] = useState<string>(product.status || (product.is_available ? "live" : "sold"));
  const [inFlightAction, setInFlightAction] = useState<"confirm" | "pause" | "resume" | "sold" | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const isMenuOpen = openMenuId === product.id;
  const isNearBottom =
    rowIndex !== undefined && totalRows !== undefined && totalRows > 1 && rowIndex >= totalRows - 2;
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
    setRowError(null);

    // Optimistic update
    setFresh({ ...fresh, tone: "fresh", age: "Just now", confirmed: "Confirmed moments ago" });

    try {
      const updated = await confirmFreshness(shopSlug, product.slug);
      setFresh(freshness(updated.last_confirmed_at, updated.confirmation_status));
      setAvailable(updated.is_available);
      onProductUpdated?.(updated);
    } catch {
      // Rollback on failure
      setFresh(prevFresh);
      const err = `Failed to confirm "${product.name}". Please try again.`;
      setRowError(err);
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
    setRowError(null);
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
      setRowError(err);
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
    setRowError(null);
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
      setRowError(err);
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
          onClick={() => toggleOne(product.slug)}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors cursor-pointer",
            isSelected ? "border-tn-red bg-tn-red text-white" : "border-tn-hair bg-white",
          )}
        >
          {isSelected && <Icon name="check" size={12} strokeWidth={3} />}
        </button>
      </td>

      {/* Product */}
      <td className="px-3 py-[13px]">
        <div className="flex items-center gap-3">
          <div className="size-[42px] rounded-[10px] bg-tn-paper flex items-center justify-center shrink-0 overflow-hidden">
            {getImage() ? (
              <Image src={getImage()} alt={product.name} width={42} height={42} className="object-cover size-full" />
            ) : (
              <ProdPlaceholder kind={kindForSlug(product.category)} />
            )}
          </div>
          <div className="min-w-0 max-w-[240px]">
            <div className="text-[13.5px] font-bold text-tn-ink truncate">
              {product.name}
            </div>
            <div className="text-[11.5px] text-tn-mute truncate">
              {product.description ? `${product.description} · ` : ""}
              {product.condition || "New"}
            </div>
            {rowError && (
              <p className="text-[11px] font-semibold text-tn-red mt-0.5 animate-in fade-in">
                {rowError}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-sm font-semibold text-tn-ink">
        {formatETB(product.price)}
      </td>

      {/* Stock · status */}
      <td className="whitespace-nowrap px-3 py-[13px]">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-tn-mono text-[13px] font-semibold",
              product.stock === 0 ? "text-tn-red" : "text-tn-mute",
            )}
          >
            {product.stock !== undefined ? product.stock : "—"}
          </span>
          {available ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-green-soft text-tn-green">
              Live
            </span>
          ) : status === "sold" ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-paper text-tn-mute">
              Sold
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700">
              Paused
            </span>
          )}
        </div>
      </td>

      {/* Confirmed - relative time per AC ("confirmed 3 days ago") */}
      <td className="whitespace-nowrap px-3 py-[13px]">
        {available ? (
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", dotColor)} />
            <span className="font-tn-mono text-xs text-tn-mute">
              {fresh.confirmed}
            </span>
          </div>
        ) : (
          <span className="font-tn-mono text-xs text-tn-mute">—</span>
        )}
      </td>

      {/* Views */}
      <td className="whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-[12.5px] text-tn-mute">
        {product.views ?? "—"}
      </td>

      {/* Inq */}
      <td
        className={cn(
          "whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-[12.5px]",
          product.inquiries && product.inquiries > 0
            ? "text-tn-red font-bold"
            : "text-tn-mute",
        )}
      >
        {product.inquiries ?? "—"}
      </td>

      {/* Actions */}
      <td className="py-[13px] pl-2 pr-5 text-right">
        <div className="flex items-center justify-end gap-2">
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
                  <Loader2 className="size-3.5 animate-spin" />
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
              <Icon name="check" size={15} />
            </button>
          )}

          {/* Row actions dropdown */}
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
              <div
                className={cn(
                  "absolute right-0 z-40 min-w-[160px] rounded-xl border border-tn-hair bg-white p-1.5 shadow-[0_12px_32px_rgba(11,11,11,0.12)] flex flex-col gap-0.5 text-left animate-in fade-in zoom-in-95 duration-100",
                  isNearBottom
                    ? "bottom-full mb-1.5 origin-bottom-right"
                    : "top-full mt-1.5 origin-top-right",
                )}
              >
                <Link
                  href={`/shop/dashboard/listings/edit?slug=${product.slug}`}
                  onClick={() => setOpenMenuId(null)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer"
                >
                  <Pencil className="size-3.5 text-tn-mute" />
                  Edit
                </Link>

                {/* Pause / Resume action */}
                <button
                  type="button"
                  disabled={Boolean(inFlightAction)}
                  onClick={handlePauseToggle}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer disabled:opacity-50"
                >
                  {inFlightAction === "pause" || inFlightAction === "resume" ? (
                    <Loader2 className="size-3.5 animate-spin text-tn-mute" />
                  ) : available ? (
                    <Pause className="size-3.5 text-tn-mute" />
                  ) : (
                    <Play className="size-3.5 text-tn-green" />
                  )}
                  {available ? "Pause listing" : "Resume listing"}
                </button>

                {/* Mark sold action */}
                {available && (
                  <button
                    type="button"
                    disabled={Boolean(inFlightAction)}
                    onClick={handleMarkSold}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {inFlightAction === "sold" ? (
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
                  disabled={Boolean(inFlightAction)}
                  onClick={() => {
                    setOpenMenuId(null);
                    setShowDeleteModal(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-tn-red hover:bg-tn-red-soft transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash className="size-3.5 text-tn-red" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteListing
          product={product}
          shopSlug={shopSlug}
          setDeleteItem={setShowDeleteModal}
          onDeleted={onProductDeleted}
        />
      )}
    </tr>
  );
}