// Presentation helpers shared by the home page and the product grid.

/**
 * Money, matching the design's `ETB` helper: prefix, grouped, no decimals.
 * `price` arrives from DRF as a decimal string ("142500.00").
 */
export function formatETB(price: string | number): string {
  const n = typeof price === "number" ? price : Number.parseFloat(price);
  if (!Number.isFinite(n)) return "—";
  return `ETB ${Math.round(n).toLocaleString("en-US")}`;
}

export type FreshnessTone = "fresh" | "aging" | "stale" | "unknown";

export type Freshness = {
  tone: FreshnessTone;
  /** Short label for the image overlay, e.g. "In stock". */
  badge: string;
  /** Relative age for the card footer, e.g. "4h ago". */
  age: string;
};

/**
 * The design (`freshTone` in tinsae-home-v2.jsx) grades freshness in hours:
 * <=6h in stock, <=12h aging, older is stale. That assumes shops reconfirm
 * daily over Telegram.
 *
 * Note the backend disagrees: its `freshness` filter treats anything within
 * 30 days as fresh (catalog/views.py). We follow the design here, and add the
 * "unknown" case the design has no state for — `last_confirmed_at` is nullable.
 */
export function freshness(lastConfirmedAt: string | null, now = Date.now()): Freshness {
  if (!lastConfirmedAt) {
    return { tone: "unknown", badge: "Unconfirmed", age: "Never confirmed" };
  }

  const then = new Date(lastConfirmedAt).getTime();
  if (!Number.isFinite(then)) {
    return { tone: "unknown", badge: "Unconfirmed", age: "Never confirmed" };
  }

  const hours = Math.max(0, (now - then) / 36e5);
  const tone: FreshnessTone = hours <= 6 ? "fresh" : hours <= 12 ? "aging" : "stale";

  return {
    tone,
    badge: tone === "fresh" ? "In stock" : tone === "aging" ? "Aging" : "Unconfirmed today",
    age: relativeAge(hours),
  };
}

function relativeAge(hours: number): string {
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
}
