import type { Shop } from "./types";
import { SHOPS_RICH } from "./demo/shops";

export type DirectoryShop = {
  id: string;
  slug: string;
  name: string;
  hood: string;
  city: string;
  rating: number;
  ratings: number;
  listings: number;
  replyRate: number; // percentage, e.g. 98
  responseTime: number; // minutes, e.g. 14
  memberSince: string; // e.g. '2021'
  dist: number; // kilometers, e.g. 0.6
  cats: string[]; // e.g. ['Phones', 'Laptops']
  color: string; // brand hex color
  isVerified: boolean;
  top?: boolean;
  telegramUsername?: string;
  phone?: string;
  x?: number; // map pin x %
  y?: number; // map pin y %
};


export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export function getShopColor(name: string): string {
  const palette = [
    "#0F2A4D",
    "#1A4178",
    "#2D4A5E",
    "#3B5742",
    "#5A4A2E",
    "#7A2E2E",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return palette[Math.abs(h) % palette.length];
}

/**
 * Adapts an API shop to the directory card's shape.
 *
 * PLACEHOLDER: rating, ratings, replyRate, responseTime, dist, cats and the
 * map pin are not served by the API yet. They are borrowed from a matching
 * demo shop (lib/demo) or invented from `is_verified`. Before launch, make
 * these optional and hide them in the cards until the backend provides them.
 */
export function mapShopToDirectoryShop(shop: Shop): DirectoryShop {
  const match = SHOPS_RICH.find(
    (m) =>
      m.slug === shop.slug ||
      m.name.toLowerCase().trim() === shop.name.toLowerCase().trim(),
  );

  const memberSince = shop.created_at
    ? String(new Date(shop.created_at).getFullYear())
    : match?.memberSince ?? "2024";

  let hood = match?.hood;
  if (!hood) {
    if (shop.city?.includes("·")) {
      hood = shop.city.split("·")[1].trim();
    } else if (shop.city?.includes(".")) {
      hood = shop.city.split(".")[1].trim();
    } else {
      hood = shop.city || "Ethiopia";
    }
  }

  return {
    id: String(shop.id),
    slug: shop.slug,
    name: shop.name,
    hood,
    city: shop.city?.includes("·") ? shop.city.split("·")[0].trim() : (shop.city || "Ethiopia"),
    rating: match?.rating ?? (shop.is_verified ? 4.8 : 4.2),
    ratings:
      match?.ratings ??
      ((shop.active_listings_count ?? 0) > 0 ? shop.active_listings_count! * 2 + 10 : 15),
    listings: shop.active_listings_count ?? match?.listings ?? 0,
    replyRate: match?.replyRate ?? (shop.is_verified ? 95 : 75),
    responseTime: match?.responseTime ?? (shop.is_verified ? 15 : 45),
    memberSince,
    dist: match?.dist ?? 1.2,
    cats: match?.cats ?? ["Electronics"],
    color: match?.color ?? getShopColor(shop.name),
    isVerified: shop.is_verified,
    top: match?.top ?? shop.is_verified,
    // Contact details come from the API only. Borrowing them from a demo shop
    // matched by *name* could send buyers to a stranger's number.
    telegramUsername: undefined,
    phone: shop.phone,
    x: match?.x,
    y: match?.y,
  };
}
