// The single freshness rule. Every surface that shows stock age uses THIS.
// Public promise (Trust & Safety page): <=6h fresh, 7-24h aging, >24h hidden.
// Note: some prototype files used a 12h aging cutoff — 24h is canonical.

export type Freshness = 'fresh' | 'aging' | 'stale';

export const FRESH_MAX_HOURS = 6;
export const AGING_MAX_HOURS = 24;

export function freshnessOf(hoursSinceConfirmed: number): Freshness {
  if (hoursSinceConfirmed <= FRESH_MAX_HOURS) return 'fresh';
  if (hoursSinceConfirmed <= AGING_MAX_HOURS) return 'aging';
  return 'stale';
}

export const FRESHNESS_STYLE = {
  fresh: { dot: '#1F8A5B', text: '#157049', soft: '#E8F5EE', label: 'In stock',  onDark: '#1F8A5B' },
  aging: { dot: '#B8741F', text: '#8A5512', soft: '#FBF0E2', label: 'Aging',     onDark: '#D89A3C' },
  stale: { dot: '#9A9A95', text: '#76746E', soft: '#F7F6F2', label: 'Unconfirmed', onDark: '#8C8C86' },
} as const;

/** Listings older than AGING_MAX_HOURS are hidden from buyers. */
export const isVisibleToBuyers = (hours: number) => freshnessOf(hours) !== 'stale';

/** ETB 142,500 — integer birr, thousands separators, no decimals. */
export const ETB = (n: number) => 'ETB ' + Math.round(n).toLocaleString('en-US');
