import { isIconName, type IconName } from "@/components/tinsae/icon";
import { getCategories } from "@/lib/api/public";
import type { Category } from "@/lib/types";

export type NavCategory = {
  icon: IconName;
  label: string;
  slug: string;
  subtitle: string;
  status?: "live" | "soon";
  badge?: string;
  /** Subcategories; a category with any only groups them and takes no listings. */
  children?: NavCategory[];
};

function toNavCategory(c: Category): NavCategory {
  const children = (c.children ?? []).map(toNavCategory);
  return {
    slug: c.slug,
    label: c.name,
    // The backend owns every category, its icon and its tagline; an unknown
    // icon falls back to a tag, and a missing tagline lists the subcategories.
    icon: isIconName(c.icon) ? c.icon : "tag",
    subtitle: c.tagline || children.map((child) => child.label).join(" · "),
    status: "live" as const,
    ...(children.length ? { children } : {}),
  };
}

/** Top-level backend categories, in the backend's order, with their subcategories. */
export function toNavCategories(categories: Category[]): NavCategory[] {
  return categories.filter((c) => c.parent === null).map(toNavCategory);
}

/**
 * The categories a listing can go in: every category without subcategories.
 * A parent such as "Vehicles & Auto" is replaced by its children, in place.
 */
export function listableCategories(categories: NavCategory[]): NavCategory[] {
  return categories.flatMap((c) => (c.children?.length ? c.children : [c]));
}

/**
 * The live category list from the backend. An outage yields an empty list
 * rather than a stale hard-coded one, so nothing links to a category that no
 * longer exists.
 */
export async function getNavCategories(): Promise<NavCategory[]> {
  try {
    const res = await getCategories();
    return toNavCategories(res.results);
  } catch {
    return [];
  }
}

// Roadmap verticals. They are not in the backend yet, so the frontend owns
// this list until categories carry a status there.
export const UPCOMING_CATEGORIES: NavCategory[] = [
  {
    icon: "shield",
    label: "Services & Repairs",
    slug: "services",
    subtitle: "Device Repairs · Tech Support",
    status: "soon",
  },
];
