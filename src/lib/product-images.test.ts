import { describe, expect, it } from "vitest";
import {
  resolveProductImages,
  resolveProductGalleryImages,
  resolvePrimaryProductImage,
} from "./product-images";

describe("product-images", () => {
  describe("resolveProductImages", () => {
    it("handles undefined or empty arrays gracefully", () => {
      expect(resolveProductImages(undefined)).toEqual([]);
      expect(resolveProductImages([])).toEqual([]);
    });

    it("normalizes full backend media URLs to relative paths", () => {
      const urls = resolveProductImages([
        "http://localhost:8000/media/products/item1.jpg",
        "http://127.0.0.1:8000/media/products/item2.png",
      ]);
      expect(urls).toEqual([
        "/media/products/item1.jpg",
        "/media/products/item2.png",
      ]);
    });

    it("resolves from ProductImage objects with .url", () => {
      const urls = resolveProductImages([
        { id: 1, url: "http://localhost:8000/media/products/img1.jpg" },
        { id: 2, url: "/media/products/img2.jpg" },
      ]);
      expect(urls).toEqual([
        "/media/products/img1.jpg",
        "/media/products/img2.jpg",
      ]);
    });

    it("resolves from ShopProductImage objects with .image or .preview", () => {
      const urls = resolveProductImages([
        { id: 10, image: "http://localhost:8000/media/products/shop-img.jpg" },
        { id: 11, preview: "/media/products/shop-preview.jpg" },
      ]);
      expect(urls).toEqual([
        "/media/products/shop-img.jpg",
        "/media/products/shop-preview.jpg",
      ]);
    });

    it("puts the is_primary image first and keeps the rest in order", () => {
      const urls = resolveProductImages([
        { id: 1, url: "/media/p/a.jpg", is_primary: false },
        { id: 2, url: "/media/p/b.jpg", is_primary: false },
        { id: 3, url: "/media/p/c.jpg", is_primary: true },
      ]);
      expect(urls).toEqual(["/media/p/c.jpg", "/media/p/a.jpg", "/media/p/b.jpg"]);
    });

    it("deduplicates identical URLs and skips empty values", () => {
      const urls = resolveProductImages([
        "http://localhost:8000/media/products/img.jpg",
        "/media/products/img.jpg",
        "",
        null,
      ]);
      expect(urls).toEqual(["/media/products/img.jpg"]);
    });
  });

  describe("resolvePrimaryProductImage", () => {
    it("returns normalized primary URL or null", () => {
      expect(
        resolvePrimaryProductImage("http://localhost:8000/media/p/1.jpg"),
      ).toBe("/media/p/1.jpg");
      expect(resolvePrimaryProductImage(null)).toBeNull();
      expect(resolvePrimaryProductImage("")).toBeNull();
    });
  });

  describe("resolveProductGalleryImages", () => {
    it("filters and normalizes string image arrays", () => {
      const gallery = resolveProductGalleryImages([
        "http://localhost:8000/media/p/1.jpg",
        "",
        null,
        "/media/p/2.jpg",
      ]);
      expect(gallery).toEqual(["/media/p/1.jpg", "/media/p/2.jpg"]);
    });
  });
});
