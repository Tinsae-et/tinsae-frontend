"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { useCompare } from "@/hooks/use-compare";
import { CompareTable } from "./compare-table";
import { CompareEmptyState } from "./compare-empty-state";
import { CompareAddModal } from "./compare-add-modal";
import { getProduct } from "@/lib/api";
import type { CompareItem } from "@/lib/compare-helpers";

export function ComparePageClient({
  initialItems,
  initialSlugs,
}: {
  initialItems: CompareItem[];
  initialSlugs: string[];
}) {
  const router = useRouter();
  const {
    slugs: storedSlugs,
    setCompareSlugs,
    removeFromCompare,
    clearCompare,
    showToast,
    maxItems,
    minItems,
  } = useCompare();

  const [items, setItems] = useState<CompareItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync with context on initial mount
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialSlugs.length > 0) {
      // URL has items -> update stored slugs to match URL
      setCompareSlugs(initialSlugs);
    } else if (storedSlugs.length > 0) {
      // URL had no items but localStorage has them -> update URL
      const search = new URLSearchParams();
      search.set("items", storedSlugs.join(","));
      router.replace(`/compare?${search.toString()}`);
    }
  }, [initialSlugs, storedSlugs, setCompareSlugs, router]);

  // Sync items whenever context slugs change
  useEffect(() => {
    if (!hasInitialized.current) return;
    const currentSlugs = items.map((i) => (i.isAvailable ? i.product.slug : i.slug));
    const isSame =
      currentSlugs.length === storedSlugs.length &&
      currentSlugs.every((s, idx) => s === storedSlugs[idx]);

    if (isSame) return;

    // Keep URL query in sync
    if (storedSlugs.length > 0) {
      const search = new URLSearchParams(window.location.search);
      search.set("items", storedSlugs.join(","));
      window.history.replaceState(null, "", `/compare?${search.toString()}`);
    } else {
      window.history.replaceState(null, "", "/compare");
    }

    let isCancelled = false;
    Promise.resolve().then(() => {
      if (!isCancelled) setLoading(true);
    });

    Promise.all(
      storedSlugs.map(async (slug): Promise<CompareItem> => {
        try {
          const product = await getProduct(slug);
          return { isAvailable: true, product };
        } catch {
          return { isAvailable: false, slug };
        }
      }),
    )
      .then((fetched) => {
        if (!isCancelled) {
          setItems(fetched);
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
  }, [storedSlugs, items]);

  // Handle single item remove
  const handleRemove = useCallback(
    (slug: string) => {
      removeFromCompare(slug);
    },
    [removeFromCompare],
  );

  // Handle share / save comparison
  const handleSaveComparison = useCallback(() => {
    const activeSlugs = items.map((i) => (i.isAvailable ? i.product.slug : i.slug));
    if (activeSlugs.length === 0) {
      showToast("Add products before saving comparison", "info");
      return;
    }

    const url = `${window.location.origin}/compare?items=${activeSlugs.join(",")}`;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true);
          showToast("Comparison link copied to clipboard! Share it anytime.", "success");
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(() => {
          showToast("Comparison link ready in URL bar", "info");
        });
    } else {
      showToast("Comparison link ready in URL bar", "info");
    }
  }, [items, showToast]);

  // Category name for subtitle
  const firstCategory = items.find((i) => i.isAvailable && i.product.category?.name)?.product
    .category?.name;
  const categoryLabel = firstCategory ? firstCategory.toLowerCase() : "products";

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 pb-16 sm:px-6 lg:px-7">
      {/* ── Breadcrumbs ── */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-[7px] text-[12.5px] font-semibold"
      >
        <Link href="/" className="text-tn-mute hover:text-tn-ink">
          Home
        </Link>
        <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
        <Link href="/products" className="text-tn-mute hover:text-tn-ink">
          Browse
        </Link>
        {firstCategory && (
          <>
            <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
            <Link
              href={`/products?category=${items.find((i) => i.isAvailable)?.product.category?.slug ?? ""}`}
              className="text-tn-mute hover:text-tn-ink"
            >
              {firstCategory}
            </Link>
          </>
        )}
        <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
        <span className="text-tn-ink">Compare</span>
      </nav>

      {/* ── Page Header Matching 10 Compare.png ── */}
      <div className="mt-4 mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-tn-ink text-[40px] font-extrabold tracking-[-0.035em] sm:text-[46px] leading-[1.05]">
            Compare
          </h1>
          <p className="text-tn-mute mt-1 text-[15px] font-medium">
            {items.length >= minItems
              ? `${items.length} ${categoryLabel} · best price, fastest shop & full specs side by side`
              : "Best price, fastest shop & full specs side by side"}
          </p>
        </div>

        {items.length >= 1 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Save / Share comparison button */}
            <button
              type="button"
              onClick={handleSaveComparison}
              className="border-tn-hair text-tn-ink hover:bg-tn-paper inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-[13.5px] font-bold shadow-xs transition-colors"
            >
              <Icon name={copied ? "check" : "bell"} size={15} className={copied ? "text-tn-green" : "text-tn-ink2"} />
              <span>{copied ? "Link copied!" : "Save comparison"}</span>
            </button>

            {/* Clear all button */}
            <button
              type="button"
              onClick={clearCompare}
              className="border-tn-hair text-tn-ink hover:bg-tn-paper inline-flex h-10 items-center gap-1.5 rounded-full border bg-white px-4 text-[13.5px] font-bold shadow-xs transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content: Table or Empty State ── */}
      {loading ? (
        <div className="border-tn-hair flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border bg-white p-12">
          <div className="bg-tn-red size-10 animate-spin rounded-full border-4 border-white border-t-transparent shadow-md" />
          <p className="text-tn-ink mt-4 text-sm font-bold">Loading fresh specifications...</p>
        </div>
      ) : items.length < minItems ? (
        <CompareEmptyState
          singleProduct={items[0]?.isAvailable ? items[0].product : null}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      ) : (
        <CompareTable
          items={items}
          onRemoveItem={handleRemove}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          maxItems={maxItems}
        />
      )}

      {/* ── Add Product Modal ── */}
      <CompareAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentCategory={items.find((i) => i.isAvailable)?.product.category?.slug ?? "phones"}
      />
    </div>
  );
}
