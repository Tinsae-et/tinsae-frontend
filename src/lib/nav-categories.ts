import type { IconName } from "@/components/tinsae/icon";
import { getCategories } from "@/lib/api/public";
import type { Category } from "@/lib/types";

export type NavCategory = {
  icon: IconName;
  label: string;
  slug: string;
  subtitle: string;
  status?: "live" | "soon";
  badge?: string;
};

// The backend owns which categories exist, their names and their order. This
// map only decorates them; a category the backend adds without an entry here
// still shows, with a generic icon and no tagline.
const CATEGORY_PRESENTATION: Record<string, { icon: IconName; subtitle: string }> = {
  phones: { icon: "phone", subtitle: "iPhone · Samsung · Tecno · Xiaomi" },
  laptops: { icon: "laptop", subtitle: "MacBook · Dell · ThinkPad · HP" },
  audio: { icon: "audio", subtitle: "AirPods · JBL · Sony · Soundbars" },
  tablets: { icon: "tablet", subtitle: "iPad · Galaxy Tab · Surface" },
  cameras: { icon: "camera", subtitle: "Canon · Sony · Nikon · GoPro" },
  accessories: { icon: "plug", subtitle: "Chargers · Cases · Cables · Power" },
};

/** Top-level backend categories, in the backend's order, ready for navigation. */
export function toNavCategories(categories: Category[]): NavCategory[] {
  return categories
    .filter((c) => c.parent === null)
    .map((c) => ({
      slug: c.slug,
      label: c.name,
      icon: CATEGORY_PRESENTATION[c.slug]?.icon ?? "tag",
      subtitle: CATEGORY_PRESENTATION[c.slug]?.subtitle ?? "",
      status: "live" as const,
    }));
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
    icon: "car",
    label: "Vehicles & Auto",
    slug: "vehicles",
    subtitle: "Cars · Bikes · Spare Parts",
    status: "soon",
  },
  {
    icon: "building",
    label: "Property & Rentals",
    slug: "property",
    subtitle: "Apartments · Villas · Commercial",
    status: "soon",
  },
  {
    icon: "tag",
    label: "Fashion & Apparel",
    slug: "fashion",
    subtitle: "Clothing · Shoes · Bags · Watches",
    status: "soon",
  },
  {
    icon: "home",
    label: "Home & Furniture",
    slug: "home",
    subtitle: "Furniture · Office · Appliances",
    status: "soon",
  },
  {
    icon: "shield",
    label: "Services & Repairs",
    slug: "services",
    subtitle: "Device Repairs · Tech Support",
    status: "soon",
  },
];
