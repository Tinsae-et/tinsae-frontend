"use client";

import { useState } from "react";
import { useCategorySchemas } from "@/hooks/use-category-schemas";
import {
  buildSpecs,
  initialSpecValues,
  validateSpecs,
  type CategorySchema,
  type SpecValues,
} from "@/lib/specs/schema";
import type { ShopProduct } from "@/lib/types";

/**
 * The listing form's specs: the category's schema, the values, their errors
 * and the payload to save.
 *
 * Only the owner's edits are state. The saved listing's values are derived
 * from its category's schema once that loads, so there is no effect copying
 * data into state and nothing to get out of step. Edits survive a category
 * switch; only the current schema's fields are shown, validated and saved.
 */
export function useListingSpecs({
  category,
  condition,
  initialProduct,
}: {
  category: string;
  condition: string;
  initialProduct: ShopProduct | null;
}) {
  const initialCategory = initialProduct?.category ?? "";
  const { schemas, failed } = useCategorySchemas([category, initialCategory]);
  const [edits, setEdits] = useState<SpecValues>({});

  const schema: CategorySchema | null = schemas[category] ?? null;
  const loadFailed = Boolean(category) && failed.includes(category);
  const loading = Boolean(category) && !(category in schemas) && !loadFailed;

  // The saved listing's values, readable once its own category's schema is in.
  const saved = initialSpecValues(schemas[initialCategory] ?? null, initialProduct?.specs);
  const values: SpecValues = { ...saved, ...edits };
  // Conditions such as "battery health when used" read the product condition.
  const context: SpecValues = { ...values, condition };
  const errors = schema ? validateSpecs(schema, context) : {};

  // Lists compare by content: re-picking the same sizes is not an edit.
  const same = (a: string | string[] = "", b: string | string[]) =>
    JSON.stringify(a) === JSON.stringify(b);
  const isDirty = Object.entries(edits).some(([key, value]) => !same(saved[key], value));

  /** The `specs` to send, with the free-text model/variant alongside. */
  const toPayload = (variant: string): Record<string, unknown> => {
    // Older keys ride along only while the category is unchanged: the backend
    // accepts them on the listing's own category and rejects them on a move,
    // where they would be errors on fields the owner cannot see.
    const existing: Record<string, unknown> =
      category === initialCategory ? { ...(initialProduct?.specs ?? {}) } : {};
    delete existing.variant;
    const specs = schema ? buildSpecs(schema, context, existing) : existing;
    return variant.trim() ? { ...specs, variant: variant.trim() } : specs;
  };

  return {
    schema,
    loading,
    loadFailed,
    /** Values plus `condition`, as the fields and their rules read them. */
    context,
    errors,
    isDirty,
    setValue: (key: string, value: string | string[]) => setEdits((prev) => ({ ...prev, [key]: value })),
    toPayload,
  };
}
