"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ExternalLink,
  Pencil,
  Pause,
  Play,
  Tag,
  Check,
  Loader2,
} from "lucide-react";

import { Icon } from "@/components/tinsae/icon";
import { formatETB, freshness } from "@/lib/format";
import { ShopProduct } from "@/lib/types";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { resolveProductImages } from "@/lib/product-images";
import { Pill } from "@/components/tinsae/pill";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import {
  confirmFreshness,
  markSold,
  pauseProduct,
  resumeProduct,
} from "@/lib/api/client";

export type ListingDetailDrawerProps = {
  product: ShopProduct | null;
  isOpen: boolean;
  onClose: () => void;
  shopSlug: string;
  onProductUpdated?: (updated: ShopProduct) => void;
};

export function ListingDetailDrawer(props: ListingDetailDrawerProps) {
  if (!props.isOpen || !props.product) return null;
  return (
    <ListingDetailDrawerInner
      key={props.product.id}
      {...props}
      product={props.product}
    />
  );
}

function ListingDetailDrawerInner({
  product: initialProduct,
  isOpen,
  onClose,
  shopSlug,
  onProductUpdated,
}: ListingDetailDrawerProps & { product: ShopProduct }) {
  const dialogRef = useModal<HTMLDivElement>(isOpen, onClose);

  const [inFlightAction, setInFlightAction] = useState<
    "confirm" | "pause" | "resume" | "sold" | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [overrideProduct, setOverrideProduct] = useState<ShopProduct | null>(null);
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const product = overrideProduct ?? initialProduct;

  // If initial product has no images, try fetching from the shop's images endpoint
  useEffect(() => {
    const initialImages = resolveProductImages(product.images);
    if (initialImages.length === 0 && product.slug && shopSlug) {
      let active = true;
      fetch(
        `/api/shop/${encodeURIComponent(shopSlug)}/products/${encodeURIComponent(product.slug)}/images`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data) return;
          const items = Array.isArray(data) ? data : data.results;
          const resolved = resolveProductImages(items);
          if (resolved.length > 0) {
            setFetchedImages(resolved);
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }
  }, [product.slug, product.images, shopSlug]);

  const allImages =
    fetchedImages.length > 0
      ? fetchedImages
      : resolveProductImages(product.images);

  const currentImage =
    allImages.length > 0 && !failedImages[activeImageIndex]
      ? allImages[activeImageIndex] || allImages[0]
      : null;

  const fresh = freshness(
    product.last_confirmed_at,
    product.confirmation_status,
  );
  const isAvailable = product.is_available;
  const isSold = product.status === "sold";

  const handleConfirm = async () => {
    if (inFlightAction) return;
    setInFlightAction("confirm");
    setActionError(null);

    try {
      const updated = await confirmFreshness(shopSlug, product.slug);
      setOverrideProduct(updated);
      onProductUpdated?.(updated);
    } catch {
      setActionError("Failed to confirm listing freshness. Please try again.");
    } finally {
      setInFlightAction(null);
    }
  };

  const handlePauseToggle = async () => {
    if (inFlightAction) return;
    const action = isAvailable ? "pause" : "resume";
    setInFlightAction(action);
    setActionError(null);

    try {
      const updated = isAvailable
        ? await pauseProduct(shopSlug, product.slug)
        : await resumeProduct(shopSlug, product.slug);
      setOverrideProduct(updated);
      onProductUpdated?.(updated);
    } catch {
      setActionError(`Failed to ${action} listing. Please try again.`);
    } finally {
      setInFlightAction(null);
    }
  };

  const handleMarkSold = async () => {
    if (inFlightAction) return;
    setInFlightAction("sold");
    setActionError(null);

    try {
      const updated = await markSold(shopSlug, product.slug);
      setOverrideProduct(updated);
      onProductUpdated?.(updated);
    } catch {
      setActionError("Failed to mark as sold. Please try again.");
    } finally {
      setInFlightAction(null);
    }
  };

  const specsList = product.specs
    ? Object.entries(product.specs).filter(
        ([key, val]) =>
          val !== null &&
          val !== undefined &&
          val !== "" &&
          key !== "variant",
      )
    : [];

  const dotColor =
    fresh.tone === "fresh"
      ? "bg-tn-green shadow-[0_0_0_3px_#1F8A5B22]"
      : fresh.tone === "stale"
        ? "bg-tn-mute"
        : "bg-tn-warn";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-tn-ink/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-drawer-title"
        className="relative z-10 w-full max-w-[520px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out overflow-hidden"
      >
        {/* Top Sticky Header */}
        <div className="px-6 py-4 border-b border-tn-hair2 bg-white/95 backdrop-blur-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-tn-paper text-tn-ink2 uppercase tracking-wider">
              <Icon name="tag" size={13} className="text-tn-mute" />
              {product.category || "Listing"}
            </span>

            {/* Status pill */}
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-tn-green-soft text-tn-green">
                <span className="size-1.5 rounded-full bg-tn-green" />
                Live in store
              </span>
            ) : isSold ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-tn-paper text-tn-mute">
                Sold
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-tn-warn/10 text-tn-warn">
                Paused
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close listing details"
            className="size-9 rounded-full border border-tn-hair flex items-center justify-center text-tn-mute hover:text-tn-ink hover:border-tn-ink transition-colors cursor-pointer bg-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Action error banner */}
          {actionError && (
            <div className="p-3.5 rounded-xl bg-tn-red-soft text-tn-red text-xs font-semibold border border-tn-red/20">
              {actionError}
            </div>
          )}

          {/* Product Media Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-tn-hair bg-[#F6F5F2] flex items-center justify-center">
              {currentImage ? (
                <Image
                  key={currentImage}
                  src={currentImage}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="520px"
                  className="object-cover transition-opacity duration-200"
                  onError={() =>
                    setFailedImages((prev) => ({
                      ...prev,
                      [activeImageIndex]: true,
                    }))
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#1E1D1B] to-[#0A0A0A]">
                  <ProdPlaceholder
                    kind={kindForSlug(product.category)}
                  />
                </div>
              )}

              {/* In stock badge */}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-tn-ink shadow-xs border border-tn-hair/60 z-10">
                <Check
                  size={13}
                  className={isAvailable ? "text-tn-green" : "text-tn-mute"}
                />
                {isAvailable ? "In stock" : "Unavailable"}
              </span>
            </div>

            {/* Thumbnail selector if multiple images */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allImages.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative size-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-tn-paper",
                      activeImageIndex === idx
                        ? "border-tn-ink ring-2 ring-tn-ink/20"
                        : "border-tn-hair opacity-70 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Identity */}
          <div>
            {product.brand && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-tn-mute block mb-1">
                {product.brand}
              </span>
            )}
            <h2
              id="listing-drawer-title"
              className="text-xl sm:text-2xl font-extrabold text-tn-ink tracking-tight"
            >
              {product.name}
            </h2>
            {typeof product.specs?.variant === "string" && (
              <p className="text-sm font-semibold text-tn-mute mt-1">
                {product.specs.variant}
              </p>
            )}
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-tn-hair bg-tn-paper/50 flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-tn-mute">
                Price
              </span>
              <span className="font-tn-mono text-base sm:text-lg font-bold text-tn-ink mt-1">
                {formatETB(product.price)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-tn-hair bg-tn-paper/50 flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-tn-mute">
                Stock
              </span>
              <span className="font-tn-mono text-base sm:text-lg font-bold text-tn-ink mt-1">
                {typeof product.stock === "number"
                  ? `${product.stock} ${product.stock === 1 ? "unit" : "units"}`
                  : "—"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-tn-hair bg-tn-paper/50 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-tn-mute">
                Condition
              </span>
              <span className="text-sm font-bold text-tn-ink mt-1 truncate">
                {product.condition || "—"}
              </span>
            </div>
          </div>

          {/* Freshness Status Card */}
          <div className="p-4 rounded-2xl border border-tn-hair bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={cn("size-2.5 rounded-full shrink-0", dotColor)} />
                <div>
                  <div className="text-sm font-extrabold text-tn-ink">
                    {fresh.tone === "fresh"
                      ? "Fresh & visible to buyers"
                      : fresh.tone === "stale"
                        ? "Stale · hidden from search"
                        : "Aging · needs confirmation"}
                  </div>
                  <div className="font-tn-mono text-xs text-tn-mute mt-0.5">
                    {fresh.confirmed || `Last confirmed ${fresh.age}`}
                  </div>
                </div>
              </div>

              {fresh.tone !== "fresh" && isAvailable && (
                <button
                  type="button"
                  disabled={Boolean(inFlightAction)}
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tn-ink text-white text-xs font-bold hover:bg-tn-ink/90 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {inFlightAction === "confirm" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                  Confirm now
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-tn-mute">
                Description
              </h3>
              <div className="p-4 rounded-xl border border-tn-hair bg-white text-sm text-tn-ink2 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {/* Specifications */}
          {specsList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-tn-mute">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {specsList.map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl border border-tn-hair2 bg-tn-paper/40 flex flex-col"
                  >
                    <span className="text-[11px] font-bold text-tn-mute capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-bold text-tn-ink mt-0.5">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Management Actions */}
          <div className="space-y-2 pt-2 border-t border-tn-hair2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tn-mute">
              Listing controls
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(inFlightAction)}
                onClick={handlePauseToggle}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-tn-hair bg-white text-xs font-bold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer disabled:opacity-50"
              >
                {inFlightAction === "pause" || inFlightAction === "resume" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isAvailable ? (
                  <Pause size={14} className="text-tn-mute" />
                ) : (
                  <Play size={14} className="text-tn-green" />
                )}
                {isAvailable ? "Pause listing" : "Resume listing"}
              </button>

              {isAvailable && (
                <button
                  type="button"
                  disabled={Boolean(inFlightAction)}
                  onClick={handleMarkSold}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-tn-hair bg-white text-xs font-bold text-tn-ink hover:bg-tn-paper transition-colors cursor-pointer disabled:opacity-50"
                >
                  {inFlightAction === "sold" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Tag size={14} className="text-tn-mute" />
                  )}
                  Mark as sold
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar Actions */}
        <div className="px-6 py-4 border-t border-tn-hair2 bg-tn-paper flex items-center justify-between gap-3 shrink-0">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-tn-ink hover:text-tn-red transition-colors"
          >
            <span>View public page</span>
            <ExternalLink size={13} />
          </Link>

          <div className="flex items-center gap-2.5">
            <Pill
              kind="outline"
              size="sm"
              onClick={onClose}
              type="button"
            >
              Close
            </Pill>

            <Link
              href={`/shop/dashboard/listings/edit?slug=${product.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] whitespace-nowrap transition-[transform,box-shadow,background] duration-150 hover:-translate-y-px hover:bg-tn-red/90 bg-tn-red py-2 px-4 text-xs text-white cursor-pointer shadow-[0_2px_8px_rgba(204,48,0,0.2)]"
            >
              <Pencil size={13} />
              Edit listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
