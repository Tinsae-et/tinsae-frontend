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
): string | null {
  if (!firstImage) return null;
  const clean = normalizeImageUrl(firstImage);
  return clean && clean.trim().length > 0 ? clean : null;
}

/**
 * Resolves all normalized image URLs from raw product image entries, which may be strings,
 * ProductImage objects ({ url }), or ShopProductImage objects ({ image, preview, url }).
 * The entry flagged `is_primary` comes first, so `[0]` is always the thumbnail to show.
 * Normalizes all backend URLs to relative media paths (/media/...) for reliable local proxying.
 */
export function resolveProductImages(images?: unknown[]): string[] {
  if (!images || !Array.isArray(images)) return [];
  const isPrimary = (img: unknown) =>
    typeof img === "object" && img !== null && (img as { is_primary?: unknown }).is_primary === true;
  // A stable sort: the primary moves to the front, the rest keep their order.
  const ordered = [...images].sort((a, b) => Number(isPrimary(b)) - Number(isPrimary(a)));
  const urls: string[] = [];

  for (const img of ordered) {
    if (!img) continue;
    let raw = "";
    if (typeof img === "string") {
      raw = img;
    } else if (typeof img === "object") {
      const obj = img as Record<string, unknown>;
      raw =
        (typeof obj.url === "string" && obj.url) ||
        (typeof obj.image === "string" && obj.image) ||
        (typeof obj.preview === "string" && obj.preview) ||
        "";
    }
    if (raw && raw.trim().length > 0) {
      const normalized = normalizeImageUrl(raw) || raw;
      if (normalized && !urls.includes(normalized)) {
        urls.push(normalized);
      }
    }
  }

  return urls;
}
