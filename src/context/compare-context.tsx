"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
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

function getCompareSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function subscribeToCompare(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("tinsae-compare-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tinsae-compare-change", callback);
  };
}

function saveSlugsToStorage(newSlugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlugs));
  } catch {
    // Ignore storage errors
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tinsae-compare-change"));
  }
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const rawSlugs = useSyncExternalStore(
    subscribeToCompare,
    getCompareSnapshot,
    getServerSnapshot,
  );

  const slugs = useMemo(() => {
    try {
      const parsed = JSON.parse(rawSlugs);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE_ITEMS) : [];
    } catch {
      return [];
    }
  }, [rawSlugs]);

  const [toast, setToast] = useState<CompareToastData>(null);

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
      saveSlugsToStorage(next);
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
      const next = slugs.filter((s) => s !== slug);
      saveSlugsToStorage(next);
    },
    [slugs],
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
    saveSlugsToStorage(unique);
  }, []);

  const clearCompare = useCallback(() => {
    saveSlugsToStorage([]);
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

