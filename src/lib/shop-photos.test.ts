import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, photoFileError } from "./shop-photos";

describe("photoFileError", () => {
  it("accepts JPEG, PNG and WebP up to 5 MB", () => {
    expect(photoFileError({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(photoFileError({ type: "image/png", size: MAX_PHOTO_BYTES })).toBeNull();
    expect(photoFileError({ type: "image/webp", size: 1 })).toBeNull();
  });

  it("rejects other types and oversized files", () => {
    expect(photoFileError({ type: "image/heic", size: 1000 })).toMatch(/JPEG, PNG or WebP/);
    expect(photoFileError({ type: "application/pdf", size: 1000 })).toMatch(/JPEG, PNG or WebP/);
    expect(photoFileError({ type: "image/jpeg", size: MAX_PHOTO_BYTES + 1 })).toMatch(/5 MB/);
  });
});

