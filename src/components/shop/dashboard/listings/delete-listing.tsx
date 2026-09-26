"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { deleteProduct } from "@/lib/api/client";
import { ShopProduct } from "@/lib/types";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useModal } from "@/hooks/use-modal";

type Props = {
  setDeleteItem: (b: boolean) => void;
  shopSlug: string;
  product: ShopProduct;
  onDeleted?: (slug: string) => void;
};

export default function DeleteListing({
  setDeleteItem,
  shopSlug,
  product,
  onDeleted,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Escape is ignored mid-delete, like the backdrop and Cancel.
  const dialogRef = useModal<HTMLDivElement>(true, () => setDeleteItem(false), {
    closeOnEscape: !isDeleting,
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteProduct(shopSlug, product.slug);
      setDeleteItem(false);
      onDeleted?.(product.slug);
    } catch {
      setError("Failed to delete this listing. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Portalled to <body>: callers render this inside a table row, where a
  // <div> is invalid HTML (and a hydration error). React events still bubble
  // to the row, whose click opens the listing drawer, so the backdrop stops
  // them like the dialog does.
  return createPortal(
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!isDeleting) setDeleteItem(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-listing-title"
        aria-describedby="delete-listing-desc"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl shadow-black/10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setDeleteItem(false)}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center mx-auto rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={2} />
        </div>
        <h3 id="delete-listing-title" className="mt-4 text-lg text-center font-semibold text-neutral-900">
          Delete this listing?
        </h3>
        <p id="delete-listing-desc" className="mt-1.5 text-sm text-center leading-relaxed text-neutral-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-neutral-800">{product.name}</span>?
          This action can&apos;t be undone.
        </p>

        {error && (
          <p className="mt-3 text-xs text-center font-medium text-red-600 bg-red-50 py-1.5 px-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setDeleteItem(false)}
            className="flex-1 rounded-full border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-colors hover:bg-red-700 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
