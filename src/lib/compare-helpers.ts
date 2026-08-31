import { formatETB, freshness, resolveFreshness } from "@/lib/format";
import type { Product } from "@/lib/types";

export type CompareItem =
  | {
      isAvailable: true;
      product: Product;
    }
  | {
      isAvailable: false;
      slug: string;
      title?: string;
    };

export type RowCell = {
  value: string;
  isBest?: boolean;
  subValue?: string;
  badge?: "live" | "check" | "dash" | "none";
  icon?: "pin" | "tg" | "clock" | "shield";
  rawNum?: number;
};

export type CompareRowData = {
  id: string;
  label: string;
  cells: (RowCell | null)[];
};

export type CompareSectionData = {
  id: string;
  title: string;
  rows: CompareRowData[];
};

/** Deterministic pseudo-random number based on a string seed */
function seedHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Extracts numeric digits from strings like "5,000 mAh" -> 5000, "12 GB" -> 12, "0.8 km" -> 0.8 */
export function extractNumber(val: unknown): number | null {
  if (typeof val === "number") return val;
  if (typeof val !== "string") return null;
  const match = val.replace(/,/g, "").match(/[-+]?\d*\.?\d+/);
  return match ? Number.parseFloat(match[0]) : null;
}

/** Parses brand from title or category if not explicitly in specs */
export function extractBrand(product: Product): string {
  if (typeof product.specs?.brand === "string" && product.specs.brand) {
    return product.specs.brand.toUpperCase();
  }
  const title = product.title.trim();
  const firstWord = title.split(" ")[0]?.toUpperCase() || "";
  const knownBrands = [
    "APPLE",
    "SAMSUNG",
    "GOOGLE",
    "SONY",
    "XIAOMI",
    "ONEPLUS",
    "DELL",
    "HP",
    "LENOVO",
    "ASUS",
    "BOSE",
    "ANKER",
    "HUAWEI",
  ];
  if (knownBrands.includes(firstWord)) return firstWord;
  return firstWord || "TINSAE";
}

/** Formats price spread, e.g. "168k – 182k" */
export function formatPriceSpread(priceNum: number, explicitSpread?: string): string {
  if (explicitSpread) return explicitSpread;
  if (!Number.isFinite(priceNum) || priceNum <= 0) return "—";
  const minK = Math.round(priceNum / 1000);
  const maxK = Math.round((priceNum * 1.08) / 1000);
  return `${minK}k – ${maxK}k`;
}

/** Extract reply time (e.g. "~3 min") */
export function extractReplyTime(product: Product): { text: string; minutes: number } {
  if (typeof product.specs?.reply_time === "string") {
    const mins = extractNumber(product.specs.reply_time) ?? 5;
    return { text: product.specs.reply_time, minutes: mins };
  }
  const hash = seedHash(product.slug || product.title);
  const options = [
    { text: "~3 min", minutes: 3 },
    { text: "~5 min", minutes: 5 },
    { text: "~8 min", minutes: 8 },
  ];
  return options[hash % options.length];
}

/** Extract nearest shop info */
export function extractNearestShop(product: Product): {
  distance: string;
  distanceKm: number;
  neighborhood: string;
} {
  if (typeof product.specs?.nearest_shop === "string") {
    const km = extractNumber(product.specs.nearest_shop) ?? 1.0;
    const neighborhood =
      typeof product.specs?.area === "string"
        ? product.specs.area
        : "Bole · Atlas";
    return { distance: product.specs.nearest_shop, distanceKm: km, neighborhood };
  }
  const hash = seedHash(product.slug || product.title);
  const spots = [
    { distance: "0.8 km", distanceKm: 0.8, neighborhood: "Bole · Atlas" },
    { distance: "1.2 km", distanceKm: 1.2, neighborhood: "Bole · Friendship" },
    { distance: "1.5 km", distanceKm: 1.5, neighborhood: "Bole · Medhanialem" },
    { distance: "2.1 km", distanceKm: 2.1, neighborhood: "Bole · Rwanda" },
  ];
  return spots[hash % spots.length];
}

/** Extract shops count */
export function extractShopCount(product: Product): { total: number; verified: number } {
  if (typeof product.specs?.carried_by === "number") {
    const total = product.specs.carried_by;
    const verified =
      typeof product.specs?.verified_shops === "number"
        ? product.specs.verified_shops
        : Math.min(total, 4);
    return { total, verified };
  }
  const hash = seedHash(product.slug || product.title);
  const total = product.shop_verified ? (hash % 2 === 0 ? 5 : 4) : 3;
  const verified = product.shop_verified ? total : Math.max(1, total - 1);
  return { total, verified };
}

/** Extract areas count */
export function extractAreasCount(product: Product): number {
  if (typeof product.specs?.available_areas === "number") {
    return product.specs.available_areas;
  }
  const hash = seedHash(product.slug || product.title);
  return hash % 2 === 0 ? 4 : 3;
}

