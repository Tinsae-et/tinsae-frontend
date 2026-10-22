"use client";

import React, { useEffect, useMemo, useRef } from "react";
import type { ShopProductQuery } from "@/lib/api/public";
import { useCategories } from "@/hooks/use-categories";
import type { NavCategory } from "@/lib/nav-categories";
import type { Paginated, Product, Shop } from "@/lib/types";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function CategoryChips({
  query,
  setQuery,
  total,
  shop,
  products = [],
  initialProducts,
}: {
  query: ShopProductQuery;
  setQuery: React.Dispatch<React.SetStateAction<ShopProductQuery>>;
  total: number;
  shop?: Shop;
  products?: Product[];
  initialProducts?: Paginated<Product> | null;
}) {
  const allCategories = useCategories();
  const currentCategory = query.category ?? "";

  // Flatten global nav categories for slug/label lookup
  const navCategoryMap = useMemo(() => {
    const map = new Map<string, { slug: string; label: string }>();

    function add(cat: NavCategory) {
      map.set(cat.slug.toLowerCase(), { slug: cat.slug, label: cat.label });
      map.set(cat.label.toLowerCase(), { slug: cat.slug, label: cat.label });
      if (cat.children?.length) {
        for (const child of cat.children) {
          add(child);
        }
      }
    }

    for (const cat of allCategories) {
      add(cat);
    }
    return map;
  }, [allCategories]);

  // Accumulate discovered product categories so chips do not vanish when filtering down
  const discoveredProductCategoriesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    for (const p of initialProducts?.results ?? []) {
      if (p.category?.slug) {
        discoveredProductCategoriesRef.current.set(p.category.slug, p.category.name);
      }
    }
    for (const p of products) {
      if (p.category?.slug) {
        discoveredProductCategoriesRef.current.set(p.category.slug, p.category.name);
      }
    }
  }, [initialProducts, products]);

  // Chips consist of:
  // 1. Exact categories registered by the shop (shop.categories)
  // 2. Categories from products posted by the shop
  const chips = useMemo(() => {
    const seenSlugs = new Set<string>();
    const list: { id: string; label: string }[] = [];

    const addCategory = (rawIdentifier: string, fallbackLabel?: string) => {
      const trimmed = rawIdentifier.trim();
      if (!trimmed) return;
      const navMatch = navCategoryMap.get(trimmed.toLowerCase());
      const slug = navMatch?.slug ?? trimmed;
      const label = navMatch?.label ?? fallbackLabel ?? formatSlug(trimmed);

      if (!seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        list.push({ id: slug, label });
      }
    };

    // 1. Shop registered categories
    if (shop?.categories && Array.isArray(shop.categories)) {
      for (const cat of shop.categories) {
        addCategory(cat);
      }
    }

    // 2. Discovered product categories
    discoveredProductCategoriesRef.current.forEach((name, slug) => {
      addCategory(slug, name);
    });

    for (const p of initialProducts?.results ?? []) {
      if (p.category?.slug) {
        addCategory(p.category.slug, p.category.name);
      }
    }

    for (const p of products) {
      if (p.category?.slug) {
        addCategory(p.category.slug, p.category.name);
      }
    }

    // 3. Keep current query category visible if active
    if (currentCategory && !seenSlugs.has(currentCategory)) {
      addCategory(currentCategory);
    }

    if (list.length > 0) {
      return [{ id: "", label: "All" }, ...list];
    }

    return [];
  }, [shop?.categories, navCategoryMap, currentCategory, products, initialProducts]);

  if (chips.length <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => {
        const active = currentCategory === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => {
              setQuery((prev) => ({
                ...prev,
                category: chip.id ? chip.id : undefined,
                page: 1,
              }));
            }}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer ${
              active
                ? "border-tn-ink bg-tn-ink text-white"
                : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
            }`}
          >
            <span>{chip.label}</span>
            {active && (
              <span className="font-tn-mono text-xs opacity-70">
                {total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryChips;