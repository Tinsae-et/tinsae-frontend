"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export interface SavedItemRecord {
  slug: string;
  savedAt: number;
}

const STORAGE_KEY = "tinsae_saved_products";

function getSavedSnapshot(): string {
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

function subscribeToSaved(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("tinsae-saved-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tinsae-saved-change", callback);
  };
}

function writeSavedToStorage(records: SavedItemRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota / private mode errors
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tinsae-saved-change"));
  }
}

export function formatSavedAgo(timestamp: number): string {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes}m ago`;
  const days = Math.floor(hours / 24);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function useSaved() {
  const rawData = useSyncExternalStore(
    subscribeToSaved,
    getSavedSnapshot,
    getServerSnapshot,
  );

  const records = useMemo<SavedItemRecord[]>(() => {
    try {
      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => {
          if (typeof item === "string") {
            return { slug: item, savedAt: Date.now() };
          }
          if (item && typeof item === "object" && typeof item.slug === "string") {
            return {
              slug: item.slug,
              savedAt: typeof item.savedAt === "number" ? item.savedAt : Date.now(),
            };
          }
          return null;
        })
        .filter((r): r is SavedItemRecord => r !== null);
    } catch {
      return [];
    }
  }, [rawData]);

  const slugs = useMemo(() => records.map((r) => r.slug), [records]);

  const isSaved = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  const saveProduct = useCallback(
    (slug: string) => {
      if (!slug) return;
      if (slugs.includes(slug)) return;
      const next = [{ slug, savedAt: Date.now() }, ...records];
      writeSavedToStorage(next);
    },
    [slugs, records],
  );

  const removeSaved = useCallback(
    (slug: string) => {
      const next = records.filter((r) => r.slug !== slug);
      writeSavedToStorage(next);
    },
    [records],
  );

  const toggleSaved = useCallback(
    (slug: string) => {
      if (isSaved(slug)) {
        removeSaved(slug);
      } else {
        saveProduct(slug);
      }
    },
    [isSaved, removeSaved, saveProduct],
  );

  const clearSaved = useCallback(() => {
    writeSavedToStorage([]);
  }, []);

  return {
    records,
    slugs,
    count: slugs.length,
    isSaved,
    saveProduct,
    removeSaved,
    toggleSaved,
    clearSaved,
  };
}
