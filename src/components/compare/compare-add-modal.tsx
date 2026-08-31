"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/tinsae/icon";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { formatETB } from "@/lib/format";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useCompare } from "@/hooks/use-compare";
import { useDebouncedValue } from "@/hooks/use-debounce";

export function CompareAddModal({
  isOpen,
  onClose,
  currentCategory = "phones",
}: {
  isOpen: boolean;
  onClose: () => void;
  currentCategory?: string;
}) {
  const { isInCompare, addToCompare } = useCompare();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(currentCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    Promise.resolve().then(() => {
      if (!isCancelled) {
        setLoading(true);
      }
    });

    getProducts({
      q: debouncedSearch.trim() || undefined,
      category: category || undefined,
      pageSize: 16,
    })
      .then((res) => {
        if (!isCancelled) {
          setProducts(res.results);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, debouncedSearch, category]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in-0 fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="border-tn-hair animate-in zoom-in-95 relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="border-tn-hair flex items-center justify-between border-b px-6 py-4.5">
          <div>
            <h2 id="modal-title" className="text-tn-ink text-xl font-extrabold tracking-tight">
              Add product to compare
            </h2>
            <p className="text-tn-mute mt-0.5 text-xs font-semibold">
              Select up to 4 products to compare specs and verified prices side by side
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:bg-tn-paper text-tn-mute hover:text-tn-ink inline-flex size-9 items-center justify-center rounded-full transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="border-tn-hair2 bg-tn-paper/50 flex flex-col gap-2.5 border-b p-4 sm:flex-row">
          <div className="border-tn-hair flex flex-1 items-center gap-2 rounded-full border bg-white px-3.5 py-2">
            <Icon name="search" size={16} className="text-tn-mute shrink-0" />
            <input
              type="search"
              placeholder="Search phone or model (e.g. iPhone 15, S24...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-tn-ink placeholder:text-tn-mute flex-1 bg-transparent text-sm font-medium outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: "Phones", slug: "phones" },
              { label: "Laptops", slug: "laptops" },
              { label: "Audio", slug: "audio" },
              { label: "All", slug: "" },
            ].map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategory(cat.slug)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  category === cat.slug
                    ? "bg-tn-ink text-white"
                    : "hover:bg-tn-paper border-tn-hair border bg-white text-tn-ink2"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border-tn-hair flex animate-pulse items-center gap-3 rounded-2xl border bg-white p-3"
                >
                  <div className="bg-tn-hair2 size-16 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-tn-hair2 h-4 w-3/4 rounded" />
                    <div className="bg-tn-hair2 h-3.5 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-tn-paper text-tn-mute flex size-12 items-center justify-center rounded-full">
                <Icon name="search" size={20} />
              </div>
              <p className="text-tn-ink mt-3 text-base font-bold">No products found</p>
              <p className="text-tn-mute mt-1 text-xs">
                Try a different search query or clear category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {products.map((product) => {
                const alreadyAdded = isInCompare(product.slug);
                const image = product.images?.[0]?.url || null;

                return (
                  <div
                    key={product.id}
                    className={`border-tn-hair flex items-center gap-3 rounded-2xl border bg-white p-3 transition-colors ${
                      alreadyAdded ? "bg-tn-paper/40 opacity-70" : "hover:border-tn-ink/30"
                    }`}
                  >
                    <div className="bg-tn-paper relative size-16 shrink-0 overflow-hidden rounded-xl">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-tn-mute line-clamp-1 text-[10.5px] font-bold uppercase">
                        {product.category?.name ?? "Electronics"}
                      </p>
                      <h4 className="text-tn-ink line-clamp-1 text-sm font-bold">
                        {product.title}
                      </h4>
                      <p className="font-tn-mono text-tn-red text-xs font-bold">
                        {formatETB(product.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => {
                        const added = addToCompare(product.slug, product.title);
                        if (added) onClose();
                      }}
                      className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-bold transition-colors ${
                        alreadyAdded
                          ? "bg-tn-paper text-tn-mute cursor-not-allowed"
                          : "bg-tn-ink hover:bg-black text-white shadow-xs"
                      }`}
                    >
                      {alreadyAdded ? (
                        <>
                          <Icon name="check" size={11} />
                          Added
                        </>
                      ) : (
                        <>
                          <Icon name="plus" size={11} />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
