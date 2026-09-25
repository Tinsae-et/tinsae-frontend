export type PressMention = {
  outlet: string;
  headline: string;
  /** ISO calendar date, e.g. "2026-03-14". */
  date: string;
  /** The article itself, on the outlet's site. */
  url: string;
  kind?: "Feature" | "Interview" | "Profile" | "News";
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Newest first, without reordering the caller's array. */
export function sortCoverageNewestFirst(
  items: readonly PressMention[],
): PressMention[] {
  // ISO dates sort correctly as strings.
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

/** "2026-03-14" → "2026 · Mar", the design's coverage-row date. */
export function formatCoverageDate(date: string): string {
  const [year, month] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${year} · ${name}` : year;
}
