import { describe, expect, it } from "vitest";
import { listableCategories, toNavCategories } from "./nav-categories";
import type { Category } from "./types";

function category(overrides: Partial<Category> & { slug: string }): Category {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? overrides.slug,
    parent: null,
    display_order: 0,
    ...overrides,
  };
}

const vehicles = category({
  id: 7,
  slug: "vehicles",
  name: "Vehicles & Auto",
  icon: "car",
  tagline: "",
  children: [
    category({ id: 8, slug: "cars", name: "Cars", parent: 7, icon: "car" }),
    category({ id: 9, slug: "bicycles", name: "Bicycles & E-bikes", parent: 7, icon: "bicycle" }),
  ],
});
const phones = category({ id: 1, slug: "phones", name: "Phones", icon: "phone", tagline: "iPhone · Samsung" });
// The API lists subcategories at the top level too, with their parent set.
const all = [phones, vehicles, ...(vehicles.children ?? [])];

describe("toNavCategories", () => {
  it("keeps only top-level categories, with their subcategories nested", () => {
    const nav = toNavCategories(all);
    expect(nav.map((c) => c.slug)).toEqual(["phones", "vehicles"]);
    expect(nav[1].children?.map((c) => c.slug)).toEqual(["cars", "bicycles"]);
  });

  it("takes the icon and tagline from the backend", () => {
    const [nav] = toNavCategories([phones]);
    expect(nav.icon).toBe("phone");
    expect(nav.subtitle).toBe("iPhone · Samsung");
  });

  it("falls back to a tag icon and the subcategory names", () => {
    const nav = toNavCategories([
      { ...vehicles, icon: "not-an-icon" },
    ]);
    expect(nav[0].icon).toBe("tag");
    expect(nav[0].subtitle).toBe("Cars · Bicycles & E-bikes");
  });
});

describe("listableCategories", () => {
  it("replaces a parent by its subcategories, in place", () => {
    const listable = listableCategories(toNavCategories(all));
    expect(listable.map((c) => c.slug)).toEqual(["phones", "cars", "bicycles"]);
  });
});
