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
  /** Relative age, e.g. "4h ago". */
  age: string;
  /** Human confirmation line, e.g. "Confirmed 4h ago". */
  confirmed: string;
};

/** The human line for a listing that has never been confirmed. */
const UNCONFIRMED = "Not yet confirmed";

/**
 * The design only draws two states (In stock / Aging). "Stale" and the
 * never-confirmed case are ours: the ticket asks for stale to be flagged
 * honestly rather than folded into "Aging".
 */
const BADGE: Record<FreshnessTone, string> = {
  fresh: "In stock",
  aging: "Aging",
  stale: "Stale",
  // Deliberately shorter than the `confirmed` line: this one sits in the
  // corner chip on the card image, which collides with the save button at
  // two-column mobile widths. The full wording still shows in the footer.
  unknown: "Unconfirmed",
};

/**
 * Freshness thresholds, in hours.
 *
 * Deliberately pinned to the backend so "stale" means one thing system-wide:
 * AGING_HOURS matches settings.PRODUCT_STALENESS_DAYS (default 30), which is
 * the line `sweep_freshness` uses to flip confirmation_status to "stale" and
 * the line ?freshness=1 filters on. Cross the same line here and the badge, the
 * filter and the Telegram prompts finally agree.
 *
 * The design originally used 6h/12h, but that graded a normal once-a-day
 * reconfirmation cycle as stale — every listing in dev sat at ~20h and rendered
 * "Stale" across the board.
 *
 * FRESH_HOURS carves the last week before that cutoff into an "Aging" warning
 * band; it has no backend counterpart (the backend is binary) and is display
 * nuance only. Both are expected to tighten as the confirmation cadence
 * improves — keep them in step with PRODUCT_STALENESS_DAYS when they do.
 */
export const FRESH_HOURS = 24 * 23;
export const AGING_HOURS = 24 * 30;

/**
 * Grades a confirmation timestamp. Adds the "unknown" case the design has no
 * state for — `last_confirmed_at` is nullable.
 */
export function freshness(lastConfirmedAt: string | null, now = Date.now()): Freshness {
  const then = lastConfirmedAt ? new Date(lastConfirmedAt).getTime() : Number.NaN;
  if (!Number.isFinite(then)) {
    return { tone: "unknown", badge: BADGE.unknown, age: UNCONFIRMED, confirmed: UNCONFIRMED };
  }

  const hours = Math.max(0, (now - then) / 36e5);
  const tone: FreshnessTone =
    hours <= FRESH_HOURS ? "fresh" : hours <= AGING_HOURS ? "aging" : "stale";
  const age = relativeAge(hours);

  return { tone, badge: BADGE[tone], age, confirmed: `Confirmed ${age.toLowerCase()}` };
}

/**
 * The freshness to actually render. `last_confirmed_at` is the source of truth,
 * because the backend's `confirmation_status` uses that 30-day window — trusting
 * it would paint a week-old listing green right next to a footer reading
 * "7d ago". We only let the backend make things *worse*: an explicit "stale"
 * downgrades a listing the clock still considers fresh (the shop may have
 * reported it sold out since). Unrecognised values are ignored.
 *
 * Returns the whole object rather than a bare tone so the badge and the dot
 * can never be read from different sources and disagree.
 */
export function resolveFreshness(
  f: Freshness,
  confirmationStatus?: "fresh" | "stale" | null,
): Freshness {
  if (confirmationStatus === "stale" && (f.tone === "fresh" || f.tone === "aging")) {
    return { ...f, tone: "stale", badge: BADGE.stale };
  }
  return f;
}

function relativeAge(hours: number): string {
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
}
