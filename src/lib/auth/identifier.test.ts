import { describe, expect, it } from "vitest";

import { identifierShape } from "./identifier";

describe("identifierShape", () => {
  it("routes anything containing @ to email", () => {
    expect(identifierShape("sales@bolephones.et")).toBe("email");
    expect(identifierShape("  MERCHANT@tinsae.et  ")).toBe("email");
  });

  it("treats an @-shaped username as an email, exactly as the backend does", () => {
    // Not a bug: it is why registration refuses usernames of this shape. If
    // this ever returned "username", the ambiguity the shape routing exists to
    // prevent would be back.
    expect(identifierShape("sara@shop.et")).toBe("email");
  });

  it("accepts every phone form a merchant types", () => {
    for (const input of [
      "+251911000001",
      "251911000001",
      "0911000001",
      "911000001",
      "09 11 000 001",
      "+251-911-000-001",
    ]) {
      expect(identifierShape(input)).toBe("phone");
    }
  });

  it("accepts Safaricom numbers, which open with 7", () => {
    expect(identifierShape("0711000001")).toBe("phone");
  });

  it("rejects numbers that are not Ethiopian mobiles", () => {
    // A landline: right length, wrong opening digit.
    expect(identifierShape("0111000001")).toBe("username");
    // Too short, and too long.
    expect(identifierShape("091100000")).toBe("username");
    expect(identifierShape("09110000012")).toBe("username");
  });

  it("keeps a username that merely contains digits", () => {
    expect(identifierShape("bole9")).toBe("username");
    expect(identifierShape("shop2024")).toBe("username");
  });

  it("falls back to username for ordinary names", () => {
    expect(identifierShape("seed_merchant")).toBe("username");
    expect(identifierShape("")).toBe("username");
  });
});
