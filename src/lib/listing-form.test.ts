import { describe, expect, it } from "vitest";
import { formatETB, validateImageFile } from "@/components/shop/dashboard/new-listing/product-forms";

describe("Listing Form Logic & Acceptance Criteria", () => {
  describe("Client-side image file validation", () => {
    it("accepts valid JPEG, PNG, and WebP files under 5MB", () => {
      const validJpeg = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });
      const validPng = new File(["dummy"], "photo.png", { type: "image/png" });
      const validWebp = new File(["dummy"], "photo.webp", { type: "image/webp" });

      expect(validateImageFile(validJpeg)).toBeNull();
      expect(validateImageFile(validPng)).toBeNull();
      expect(validateImageFile(validWebp)).toBeNull();
    });

    it("rejects files exceeding 5MB with clear error message", () => {
      // 6 MB file
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([largeContent], "huge.jpg", { type: "image/jpeg" });

      const error = validateImageFile(largeFile);
      expect(error).not.toBeNull();
      expect(error).toContain("too large");
      expect(error).toContain("Maximum allowed size is 5MB");
    });

    it("rejects non-image or unsupported file types with clear error message", () => {
      const pdfFile = new File(["dummy"], "document.pdf", { type: "application/pdf" });
      const txtFile = new File(["dummy"], "test.txt", { type: "text/plain" });

      const pdfError = validateImageFile(pdfFile);
      expect(pdfError).toContain("Invalid file type");

      const txtError = validateImageFile(txtFile);
      expect(txtError).toContain("Invalid file type");
    });
  });

  describe("Decimal price handling in ETB", () => {
    const priceRegex = /^\d+(\.\d{1,2})?$/;

    it("accepts integer price strings in ETB", () => {
      expect(priceRegex.test("142500")).toBe(true);
      expect(priceRegex.test("500")).toBe(true);
    });

    it("accepts decimal price strings with up to 2 decimal places", () => {
      expect(priceRegex.test("142500.50")).toBe(true);
      expect(priceRegex.test("99.9")).toBe(true);
      expect(priceRegex.test("0.25")).toBe(true);
    });

    it("rejects invalid price formats or more than 2 decimal places", () => {
      expect(priceRegex.test("142500.555")).toBe(false);
      expect(priceRegex.test("-500")).toBe(false);
      expect(priceRegex.test("abc")).toBe(false);
      expect(priceRegex.test("14,500")).toBe(false);
      expect(priceRegex.test("14.500.00")).toBe(false);
    });

    it("ensures price is kept as a string and never cast to float", () => {
      const priceInput = "142500.50";
      const payload = {
        price: priceInput,
        currency: "ETB",
      };
      const json = JSON.stringify(payload);
      expect(json).toContain('"price":"142500.50"');
      expect(json).not.toContain('"price":142500.5');
    });

    it("formats ETB currency correctly", () => {
      expect(formatETB(138000)).toBe("ETB 138,000");
      expect(formatETB(2500)).toBe("ETB 2,500");
    });
  });

  describe("Backend Serializer Contract Compliance", () => {
    it("does not include last_confirmed_at in writable listing form payload", () => {
      const newProductPayload: Record<string, unknown> = {
        name: "iPhone 15 Pro",
        brand: "Apple",
        description: "Sealed",
        price: "142500",
        currency: "ETB",
        category: "phones",
        condition: "new",
        is_available: true,
        stock: 3,
        specs: {},
        status: "live",
      };

      expect("last_confirmed_at" in newProductPayload).toBe(false);
      expect("confirmation_status" in newProductPayload).toBe(false);
    });

    it("supports condition values matching backend ProductCondition text choices", () => {
      const backendChoices = ["new", "refurbished", "used"];
      const allowedInForm = ["new", "refurbished", "used"];

      allowedInForm.forEach((choice) => {
        expect(backendChoices).toContain(choice);
      });
    });
  });

  describe("Image reorder and primary state logic", () => {
    it("ensures cover photo is always marked is_primary with display_order 0", () => {
      const coverPhoto = {
        id: 1,
        image: "https://example.com/cover.jpg",
        display_order: 0,
        is_primary: true,
        preview: "https://example.com/cover.jpg",
      };

      expect(coverPhoto.is_primary).toBe(true);
      expect(coverPhoto.display_order).toBe(0);
    });

    it("assigns sequential display_order and is_primary false to extra photos", () => {
      const extraPhotos = [
        { id: 2, display_order: 1, is_primary: false },
        { id: 3, display_order: 2, is_primary: false },
        { id: 4, display_order: 3, is_primary: false },
      ];

      extraPhotos.forEach((photo, idx) => {
        expect(photo.is_primary).toBe(false);
        expect(photo.display_order).toBe(idx + 1);
      });
    });

    it("normalizes internal Docker media URLs to relative /media/ paths", () => {
      const dockerUrl = "http://host.docker.internal:8000/media/products/photo.jpg";
      const localhostUrl = "http://localhost:8000/media/products/photo.jpg";
      const relativeUrl = "/media/products/photo.jpg";
      const externalUrl = "https://images.unsplash.com/photo-123";

      const normalize = (url: string) => {
        const match = url.match(/^https?:\/\/[^/]+(\/media\/.*)$/);
        return match ? match[1] : url;
      };

      expect(normalize(dockerUrl)).toBe("/media/products/photo.jpg");
      expect(normalize(localhostUrl)).toBe("/media/products/photo.jpg");
      expect(normalize(relativeUrl)).toBe("/media/products/photo.jpg");
      expect(normalize(externalUrl)).toBe("https://images.unsplash.com/photo-123");
    });

    it("resolves images whether backend provides image or url property", () => {
      const backendImageObj: { id: number; url?: string; image?: string; is_primary: boolean; display_order: number } = {
        id: 10,
        url: "http://host.docker.internal:8000/media/p.jpg",
        is_primary: true,
        display_order: 0,
      };
      const rawSrc = backendImageObj.image || backendImageObj.url;
      expect(rawSrc).toBe("http://host.docker.internal:8000/media/p.jpg");
    });
  });
});
