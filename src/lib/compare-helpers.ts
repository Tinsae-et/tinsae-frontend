import { formatETB, freshness } from "@/lib/format";
import type { Product } from "@/lib/types";
import { formatSpecs, type SpecRow } from "@/lib/specs/display";
import type { CategorySchema } from "@/lib/specs/schema";

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
export function buildCompareSections(
  items: CompareItem[],
  schemas: Record<string, CategorySchema | null> = {},
  now = Date.now(),
): CompareSectionData[] {
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
        // `freshness` now takes the status as its second argument and `now` as
        // its third; the old two-argument form passed `now` where the status is
        // read, and grading the age locally is what the backend asked us to
        // stop doing. See lib/format.
        const f = freshness(
          item.product.last_confirmed_at,
          item.product.confirmation_status,
          now,
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
  // Rows come from the listings' own specs, labelled by their category's
  // schema, so a laptop compare shows processor and screen size rather than a
  // phone's rows. A listing without a value shows a dash; nothing is invented.
  const specsRows = buildSpecRows(items, schemas);

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

// Which way is better for the specs a compare highlights; anything else is
// shown without a "best" marker.
const HIGHER_IS_BETTER = new Set([
  "storage",
  "ram",
  "battery_health",
  "battery_capacity",
  "megapixels",
  "output_power",
  "power_output",
  "screen_size",
  "battery",
  "camera",
]);
const LOWER_IS_BETTER = new Set(["weight", "battery_cycles", "shutter_count"]);

/** "1 TB" -> 1024, "512 MB" -> 0.5, "4,422 mAh" -> 4422; null when not numeric. */
export function specMagnitude(value: string): number | null {
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(tb|gb|mb)?/i);
  if (!match) return null;
  const n = Number.parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();
  return unit === "tb" ? n * 1024 : unit === "mb" ? n / 1024 : n;
}

export function buildSpecRows(
  items: CompareItem[],
  schemas: Record<string, CategorySchema | null>,
): CompareRowData[] {
  const perItem: (Map<string, SpecRow> | null)[] = items.map((item) => {
    if (!item.isAvailable) return null;
    const slug = item.product.category?.slug ?? "";
    const rows = formatSpecs(schemas[slug] ?? null, item.product.specs);
    return new Map(rows.map((r) => [r.key, r]));
  });

  // Row order: first appearance across the compared listings.
  const order: { key: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const rows of perItem) {
    for (const row of rows?.values() ?? []) {
      if (!seen.has(row.key)) {
        seen.add(row.key);
        order.push({ key: row.key, label: row.label });
      }
    }
  }

  return order.map(({ key, label }) => {
    const nums = perItem.map((rows) => {
      const value = rows?.get(key)?.value;
      return value === undefined ? null : specMagnitude(value);
    });
    const known = nums.filter((n): n is number => n !== null);
    const direction = HIGHER_IS_BETTER.has(key) ? 1 : LOWER_IS_BETTER.has(key) ? -1 : 0;
    // A "best" only means something when at least two listings differ.
    const best =
      direction !== 0 && known.length >= 2 && new Set(known).size > 1
        ? direction === 1
          ? Math.max(...known)
          : Math.min(...known)
        : null;

    return {
      id: `spec-${key}`,
      label,
      cells: items.map((item, i) => {
        if (!item.isAvailable) return null;
        const row = perItem[i]?.get(key);
        if (!row) return { value: "—", badge: "dash" as const };
        return { value: row.value, isBest: best !== null && nums[i] === best };
      }),
    };
  });
}
