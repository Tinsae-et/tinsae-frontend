import type { Shop } from "./types";

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

export const SHOPS_RICH: DirectoryShop[] = [
  {
    id: "al",
    slug: "almeda-electronics",
    name: "Almeda Electronics",
    hood: "Atlas",
    city: "Bole",
    rating: 4.9,
    ratings: 312,
    listings: 142,
    replyRate: 98,
    responseTime: 14,
    memberSince: "2021",
    dist: 0.6,
    cats: ["Phones", "Laptops"],
    color: "#0F2A4D",
    isVerified: true,
    top: true,
    x: 54,
    y: 44,
    telegramUsername: "almeda_electronics",
    phone: "+251911223344",
  },
  {
    id: "sh",
    slug: "sheba-computers",
    name: "Sheba Computers",
    hood: "Japan",
    city: "Bole",
    rating: 4.9,
    ratings: 188,
    listings: 96,
    replyRate: 95,
    responseTime: 16,
    memberSince: "2020",
    dist: 1.1,
    cats: ["Laptops", "Cameras"],
    color: "#2D4A5E",
    isVerified: true,
    top: true,
    x: 33,
    y: 30,
    telegramUsername: "sheba_computers",
    phone: "+251911334455",
  },
  {
    id: "ax",
    slug: "axum-digital-store",
    name: "Axum Digital Store",
    hood: "Olympia",
    city: "Bole",
    rating: 4.8,
    ratings: 251,
    listings: 104,
    replyRate: 91,
    responseTime: 22,
    memberSince: "2021",
    dist: 1.4,
    cats: ["Phones", "Cameras"],
    color: "#3B5742",
    isVerified: true,
    top: true,
    x: 70,
    y: 58,
    telegramUsername: "axum_digital",
    phone: "+251911445566",
  },
  {
    id: "mt",
    slug: "mosaic-tech-hub",
    name: "Mosaic Tech Hub",
    hood: "Friendship",
    city: "Bole",
    rating: 4.8,
    ratings: 204,
    listings: 88,
    replyRate: 94,
    responseTime: 20,
    memberSince: "2023",
    dist: 0.9,
    cats: ["Laptops", "Audio"],
    color: "#5A3E6E",
    isVerified: true,
    x: 44,
    y: 64,
    telegramUsername: "mosaic_tech",
    phone: "+251911556677",
  },
  {
    id: "km",
    slug: "kuriftu-mobile",
    name: "Kuriftu Mobile",
    hood: "Medhanialem",
    city: "Bole",
    rating: 4.7,
    ratings: 176,
    listings: 67,
    replyRate: 89,
    responseTime: 28,
    memberSince: "2023",
    dist: 1.3,
    cats: ["Phones", "Accessories"],
    color: "#8A5A1E",
    isVerified: true,
    x: 22,
    y: 54,
    telegramUsername: "kuriftu_mobile",
    phone: "+251911667788",
  },
  {
    id: "la",
    slug: "lalibela-gadgets",
    name: "Lalibela Gadgets",
    hood: "Mickey Leland",
    city: "Bole",
    rating: 4.7,
    ratings: 143,
    listings: 71,
    replyRate: 90,
    responseTime: 18,
    memberSince: "2022",
    dist: 1.8,
    cats: ["Phones", "Tablets"],
    color: "#7A2E2E",
    isVerified: true,
    x: 78,
    y: 34,
    telegramUsername: "lalibela_gadgets",
    phone: "+251911778899",
  },
  {
    id: "gd",
    slug: "gada-trading",
    name: "Gada Trading",
    hood: "Rwanda",
    city: "Bole",
    rating: 4.6,
    ratings: 98,
    listings: 53,
    replyRate: 82,
    responseTime: 40,
    memberSince: "2024",
    dist: 2.4,
    cats: ["Accessories", "Audio"],
    color: "#5A4A2E",
    isVerified: true,
    x: 60,
    y: 78,
    telegramUsername: "gada_trading",
    phone: "+251911889900",
  },
  {
    id: "en",
    slug: "entoto-mobile-center",
    name: "Entoto Mobile Center",
    hood: "Bulgaria",
    city: "Bole",
    rating: 4.5,
    ratings: 76,
    listings: 44,
    replyRate: 80,
    responseTime: 45,
    memberSince: "2024",
    dist: 2.9,
    cats: ["Phones", "Accessories"],
    color: "#444A52",
    isVerified: true,
    x: 30,
    y: 78,
    telegramUsername: "entoto_mobile",
    phone: "+251911990011",
  },
  {
    id: "bx",
    slug: "bole-express-tech",
    name: "Bole Express Tech",
    hood: "Atlas",
    city: "Bole",
    rating: 4.2,
    ratings: 34,
    listings: 25,
    replyRate: 74,
    responseTime: 60,
    memberSince: "2024",
    dist: 0.8,
    cats: ["Phones", "Accessories"],
    color: "#64748B",
    isVerified: false,
    x: 50,
    y: 40,
    telegramUsername: "bole_express",
    phone: "+251911001122",
  },
];

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
      hood = shop.city || "Bole";
    }
  }

  return {
    id: String(shop.id),
    slug: shop.slug,
    name: shop.name,
    hood,
    city: shop.city?.includes("·") ? shop.city.split("·")[0].trim() : (shop.city || "Addis Ababa"),
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
    telegramUsername: match?.telegramUsername,
    phone: shop.phone || match?.phone,
    x: match?.x,
    y: match?.y,
  };
}
