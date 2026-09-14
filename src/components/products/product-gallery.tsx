"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Maximize2, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/tinsae/icon";
import { ProdPlaceholder, type ProductKind } from "@/components/tinsae/prod-placeholder";
import { cn } from "@/lib/utils";
import type { FreshnessTone } from "@/lib/format";
import { resolveProductGalleryImages } from "@/lib/product-images";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const TONE_BADGE: Record<FreshnessTone, string> = {
  fresh: "text-[#157049]",
  stale: "text-tn-ink2",
  unconfirmed: "text-tn-mute",
};

export function ProductGallery({
  images,
  kind,
  tone,
  label,
}: {
  images: string[];
  kind: ProductKind;
  categorySlug?: string | null;
  tone: FreshnessTone;
  /** Pre-resolved badge text, so it can never disagree with `tone`. */
  label: string;
}) {
  const galleryImages = resolveProductGalleryImages(images);
  const hasImages = galleryImages.length > 0;
  const total = hasImages ? galleryImages.length : 1;
  const [idx, setIdx] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const mounted = useIsMounted();

  const activeIdx = Math.min(idx, Math.max(0, total - 1));
  const currentImage = hasImages && !failedImages[activeIdx] ? galleryImages[activeIdx] : null;

  // Swipe & drag detection refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number | null>(null);
  const hasDraggedFar = useRef<boolean>(false);

  const prevImage = () => {
    setIdx((i) => (i - 1 + total) % total);
    setIsZoomed(false);
  };

  const nextImage = () => {
    setIdx((i) => (i + 1) % total);
    setIsZoomed(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchEndX.current - touchStartX.current;
    const threshold = 40; // minimum px movement for swipe
    if (diff > threshold) {
      prevImage();
    } else if (diff < -threshold) {
      nextImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasImages) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    hasDraggedFar.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 8) {
      hasDraggedFar.current = true;
    }
    if (diff > 50) {
      prevImage();
      isDragging.current = false;
      dragStartX.current = null;
    } else if (diff < -50) {
      nextImage();
      isDragging.current = false;
      dragStartX.current = null;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    dragStartX.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasImages) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevImage();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextImage();
    }
  };

  // Lightbox keyboard & scroll-lock handlers
  useEffect(() => {
    if (!lightboxOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setIsZoomed(false);
      } else if (e.key === "ArrowLeft") {
        setIdx((i) => (i - 1 + total) % total);
        setIsZoomed(false);
      } else if (e.key === "ArrowRight") {
        setIdx((i) => (i + 1) % total);
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [lightboxOpen, total]);

  const handleImageError = (imageIdx: number) => {
    setFailedImages((prev) => ({ ...prev, [imageIdx]: true }));
  };

  return (
    <div className="lg:sticky lg:top-[90px] select-none">
      {/* ── Main Viewport Frame ── */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Product image gallery"
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => {
          if (!hasDraggedFar.current && hasImages) {
            setLightboxOpen(true);
          }
        }}
        className={cn(
          "group relative flex aspect-square items-center justify-center overflow-hidden rounded-[22px] border border-tn-hair bg-[#F6F5F2] focus:outline-none focus:ring-2 focus:ring-tn-red/40",
          hasImages ? "cursor-zoom-in active:cursor-grabbing" : "cursor-default",
        )}
      >
        {currentImage ? (
          <Image
            key={currentImage}
            src={currentImage}
            alt={`Product view ${activeIdx + 1}`}
            fill
            priority={activeIdx === 0}
            sizes="(max-width: 950px) 100vw, 50vw"
            className="object-cover transition-opacity duration-200"
            onError={() => handleImageError(activeIdx)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#1E1D1B] to-[#0A0A0A]">
            <ProdPlaceholder kind={kind} />
          </div>
        )}

        {/* Top-left Freshness Badge */}
        <span
          className={cn(
            "pointer-events-none absolute top-4 left-4 inline-flex h-[30px] items-center gap-1.5 rounded-full bg-white/95 px-3 text-[12.5px] font-bold shadow-xs backdrop-blur-xs z-10",
            TONE_BADGE[tone],
          )}
        >
          {tone === "fresh" && <Icon name="check" size={13} />}
          {label}
        </span>

        {/* Top-right Fullscreen / Lightbox Button */}
        {hasImages && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            aria-label="View fullscreen photo"
            title="View fullscreen"
            className="absolute top-4 right-4 size-9 rounded-full bg-white/90 hover:bg-white text-tn-ink shadow-[0_4px_16px_rgba(11,11,11,0.12)] backdrop-blur-xs flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer z-10 opacity-90 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <Maximize2 size={16} strokeWidth={2.2} />
          </button>
        )}

        {/* Navigation Arrow: Previous */}
        {hasImages && total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Previous product image"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 hover:bg-white text-tn-ink shadow-[0_4px_16px_rgba(11,11,11,0.16)] backdrop-blur-xs flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Navigation Arrow: Next */}
        {hasImages && total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Next product image"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 hover:bg-white text-tn-ink shadow-[0_4px_16px_rgba(11,11,11,0.16)] backdrop-blur-xs flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Bottom-right Counter Pill */}
        {hasImages && total > 1 && (
          <span className="font-tn-mono pointer-events-none absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1.5 text-[11.5px] font-semibold text-white backdrop-blur-xs z-10">
            {activeIdx + 1} / {total}
          </span>
        )}

        {/* Mobile Swipe Indicators (dots) */}
        {hasImages && total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none sm:hidden">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-2 rounded-full transition-all duration-200",
                  i === activeIdx ? "w-5 bg-white shadow-xs" : "bg-white/50",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail Rail ── */}
      {hasImages && total > 1 && (
        <div className="mt-3.5 grid grid-cols-4 gap-2.5">
          {galleryImages.map((thumbUrl, i) => {
            const isFailed = failedImages[i];
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIdx(i);
                  setIsZoomed(false);
                }}
                aria-label={`View photo ${i + 1} of ${total}`}
                aria-pressed={i === activeIdx}
                className={cn(
                  "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[13px] transition-all cursor-pointer bg-[#F6F5F2]",
                  i === activeIdx
                    ? "border-[2.5px] border-tn-red shadow-xs ring-1 ring-tn-red/30 scale-[1.02]"
                    : "border border-tn-hair hover:border-tn-ink2 opacity-75 hover:opacity-100",
                )}
              >
                {!isFailed ? (
                  <Image
                    src={thumbUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 25vw, 120px"
                    className="object-cover"
                    onError={() => handleImageError(i)}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#151515]">
                    <ProdPlaceholder kind={kind} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Fullscreen Lightbox & Zoom Modal ── */}
      {mounted && lightboxOpen && hasImages && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6 text-white animate-in fade-in duration-200"
          onClick={() => {
            setLightboxOpen(false);
            setIsZoomed(false);
          }}
        >
          {/* Top Bar: Counter & Actions */}
          <div
            className="w-full flex items-center justify-between z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Counter */}
            <span className="font-tn-mono inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white/90 backdrop-blur-md">
              <span>{activeIdx + 1}</span>
              <span className="text-white/40">/</span>
              <span>{total}</span>
            </span>

            {/* Action Buttons: Zoom & Close */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsZoomed((z) => !z)}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                title={isZoomed ? "Zoom out" : "Zoom in"}
                className="size-10 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              >
                {isZoomed ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setIsZoomed(false);
                }}
                aria-label="Close fullscreen gallery"
                title="Close (Esc)"
                className="size-10 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95"
              >
                <X size={20} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Center Image Display Area */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((z) => !z);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Desktop Left Nav */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Previous image"
                className="absolute left-2 sm:left-4 z-20 size-11 sm:size-13 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={26} strokeWidth={2.4} />
              </button>
            )}

            {/* Main Lightbox Image */}
            <div
              className={cn(
                "relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center transition-transform duration-300 ease-out",
                isZoomed ? "scale-[1.75] cursor-zoom-out" : "scale-100 cursor-zoom-in",
              )}
            >
              {currentImage ? (
                <Image
                  key={currentImage}
                  src={currentImage}
                  alt={`Product view ${activeIdx + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain pointer-events-none"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center">
                  <ProdPlaceholder kind={kind} />
                </div>
              )}
            </div>

            {/* Desktop Right Nav */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next image"
                className="absolute right-2 sm:right-4 z-20 size-11 sm:size-13 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
              >
                <ChevronRight size={26} strokeWidth={2.4} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {total > 1 && (
            <div
              className="flex items-center gap-2 sm:gap-3 max-w-full overflow-x-auto p-2 rounded-2xl bg-white/10 backdrop-blur-md z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((thumbUrl, i) => {
                const isFailed = failedImages[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setIdx(i);
                      setIsZoomed(false);
                    }}
                    aria-label={`Jump to photo ${i + 1}`}
                    className={cn(
                      "relative size-12 sm:size-15 shrink-0 rounded-xl overflow-hidden transition-all cursor-pointer",
                      i === activeIdx
                        ? "border-2 border-white ring-2 ring-tn-red scale-105 shadow-md"
                        : "border border-white/20 opacity-60 hover:opacity-100",
                    )}
                  >
                    {!isFailed ? (
                      <Image
                        src={thumbUrl}
                        alt=""
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-black/50">
                        <ProdPlaceholder kind={kind} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}

