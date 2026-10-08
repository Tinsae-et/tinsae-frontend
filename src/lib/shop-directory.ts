// The verified-shops directory's URL state: area, sort and page live in the
// query string, so every view is a plain link — shareable, indexable, and
// rendered on the server with no client state.

export const DIRECTORY_PAGE_SIZE = 24;

/** Only orderings the backend's shop list accepts (shops/views.py). */
export const DIRECTORY_SORTS = {
  products: { label: "Most products", ordering: "-active_listings_count" },
  newest: { label: "Newest", ordering: "-created_at" },
  name: { label: "A–Z", ordering: "name" },
} as const;

export type DirectorySort = keyof typeof DIRECTORY_SORTS;
export const DEFAULT_SORT: DirectorySort = "products";

export type DirectoryQuery = {
  /** A shop `city`; undefined means all areas. */
  area?: string;
  sort: DirectorySort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseDirectoryQuery(params: RawParams): DirectoryQuery {
  const area = first(params.area)?.trim() || undefined;
  const sortParam = first(params.sort);
  const sort = sortParam && sortParam in DIRECTORY_SORTS ? (sortParam as DirectorySort) : DEFAULT_SORT;
  const page = Number.parseInt(first(params.page) ?? "", 10);
  return { area, sort, page: Number.isFinite(page) && page > 1 ? page : 1 };
}

/**
 * The /shops link for this query with `changes` applied. Changing the area or
 * sort goes back to page 1; defaults are left out so URLs stay canonical.
 */
export function directoryHref(query: DirectoryQuery, changes: Partial<DirectoryQuery> = {}): string {
  const resetsPage = "area" in changes || "sort" in changes;
  const next = { ...query, ...changes, page: changes.page ?? (resetsPage ? 1 : query.page) };
  const params = new URLSearchParams();
  if (next.area) params.set("area", next.area);
  if (next.sort !== DEFAULT_SORT) params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/shops?${qs}` : "/shops";
}

export function pageCount(total: number, pageSize = DIRECTORY_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Which page numbers to show: the first, the last, and the current one with a
 * neighbour each side; `null` marks a gap.
 */
export function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  for (const p of sorted) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && p - prev > 1) out.push(null);
    out.push(p);
  }
  return out;
}