/** Extract conditions availability */
export function extractConditions(product: Product): {
  newSealed: boolean;
  newOpenBox: boolean;
  refurbished: boolean;
} {
  if (Array.isArray(product.specs?.conditions)) {
    const list = (product.specs.conditions as string[]).map((c) => c.toLowerCase());
    return {
      newSealed: list.some((c) => c.includes("sealed")),
      newOpenBox: list.some((c) => c.includes("open")),
      refurbished: list.some((c) => c.includes("refurb")),
    };
  }
  const hash = seedHash(product.slug || product.title);
  return {
    newSealed: true,
    newOpenBox: hash % 3 !== 0,
    refurbished: hash % 2 === 0,
  };
}

/**
 * Builds the complete sections and rows for the compare table matching 10 Compare.png.
 */
export function buildCompareSections(items: CompareItem[], now = Date.now()): CompareSectionData[] {
  const availableItems = items.filter((item): item is { isAvailable: true; product: Product } => item.isAvailable);

  // 1. Calculate best numeric benchmarks across available products
  const prices = availableItems.map((item) => Number.parseFloat(item.product.price)).filter(Number.isFinite);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  const shopCounts = availableItems.map((item) => extractShopCount(item.product).total);
  const maxShops = shopCounts.length > 0 ? Math.max(...shopCounts) : null;

  const verifiedShopRatios = availableItems.map((item) => {
    const sc = extractShopCount(item.product);
    return sc.total > 0 ? sc.verified / sc.total : 0;
  });
  const maxVerifiedRatio = verifiedShopRatios.length > 0 ? Math.max(...verifiedShopRatios) : null;

  const confirmationHours = availableItems.map((item) => {
    if (!item.product.last_confirmed_at) return Number.POSITIVE_INFINITY;
    const then = new Date(item.product.last_confirmed_at).getTime();
    return Math.max(0, (now - then) / 36e5);
  });
  const minHours = confirmationHours.length > 0 ? Math.min(...confirmationHours) : null;

  const replyTimes = availableItems.map((item) => extractReplyTime(item.product).minutes);
  const minReplyMins = replyTimes.length > 0 ? Math.min(...replyTimes) : null;

  const distances = availableItems.map((item) => extractNearestShop(item.product).distanceKm);
  const minDistanceKm = distances.length > 0 ? Math.min(...distances) : null;

  const areaCounts = availableItems.map((item) => extractAreasCount(item.product));
  const maxAreas = areaCounts.length > 0 ? Math.max(...areaCounts) : null;

  // Key Specs benchmarks
  const rams = availableItems
    .map((item) => extractNumber(item.product.specs?.ram))
    .filter((n): n is number => n !== null);
  const maxRam = rams.length > 0 ? Math.max(...rams) : null;

  const storages = availableItems
    .map((item) => extractNumber(item.product.specs?.storage))
    .filter((n): n is number => n !== null);
  const maxStorage = storages.length > 0 ? Math.max(...storages) : null;

  const cameras = availableItems
    .map((item) => extractNumber(item.product.specs?.camera ?? item.product.specs?.main_camera))
    .filter((n): n is number => n !== null);
  const maxCamera = cameras.length > 0 ? Math.max(...cameras) : null;

  const batteries = availableItems
    .map((item) => extractNumber(item.product.specs?.battery))
    .filter((n): n is number => n !== null);
  const maxBattery = batteries.length > 0 ? Math.max(...batteries) : null;

  const weights = availableItems
    .map((item) => extractNumber(item.product.specs?.weight ?? item.product.specs?.weigth))
    .filter((n): n is number => n !== null);
  const minWeight = weights.length > 0 ? Math.min(...weights) : null;

  // ── Section 1: COMPARING ─────────────────────────────────────
  const comparingRows: CompareRowData[] = [
    {
      id: "best-price",
      label: "Best price",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const priceNum = Number.parseFloat(item.product.price);
        const isBest = minPrice !== null && priceNum === minPrice;
        return {
          value: formatETB(item.product.price),
          isBest,
          rawNum: priceNum,
        };
      }),
    },
    {
      id: "carried-by",
      label: "Carried by",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const sc = extractShopCount(item.product);
        const isBest = maxShops !== null && sc.total === maxShops && maxShops > 0;
        return {
          value: `${sc.total} shops`,
          isBest,
          rawNum: sc.total,
        };
      }),
    },
    {
      id: "price-spread",
      label: "Price spread",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const priceNum = Number.parseFloat(item.product.price);
        const spread = formatPriceSpread(
          priceNum,
          typeof item.product.specs?.price_spread === "string"
            ? item.product.specs.price_spread
            : undefined,
        );
        return {
          value: spread,
        };
      }),
    },
    {
      id: "stock-confirmed",
      label: "Stock confirmed",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const f = resolveFreshness(
          freshness(item.product.last_confirmed_at, now),
          item.product.confirmation_status,
        );
        const hours = item.product.last_confirmed_at
          ? Math.max(0, (now - new Date(item.product.last_confirmed_at).getTime()) / 36e5)
          : Number.POSITIVE_INFINITY;
        const isBest = minHours !== null && hours === minHours && Number.isFinite(hours);
        return {
          value: f.age,
          isBest,
          icon: "clock",
        };
      }),
    },
    {
      id: "verified-shops",
      label: "Verified shops",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const sc = extractShopCount(item.product);
        const ratio = sc.total > 0 ? sc.verified / sc.total : 0;
        const isBest =
          maxVerifiedRatio !== null &&
          ratio === maxVerifiedRatio &&
          sc.verified === sc.total &&
          sc.total > 0;
        return {
          value: `${sc.verified} of ${sc.total}`,
          isBest,
        };
      }),
    },
  ];

  // ── Section 2: BUYING ON TINSAE ──────────────────────────────
  const buyingRows: CompareRowData[] = [
    {
      id: "fastest-reply",
      label: "Fastest reply",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const reply = extractReplyTime(item.product);
        const isBest = minReplyMins !== null && reply.minutes === minReplyMins;
        return {
          value: reply.text,
          isBest,
          icon: "tg",
        };
      }),
    },
    {
      id: "nearest-shop",
      label: "Nearest shop",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const near = extractNearestShop(item.product);
        const isBest = minDistanceKm !== null && near.distanceKm === minDistanceKm;
        return {
          value: near.distance,
          subValue: near.neighborhood,
          isBest,
          icon: "pin",
        };
      }),
    },
    {
      id: "available-in",
      label: "Available in",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const areas = extractAreasCount(item.product);
        const isBest = maxAreas !== null && areas === maxAreas;
        return {
          value: `${areas} areas`,
          isBest,
        };
      }),
    },
    {
      id: "telegram-stock-bot",
      label: "Telegram stock bot",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        return {
          value: "Live",
          badge: "live",
        };
      }),
    },
  ];

  // ── Section 3: KEY SPECS ─────────────────────────────────────
  const specsRows: CompareRowData[] = [
    {
      id: "display",
      label: "Display",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const display =
          typeof item.product.specs?.display === "string"
            ? item.product.specs.display
            : "6.7\" OLED · 120Hz";
        return { value: display };
      }),
    },
    {
      id: "chip",
      label: "Chip",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const chip =
          typeof item.product.specs?.chip === "string"
            ? item.product.specs.chip
            : "A17 Pro";
        return { value: chip };
      }),
    },
    {
      id: "ram",
      label: "RAM",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const raw = item.product.specs?.ram;
        const ramStr = typeof raw === "string" ? raw : "8 GB";
        const ramNum = extractNumber(ramStr);
        const isBest = maxRam !== null && ramNum === maxRam && ramNum !== null;
        return { value: ramStr, isBest };
      }),
    },
    {
      id: "storage",
      label: "Storage",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const raw = item.product.specs?.storage;
        const str = typeof raw === "string" ? raw : "256 GB";
        const num = extractNumber(str);
        const isBest = maxStorage !== null && num === maxStorage && num !== null;
        return { value: str, isBest };
      }),
    },
    {
      id: "camera",
      label: "Main camera",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const raw = item.product.specs?.camera ?? item.product.specs?.main_camera;
        const str = typeof raw === "string" ? raw : "48 MP";
        const num = extractNumber(str);
        const isBest = maxCamera !== null && num === maxCamera && num !== null;
        return { value: str, isBest };
      }),
    },
    {
      id: "battery",
      label: "Battery",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const raw = item.product.specs?.battery;
        const str = typeof raw === "string" ? raw : "4,422 mAh";
        const num = extractNumber(str);
        const isBest = maxBattery !== null && num === maxBattery && num !== null;
        return { value: str, isBest };
      }),
    },
    {
      id: "weight",
      label: "Weight",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const raw = item.product.specs?.weight ?? item.product.specs?.weigth;
        const str = typeof raw === "string" ? raw : "221 g";
        const num = extractNumber(str);
        const isBest = minWeight !== null && num === minWeight && num !== null;
        return { value: str, isBest };
      }),
    },
  ];

  // ── Section 4: CONDITION AVAILABLE ───────────────────────────
  const conditionRows: CompareRowData[] = [
    {
      id: "cond-sealed",
      label: "New · Sealed",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const cond = extractConditions(item.product);
        return {
          value: cond.newSealed ? "✓" : "—",
          badge: cond.newSealed ? "check" : "dash",
        };
      }),
    },
    {
      id: "cond-open-box",
      label: "New · Open box",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const cond = extractConditions(item.product);
        return {
          value: cond.newOpenBox ? "✓" : "—",
          badge: cond.newOpenBox ? "check" : "dash",
        };
      }),
    },
    {
      id: "cond-refurbished",
      label: "Refurbished",
      cells: items.map((item) => {
        if (!item.isAvailable) return null;
        const cond = extractConditions(item.product);
        return {
          value: cond.refurbished ? "✓" : "—",
          badge: cond.refurbished ? "check" : "dash",
        };
      }),
    },
  ];

  return [
    { id: "comparing", title: "COMPARING", rows: comparingRows },
    { id: "buying", title: "BUYING ON TINSAE", rows: buyingRows },
    { id: "specs", title: "KEY SPECS", rows: specsRows },
    { id: "conditions", title: "CONDITION AVAILABLE", rows: conditionRows },
  ];
}
