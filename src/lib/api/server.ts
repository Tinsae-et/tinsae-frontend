import "server-only";

// Reads made *as the signed-in user*, from Server Components only.
//
// The access token comes from the httpOnly cookie here and is never a
// parameter, so there is no way to hand one to a Client Component. There is
// deliberately no refresh-and-retry: a Server Component cannot write cookies,
// so a rotated refresh token would be lost and the session silently ended.
// The proxy has already refreshed the access token before any page renders.
import type { Paginated, Shop, ShopPhoto, ShopProduct, ShopProductImage, TelegramState } from "../types";
import type { VerificationStateResponse } from "../verification";
import { SERVER_API_URL } from "../config";
import { readSession } from "../auth/session";
import { ApiError } from "./public";

const TIMEOUT_MS = 8_000;

async function getAsUser<T>(path: string, what: string): Promise<T> {
  const { access } = await readSession();
  if (!access) throw new ApiError("Authentication required.", 401);

  const res = await fetch(`${SERVER_API_URL}/api/v1/${path}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    let data: Record<string, unknown> | undefined;
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {}
    const detail = typeof data?.detail === "string" ? data.detail : undefined;
    throw new ApiError(detail || `Couldn't load ${what} (${res.status})`, res.status, data);
  }
  return res.json();
}

/** One of the signed-in shop's own products (drafts and paused included). */
export function getShopProduct(shopSlug: string, productSlug: string): Promise<ShopProduct> {
  return getAsUser(
    `shops/${encodeURIComponent(shopSlug)}/products/${encodeURIComponent(productSlug)}/`,
    "product",
  );
}

export function getProductImages(
  shopSlug: string,
  productSlug: string,
): Promise<Paginated<ShopProductImage>> {
  return getAsUser(
    `shops/${encodeURIComponent(shopSlug)}/products/${encodeURIComponent(productSlug)}/images/`,
    "product images",
  );
}

export function getTelegramState(shopSlug: string): Promise<TelegramState> {
  return getAsUser(
    `shops/${encodeURIComponent(shopSlug)}/telegram/`,
    "Telegram connection state",
  );
}

/**
 * The signed-in owner's view of their shop. Unlike the public read in ./public,
 * this carries owner-only fields such as `address` — a settings form seeded
 * from the public view would save those back as blanks.
 */
export function getOwnShop(shopSlug: string): Promise<Shop> {
  return getAsUser(`shops/${encodeURIComponent(shopSlug)}/`, "shop");
}

export function getVerificationState(shopSlug: string): Promise<VerificationStateResponse> {
  return getAsUser(
    `shops/${encodeURIComponent(shopSlug)}/verification/state/`,
    "verification state",
  );
}

/** The shop's cover photo — the banner on its public page — or null. */
export async function getShopCover(shopSlug: string): Promise<ShopPhoto | null> {
  const data = await getAsUser<ShopPhoto[] | Paginated<ShopPhoto>>(
    `shops/${encodeURIComponent(shopSlug)}/photos/`,
    "shop photos",
  );
  const photos = Array.isArray(data) ? data : (data.results ?? []);
  return photos.find((photo) => photo.is_cover) ?? null;
}
