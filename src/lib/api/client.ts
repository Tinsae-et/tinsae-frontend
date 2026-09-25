// The signed-in merchant's calls from the browser.
//
// Every function here calls a same-origin /api/shop route, which reads the
// httpOnly session cookie and attaches the Authorization header server-side
// (lib/auth/django-proxy). None of them takes a token, and none can reach
// Django directly — that is the point of this file. See ./public for the
// layout of the API client as a whole.
import type {
  NewProduct,
  Paginated,
  ProductImage,
  Shop,
  ShopProduct,
  ShopProductImage,
  ShopProfile,
} from "../types";
import { ApiError, shopProductSearchParams, type ShopProductQuery } from "./public";

function shopPath(shopSlug: string, ...rest: (string | number)[]): string {
  return ["/api/shop", shopSlug, ...rest.map(String)]
    .map((part, i) => (i === 0 ? part : encodeURIComponent(part)))
    .join("/");
}

/** Throws an ApiError carrying DRF's body, so forms can map field errors. */
async function failure(res: Response, fallback: string): Promise<never> {
  let data: Record<string, unknown> | undefined;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {}
  const detail = typeof data?.detail === "string" ? data.detail : undefined;
  throw new ApiError(detail || `${fallback} (${res.status})`, res.status, data);
}

/** The signed-in shop's own catalogue. */
export async function getShopProducts(
  slug: string,
  query: ShopProductQuery,
  init?: RequestInit,
): Promise<Paginated<ShopProduct>> {
  const params = shopProductSearchParams(query).toString();
  const res = await fetch(`${shopPath(slug, "products")}${params ? `?${params}` : ""}`, {
    method: "GET",
    cache: "no-store",
    ...init,
  });
  if (!res.ok) return failure(res, "Couldn't load products");
  return res.json();
}

export async function updateShopProfile(
  slug: string,
  profile: Partial<ShopProfile> | FormData,
): Promise<Shop> {
  const isFormData = typeof FormData !== "undefined" && profile instanceof FormData;
  const res = await fetch(shopPath(slug), {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? profile : JSON.stringify(profile),
  });

  if (!res.ok) {
    let message = `Could not update shop (${res.status})`;
    try {
      const err = await res.json();
      // DRF field errors arrive as {field: ["message"]}; surface the first.
      const firstField = Object.values(err ?? {}).find(Array.isArray) as string[] | undefined;
      message = err?.detail || firstField?.[0] || message;
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }
  return res.json();
}

async function productAction(
  shopSlug: string,
  productSlug: string,
  action: "confirm" | "mark-sold" | "pause" | "resume",
  failureMessage: string,
): Promise<ShopProduct> {
  const res = await fetch(shopPath(shopSlug, "products", productSlug, action), {
    method: "POST",
  });
  if (!res.ok) return failure(res, failureMessage);
  return res.json();
}

export function confirmFreshness(shopSlug: string, productSlug: string): Promise<ShopProduct> {
  return productAction(shopSlug, productSlug, "confirm", "Couldn't confirm freshness");
}

export function markSold(shopSlug: string, productSlug: string): Promise<ShopProduct> {
  return productAction(shopSlug, productSlug, "mark-sold", "Couldn't mark product as sold");
}

export function pauseProduct(shopSlug: string, productSlug: string): Promise<ShopProduct> {
  return productAction(shopSlug, productSlug, "pause", "Couldn't pause product");
}

export function resumeProduct(shopSlug: string, productSlug: string): Promise<ShopProduct> {
  return productAction(shopSlug, productSlug, "resume", "Couldn't resume product");
}

export async function confirmSelectedFreshness(
  shopSlug: string,
  slugs: string[],
): Promise<{ confirmed: string[]; not_found: string[] }> {
  const res = await fetch(shopPath(shopSlug, "products", "confirm-all"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slugs }),
  });
  if (!res.ok) return failure(res, "Couldn't confirm all products");
  return res.json();
}

export async function deleteProduct(shopSlug: string, productSlug: string): Promise<void> {
  const res = await fetch(shopPath(shopSlug, "products", productSlug), { method: "DELETE" });
  if (!res.ok) return failure(res, "Couldn't delete product");
}

export async function createListing(product: NewProduct, shopSlug: string): Promise<ShopProduct> {
  const res = await fetch(shopPath(shopSlug, "products"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) return failure(res, "Cannot create listing");
  return res.json();
}

export async function updateListing(product: NewProduct, shopSlug: string): Promise<ShopProduct> {
  const res = await fetch(shopPath(shopSlug, "products", product.slug!), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) return failure(res, "Cannot update listing");
  return res.json();
}

/** One of the shop's own products' images, oldest first. */
export async function getListingImages(
  shopSlug: string,
  productSlug: string,
): Promise<ProductImage[]> {
  const res = await fetch(shopPath(shopSlug, "products", productSlug, "images"), {
    cache: "no-store",
  });
  if (!res.ok) return failure(res, "Could not load product images");
  const data = (await res.json()) as ProductImage[] | Paginated<ProductImage>;
  return Array.isArray(data) ? data : data.results;
}

function imageForm(image: ShopProductImage): FormData {
  const formData = new FormData();
  if (image.image instanceof File) formData.append("image", image.image);
  formData.append("display_order", String(image.display_order));
  formData.append("is_primary", String(image.is_primary));
  return formData;
}

export async function uploadListingImage(
  productSlug: string,
  shopSlug: string,
  image: ShopProductImage,
): Promise<ProductImage> {
  const res = await fetch(shopPath(shopSlug, "products", productSlug, "images"), {
    method: "POST",
    body: imageForm(image),
  });
  if (!res.ok) return failure(res, "Failed uploading product image");
  return res.json();
}

export async function updateListingImage(
  productSlug: string,
  shopSlug: string,
  image: ShopProductImage,
): Promise<ProductImage> {
  const res = await fetch(
    shopPath(shopSlug, "products", productSlug, "images", String(image.id)),
    { method: "PATCH", body: imageForm(image) },
  );
  if (!res.ok) return failure(res, "Failed updating product image");
  return res.json();
}

export async function deleteListingImage(
  productSlug: string,
  shopSlug: string,
  imageId: number,
): Promise<void> {
  const res = await fetch(shopPath(shopSlug, "products", productSlug, "images", imageId), {
    method: "DELETE",
  });
  if (!res.ok) return failure(res, "Failed deleting product image");
}
