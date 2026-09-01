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

/**
 * The three states the backend actually publishes —
 * `catalog.models.ConfirmationStatus`, one for one.
 *
 * There used to be a fourth, "aging", produced by bucketing the age of
 * `last_confirmed_at` against thresholds declared here. That re-implemented
 * catalog/freshness.py in TypeScript against a different clock, which is the
 * duplication the backend removed `freshness` from the buyer payload to end:
 * one payload could call the same product fresh here and expired there.
 *
 * Formatting an age is still ours. Deciding what an age *means* is not.
 */
export type FreshnessTone = "fresh" | "stale" | "unconfirmed";

export type Freshness = {
  tone: FreshnessTone;
  /** Short label for the image overlay, e.g. "In stock". */
  badge: string;
  /** Relative age, e.g. "4h ago". */
  age: string;
  /** Human confirmation line, e.g. "Confirmed 4h ago". */
  confirmed: string;
};

/** The human line for a listing that has never been confirmed. */
const UNCONFIRMED = "Not yet confirmed";

/**
 * Stale and unconfirmed read as quiet and factual rather than alarming — the
 * ticket asks for stale to be flagged honestly, not dressed up as a warning.
 * Only "fresh" earns the green and the check.
 */
const BADGE: Record<FreshnessTone, string> = {
  fresh: "In stock",
  stale: "Stale",
  // Deliberately short: this sits in the corner chip on the card image, which
  // collides with the save button at two-column mobile widths. The full wording
  // still shows in the footer.
  unconfirmed: "Unconfirmed",
};

/**
 * What to render for one listing's confirmation state.
 *
 * Takes both fields because neither answers alone. `confirmation_status`
 * defaults to "fresh" on a brand-new row, so a listing nobody has ever
 * confirmed arrives labelled fresh with a null timestamp; the timestamp is what
 * distinguishes "confirmed, and recently" from "never asked".
 *
 * An absent or unrecognised status falls to `unconfirmed` rather than `fresh`.
 * The serializer always sends the field, so this is a defensive branch — but on
 * a product whose whole promise is that the green badge means something,
 * guessing green is the one wrong answer that costs a buyer's trust.
 */
export function freshness(
  lastConfirmedAt: string | null,
  confirmationStatus?: "fresh" | "stale" | "unconfirmed" | null,
  now = Date.now(),
): Freshness {
  const then = lastConfirmedAt ? new Date(lastConfirmedAt).getTime() : Number.NaN;

  if (!Number.isFinite(then)) {
    return {
      tone: "unconfirmed",
      badge: BADGE.unconfirmed,
      age: UNCONFIRMED,
      confirmed: UNCONFIRMED,
    };
  }

  const tone: FreshnessTone =
    confirmationStatus === "fresh"
      ? "fresh"
      : confirmationStatus === "stale"
        ? "stale"
        : "unconfirmed";

  const hours = Math.max(0, (now - then) / 36e5);
  return {
    tone,
    badge: BADGE[tone],
    age: relativeAge(hours),
    confirmed: `Confirmed ${spelledAge(hours)}`,
  };
}

/**
 * Compact age for the card's corner chip, which is about eight characters wide
 * before it collides with the save button.
 */
function relativeAge(hours: number): string {
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
}

/**
 * The same age spelled out, for the confirmation line, which has a row to
 * itself — "Confirmed 2 days ago" per the handoff, not "Confirmed 2d ago".
 * Abbreviations are fine on a chip and read as clutter in a sentence.
 */
function spelledAge(hours: number): string {
  if (hours < 1) return "moments ago";
  if (hours < 24) return "today";

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "last month" : `${months} months ago`;

  const years = Math.floor(months / 12);
  return years === 1 ? "last year" : `${years} years ago`;
}
