import type { IconName } from "@/components/tinsae/icon";

// Category IA comes from the design (NAV_CATS in tinsae-home-v2.jsx).
// Slugs are what get sent to ?category= — they must match Category.slug in the
// backend, so they need reconciling against seeded data.
//
// `count` mirrors the design's demo listing counts; the backend doesn't expose
// per-category counts yet, so these are static until it does.
//
// Lives outside site-header.tsx on purpose: that module is "use client", and a
// value exported across the client boundary reaches server components as a
// client-reference proxy rather than the array itself.
export const NAV_CATEGORIES: { icon: IconName; label: string; slug: string; count: number }[] = [
  { icon: "phone", label: "Phones", slug: "phones", count: 142 },
  { icon: "laptop", label: "Laptops", slug: "laptops", count: 86 },
  { icon: "audio", label: "Audio", slug: "audio", count: 210 },
  { icon: "tablet", label: "Tablets", slug: "tablets", count: 54 },
  { icon: "camera", label: "Cameras", slug: "cameras", count: 38 },
  { icon: "plug", label: "Accessories", slug: "accessories", count: 320 },
];
