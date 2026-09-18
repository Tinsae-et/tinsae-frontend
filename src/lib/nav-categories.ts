import type { IconName } from "@/components/tinsae/icon";

export type NavCategory = {
  icon: IconName;
  label: string;
  slug: string;
  subtitle: string;
  count?: number;
  status?: "live" | "soon";
  badge?: string;
};

// All live marketplace categories backed by the database catalog
export const LIVE_CATEGORIES: NavCategory[] = [
  {
    icon: "phone",
    label: "Phones",
    slug: "phones",
    subtitle: "iPhone · Samsung · Tecno · Xiaomi",
    status: "live",
  },
  {
    icon: "laptop",
    label: "Laptops & PCs",
    slug: "laptops",
    subtitle: "MacBook · Dell · ThinkPad · HP",
    status: "live",
  },
  {
    icon: "audio",
    label: "Audio & Sound",
    slug: "audio",
    subtitle: "AirPods · JBL · Sony · Soundbars",
    status: "live",
  },
  {
    icon: "car",
    label: "Vehicles & Auto",
    slug: "vehicles",
    subtitle: "Cars · Bikes · Spare Parts · Auto",
    status: "live",
  },
  {
    icon: "tablet",
    label: "Tablets",
    slug: "tablets",
    subtitle: "iPad · Galaxy Tab · Surface",
    status: "live",
  },
  {
    icon: "camera",
    label: "Cameras & Photo",
    slug: "cameras",
    subtitle: "Canon · Sony · Nikon · Drones",
    status: "live",
  },
  {
    icon: "plug",
    label: "Accessories",
    slug: "accessories",
    subtitle: "Chargers · Cases · Cables · Power",
    status: "live",
  },
  {
    icon: "spec",
    label: "Electronics & Tech",
    slug: "electronics",
    subtitle: "Displays · Monitors · Smart Home",
    status: "live",
  },
];

// Upcoming marketplace categories (aligned with Tinsae expansion roadmap)
export const UPCOMING_CATEGORIES: NavCategory[] = [
  {
    icon: "building",
    label: "Property & Rentals",
    slug: "property",
    subtitle: "Apartments · Villas · Commercial",
    status: "soon",
    badge: "Q3 2026",
  },
  {
    icon: "tag",
    label: "Fashion & Apparel",
    slug: "fashion",
    subtitle: "Clothing · Shoes · Bags · Watches",
    status: "soon",
    badge: "Q3 2026",
  },
  {
    icon: "home",
    label: "Home & Furniture",
    slug: "home",
    subtitle: "Furniture · Office · Appliances",
    status: "soon",
    badge: "Q4 2026",
  },
  {
    icon: "shield",
    label: "Services & Repairs",
    slug: "services",
    subtitle: "Device Repairs · Tech Support",
    status: "soon",
    badge: "2027",
  },
];

// Default nav categories for general consumption
export const NAV_CATEGORIES: NavCategory[] = LIVE_CATEGORIES;
