"use client";

import { useEffect, useState } from "react";
import { getNavCategories, type NavCategory } from "@/lib/nav-categories";

// Loaded once per page and shared by every caller; a failed load is not
// cached, so the next mount retries.
let categoriesPromise: Promise<NavCategory[]> | null = null;

function loadCategories(): Promise<NavCategory[]> {
  categoriesPromise ??= getNavCategories().then((list) => {
    if (list.length === 0) categoriesPromise = null;
    return list;
  });
  return categoriesPromise;
}

/** The backend's top-level categories for client components; empty until loaded. */
export function useCategories(): NavCategory[] {
  const [categories, setCategories] = useState<NavCategory[]>([]);

  useEffect(() => {
    let active = true;
    loadCategories().then((list) => {
      if (active) setCategories(list);
    });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
