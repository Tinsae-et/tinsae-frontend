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
  ShopPhoto,
  TelegramConnectResult,
  TelegramState,
} from "../types";
import {
  ApiError,
  shopProductSearchParams,
  type ShopProductQuery,
} from "./public";
import { normalizeImageUrl } from "../format";

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
  const res = await fetch(
    `${shopPath(slug, "products")}${params ? `?${params}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
      ...init,
    },
  );
  if (!res.ok) return failure(res, "Couldn't load products");
  return res.json();
}

export async function updateShopProfile(
  slug: string,
  profile: Partial<ShopProfile> | FormData,
): Promise<Shop> {
  const isFormData =
    typeof FormData !== "undefined" && profile instanceof FormData;
  const res = await fetch(shopPath(slug), {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? profile : JSON.stringify(profile),
  });

  if (!res.ok) {
    let message = `Could not update shop (${res.status})`;
    let errorData: Record<string, unknown> | undefined;
    try {
      errorData = (await res.json()) as Record<string, unknown>;
      if (errorData && typeof errorData === "object") {
        const firstField = Object.values(errorData).find(Array.isArray) as
          | string[]
          | undefined;
        const detail =
          typeof errorData.detail === "string" ? errorData.detail : undefined;
        message = detail || firstField?.[0] || message;
      }
    } catch {
      // Keep default message
    }
    throw new ApiError(message, res.status, errorData);
  }
  return res.json();
}

export async function getShopPhotos(slug: string): Promise<ShopPhoto[]> {
  const res = await fetch(shopPath(slug, "photos"), { cache: "no-store" });
  if (!res.ok) return failure(res, "Could not load shop photos");
  const data = await res.json();
  const photos = Array.isArray(data) ? data : data.results;
  return photos.map((photo: ShopPhoto) => ({
    ...photo,
    url: normalizeImageUrl(photo.url) || photo.url,
  }));
}

export async function uploadShopPhoto(
  slug: string,
  file: File,
  displayOrder: number,
  isCover: boolean,
): Promise<ShopPhoto> {
  const body = new FormData();
  body.append("image", file);
  body.append("display_order", String(displayOrder));
  body.append("is_cover", String(isCover));
  const res = await fetch(shopPath(slug, "photos"), { method: "POST", body });
  if (!res.ok) return failure(res, "Could not upload shop photo");
  const photo = (await res.json()) as ShopPhoto;
  return { ...photo, url: normalizeImageUrl(photo.url) || photo.url };
}

export async function deleteShopPhoto(
  slug: string,
  photoId: number,
): Promise<void> {
  const res = await fetch(shopPath(slug, "photos", photoId), {
    method: "DELETE",
  });
  if (!res.ok) return failure(res, "Could not delete shop photo");
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

export function confirmFreshness(
  shopSlug: string,
  productSlug: string,
): Promise<ShopProduct> {
  return productAction(
    shopSlug,
    productSlug,
    "confirm",
    "Couldn't confirm freshness",
  );
}

export function markSold(
  shopSlug: string,
  productSlug: string,
): Promise<ShopProduct> {
  return productAction(
    shopSlug,
    productSlug,
    "mark-sold",
    "Couldn't mark product as sold",
  );
}

export function pauseProduct(
  shopSlug: string,
  productSlug: string,
): Promise<ShopProduct> {
  return productAction(
    shopSlug,
    productSlug,
    "pause",
    "Couldn't pause product",
  );
}

export function resumeProduct(
  shopSlug: string,
  productSlug: string,
): Promise<ShopProduct> {
  return productAction(
    shopSlug,
    productSlug,
    "resume",
    "Couldn't resume product",
  );
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

/** Confirms every product in the shop, respecting the API's batch limit. */
export async function confirmAllShopProducts(
  shopSlug: string,
): Promise<number> {
  const slugs: string[] = [];
  let page = 1;

  while (true) {
    const response = await getShopProducts(
      shopSlug,
      { page, pageSize: 100 },
      { cache: "no-store" },
    );
    slugs.push(...response.results.map((product) => product.slug));
    if (!response.next || response.results.length === 0) break;
    page += 1;
  }

  let confirmed = 0;
  for (let index = 0; index < slugs.length; index += 100) {
    const response = await confirmSelectedFreshness(
      shopSlug,
      slugs.slice(index, index + 100),
    );
    confirmed += response.confirmed.length;
  }
  return confirmed;
}

export async function deleteProduct(
  shopSlug: string,
  productSlug: string,
): Promise<void> {
  const res = await fetch(shopPath(shopSlug, "products", productSlug), {
    method: "DELETE",
  });
  if (!res.ok) return failure(res, "Couldn't delete product");
}

export async function createListing(
  product: NewProduct,
  shopSlug: string,
): Promise<ShopProduct> {
  const res = await fetch(shopPath(shopSlug, "products"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) return failure(res, "Cannot create listing");
  return res.json();
}

export async function updateListing(
  product: NewProduct,
  shopSlug: string,
): Promise<ShopProduct> {
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
  const res = await fetch(
    shopPath(shopSlug, "products", productSlug, "images"),
    {
      cache: "no-store",
    },
  );
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
  const res = await fetch(
    shopPath(shopSlug, "products", productSlug, "images"),
    {
      method: "POST",
      body: imageForm(image),
    },
  );
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
  const res = await fetch(
    shopPath(shopSlug, "products", productSlug, "images", imageId),
    {
      method: "DELETE",
    },
  );
  if (!res.ok) return failure(res, "Failed deleting product image");
}

export async function getTelegramState(slug: string): Promise<TelegramState> {
  const res = await fetch(shopPath(slug, "telegram"), {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return failure(res, "Couldn't load Telegram connection status");
  return res.json();
}

export async function connectTelegram(
  slug: string,
): Promise<TelegramConnectResult> {
  const res = await fetch(shopPath(slug, "telegram", "connect"), {
    method: "POST",
  });
  if (!res.ok)
    return failure(res, "Couldn't generate Telegram connection link");
  return res.json();
}

export async function disconnectTelegram(slug: string): Promise<void> {
  const res = await fetch(shopPath(slug, "telegram", "disconnect"), {
    method: "POST",
  });
  if (!res.ok) return failure(res, "Couldn't disconnect Telegram");
}
