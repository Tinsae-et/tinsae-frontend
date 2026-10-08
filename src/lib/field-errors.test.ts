import { describe, expect, it } from "vitest";
import { ApiError } from "./api/public";
import { fieldErrorsFrom, saveErrorMessage } from "./field-errors";

describe("fieldErrorsFrom", () => {
  it("takes the first message for each field and skips non-field keys", () => {
    const err = new ApiError("Bad request", 400, {
      name: ["A shop with this name already exists.", "second"],
      phone: "Enter a valid phone number.",
      detail: "Invalid input.",
      non_field_errors: ["Something general."],
    });
    expect(fieldErrorsFrom(err)).toEqual({
      name: "A shop with this name already exists.",
      phone: "Enter a valid phone number.",
    });
  });

  it("returns nothing for errors without a DRF body", () => {
    expect(fieldErrorsFrom(new Error("network"))).toEqual({});
    expect(fieldErrorsFrom(new ApiError("Server error", 500))).toEqual({});
  });
});

describe("saveErrorMessage", () => {
  it("points at the fields when there are field errors", () => {
    expect(saveErrorMessage(new Error("x"), { name: "Taken" }, "fallback")).toMatch(/highlighted fields/);
  });

  it("uses the error message, then the fallback", () => {
    expect(saveErrorMessage(new Error("Shop is locked"), {}, "fallback")).toBe("Shop is locked");
    expect(saveErrorMessage("weird", {}, "fallback")).toBe("fallback");
  });
});
