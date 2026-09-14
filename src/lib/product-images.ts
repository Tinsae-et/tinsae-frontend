import { normalizeImageUrl } from "./format";

/**
 * Resolves the array of backend image URLs from the product.
 * Returns only valid, normalized image URLs provided by the backend API.
 * Never uses hardcoded or external placeholder images.
 */
export function resolveProductGalleryImages(
  existingImages?: (string | null | undefined)[],
): string[] {
  return (existingImages ?? [])
    .filter((img): img is string => typeof img === "string" && img.trim().length > 0)
    .map((img) => normalizeImageUrl(img) || img);
}

/**
 * Returns the primary backend image URL for cards and list views.
 * Returns null if no backend image exists, allowing graceful fallback to SVG placeholder.
 */
export function resolvePrimaryProductImage(
  firstImage?: string | null,
  _categorySlug?: string | null,
): string | null {
  if (!firstImage) return null;
  const clean = normalizeImageUrl(firstImage);
  return clean && clean.trim().length > 0 ? clean : null;
}
