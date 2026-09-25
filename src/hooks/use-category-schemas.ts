"use client";

import { useEffect, useState } from "react";
import { getCategorySchema } from "@/lib/api/public";
import type { CategorySchema } from "@/lib/specs/schema";

// One request per category per page load, shared by every caller. A failed
// request is not cached, so the next caller retries.
const cache = new Map<string, Promise<CategorySchema | null>>();

function load(slug: string): Promise<CategorySchema | null> {
  let pending = cache.get(slug);
  if (!pending) {
    pending = getCategorySchema(slug);
    pending.catch(() => cache.delete(slug));
    cache.set(slug, pending);
  }
  return pending;
}

type SchemasState = {
  /** Loaded schemas by slug; `null` for a category that has none. */
  schemas: Record<string, CategorySchema | null>;
  /** Slugs whose schema could not be loaded (network or server error). */
  failed: string[];
};

/**
 * Spec schemas for the given category slugs. A slug is absent from `schemas`
 * until loaded, so "loading", "has none" and "failed" stay distinguishable.
 */
export function useCategorySchemas(slugs: string[]): SchemasState {
  const [state, setState] = useState<SchemasState>({ schemas: {}, failed: [] });
  const key = [...new Set(slugs.filter(Boolean))].sort().join(",");

  useEffect(() => {
    if (!key) return;
    let active = true;
    const wanted = key.split(",");
    Promise.all(
      wanted.map((slug) =>
        load(slug).then(
          (schema) => ({ slug, schema, ok: true }),
          () => ({ slug, schema: null, ok: false }),
        ),
      ),
    ).then((results) => {
      if (!active) return;
      setState((prev) => {
        const schemas = { ...prev.schemas };
        const failed = new Set(prev.failed);
        for (const r of results) {
          if (r.ok) {
            schemas[r.slug] = r.schema;
            failed.delete(r.slug);
          } else {
            failed.add(r.slug);
          }
        }
        return { schemas, failed: [...failed] };
      });
    });
    return () => {
      active = false;
    };
  }, [key]);

  return state;
}
