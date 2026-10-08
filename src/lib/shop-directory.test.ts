import { describe, expect, it } from "vitest";
import { directoryHref, pageCount, pageWindow, parseDirectoryQuery } from "./shop-directory";

describe("parseDirectoryQuery", () => {
  it("defaults to all areas, most products, page 1", () => {
    expect(parseDirectoryQuery({})).toEqual({ area: undefined, sort: "products", page: 1 });
  });

  it("reads area, sort and page", () => {
    expect(parseDirectoryQuery({ area: "Bole", sort: "newest", page: "3" })).toEqual({
      area: "Bole",
      sort: "newest",
      page: 3,
    });
  });

  it("ignores unknown sorts and bad pages", () => {
    expect(parseDirectoryQuery({ sort: "rating", page: "-2" })).toMatchObject({ sort: "products", page: 1 });
    expect(parseDirectoryQuery({ page: "abc", area: "  " })).toMatchObject({ page: 1, area: undefined });
  });
});

describe("directoryHref", () => {
  const query = { area: "Bole", sort: "newest" as const, page: 3 };

  it("leaves defaults out of the URL", () => {
    expect(directoryHref({ sort: "products", page: 1 })).toBe("/shops");
  });

  it("goes back to page 1 when the area or sort changes", () => {
    expect(directoryHref(query, { area: undefined })).toBe("/shops?sort=newest");
    expect(directoryHref(query, { sort: "name" })).toBe("/shops?area=Bole&sort=name");
  });

  it("keeps filters when paging", () => {
    expect(directoryHref(query, { page: 4 })).toBe("/shops?area=Bole&sort=newest&page=4");
  });
});

describe("paging", () => {
  it("counts pages, with at least one", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(24)).toBe(1);
    expect(pageCount(25)).toBe(2);
  });

  it("shows the ends and the current page's neighbours, with gaps", () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
  });
});
