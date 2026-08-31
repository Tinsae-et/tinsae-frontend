"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const MAX_COMPARE_ITEMS = 4;
export const MIN_COMPARE_ITEMS = 2;
const STORAGE_KEY = "tinsae_compare_slugs";

export type ToastType = "info" | "success" | "warning" | "error";

export type CompareToastData = {
  id: string;
  message: string;
  type?: ToastType;
} | null;

type CompareContextValue = {
  slugs: string[];
  count: number;
  maxItems: number;
  minItems: number;
  addToCompare: (slug: string, title?: string) => boolean;
  removeFromCompare: (slug: string) => void;
  toggleCompare: (slug: string, title?: string) => void;
  setCompareSlugs: (slugs: string[]) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
  toast: CompareToastData;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [toast, setToast] = useState<CompareToastData>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSlugs(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }
    } catch {
      // Ignore storage errors
    }
    setMounted(true);
  }, []);

  // Sync to localStorage whenever slugs change (after mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      // Ignore storage errors
    }
  }, [slugs, mounted]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const addToCompare = useCallback(
    (slug: string, title?: string): boolean => {
      const cleanSlug = slug.trim();
      if (!cleanSlug) return false;

      if (slugs.includes(cleanSlug)) {
        showToast(
          title ? `"${title}" is already in compare` : "Product is already in compare",
          "info",
        );
        return true;
      }

      if (slugs.length >= MAX_COMPARE_ITEMS) {
        showToast(
          `You can compare up to ${MAX_COMPARE_ITEMS} products at once. Remove one to add another.`,
          "warning",
        );
        return false;
      }

      const next = [...slugs, cleanSlug];
      setSlugs(next);
      showToast(
        title
          ? `Added "${title}" to compare (${next.length}/${MAX_COMPARE_ITEMS})`
          : `Added to compare (${next.length}/${MAX_COMPARE_ITEMS})`,
        "success",
      );
      return true;
    },
    [slugs, showToast],
  );

  const removeFromCompare = useCallback(
    (slug: string) => {
      setSlugs((prev) => prev.filter((s) => s !== slug));
    },
    [],
  );

  const toggleCompare = useCallback(
    (slug: string, title?: string) => {
      if (slugs.includes(slug)) {
        removeFromCompare(slug);
        showToast(
          title ? `Removed "${title}" from compare` : "Removed from compare",
          "info",
        );
      } else {
        addToCompare(slug, title);
      }
    },
    [slugs, addToCompare, removeFromCompare, showToast],
  );

  const setCompareSlugs = useCallback((newSlugs: string[]) => {
    const unique = Array.from(new Set(newSlugs)).slice(0, MAX_COMPARE_ITEMS);
    setSlugs(unique);
  }, []);

  const clearCompare = useCallback(() => {
    setSlugs([]);
    showToast("Cleared all products from comparison", "info");
  }, [showToast]);

  const isInCompare = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  return (
    <CompareContext.Provider
      value={{
        slugs,
        count: slugs.length,
        maxItems: MAX_COMPARE_ITEMS,
        minItems: MIN_COMPARE_ITEMS,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        setCompareSlugs,
        clearCompare,
        isInCompare,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
