import { describe, expect, it } from "vitest";
import {
  canSubmitVerification,
  formatVerificationDate,
  validateVerificationDetail,
} from "./verification";

describe("canSubmitVerification", () => {
  it("allows submission when state is not_submitted and unverified", () => {
    expect(canSubmitVerification("not_submitted", false)).toBe(true);
  });

  it("allows submission when state is rejected and unverified (resubmission)", () => {
    expect(canSubmitVerification("rejected", false)).toBe(true);
  });

  it("disallows submission when request is pending", () => {
    expect(canSubmitVerification("pending", false)).toBe(false);
  });

  it("disallows submission when state is approved", () => {
    expect(canSubmitVerification("approved", true)).toBe(false);
    expect(canSubmitVerification("approved", false)).toBe(false);
  });

  it("disallows submission if is_verified is true regardless of state", () => {
    expect(canSubmitVerification("not_submitted", true)).toBe(false);
    expect(canSubmitVerification("rejected", true)).toBe(false);
  });
});

describe("validateVerificationDetail", () => {
  it("fails on empty or whitespace-only input", () => {
    expect(validateVerificationDetail("").valid).toBe(false);
    expect(validateVerificationDetail("   \n\t  ").valid).toBe(false);
    expect(validateVerificationDetail("").error).toContain("Please provide supporting business details");
  });

  it("fails on input that is too brief", () => {
    const result = validateVerificationDetail("TIN 123");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("minimum 10 characters");
  });

  it("succeeds on informative business input", () => {
    const result = validateVerificationDetail(
      "Business TIN #0098765432, Addis Ababa Trade License #14/2016",
    );
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe("formatVerificationDate", () => {
  it("returns empty string for null or undefined", () => {
    expect(formatVerificationDate(null)).toBe("");
    expect(formatVerificationDate(undefined)).toBe("");
    expect(formatVerificationDate("")).toBe("");
  });

  it("formats valid ISO timestamp consistently", () => {
    const formatted = formatVerificationDate("2026-09-07T18:30:00Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Sep");
  });

  it("returns original string for unparseable input", () => {
    expect(formatVerificationDate("invalid-date")).toBe("invalid-date");
  });
});
