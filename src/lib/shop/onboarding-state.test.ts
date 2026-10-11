import { afterEach, describe, expect, it, vi } from "vitest";

import { DETAILS, errorsFor, initialState, loadDraft, shopLocation } from "@/lib/shop/onboarding-state";

const details = { ...initialState, step: DETAILS, name: "Selam", cats: ["Electronics"], phone: "912345678" };

describe("shop location", () => {
  it("accepts any city, not only Addis Ababa", () => {
    const errors = errorsFor({ ...details, city: "Hawassa", area: "Piassa" });
    expect(errors.city).toBeUndefined();
    expect(errors.area).toBeUndefined();
  });

  it("asks for both the city and the neighbourhood", () => {
    const errors = errorsFor({ ...details, city: " ", area: "" });
    expect(errors.city).toBeDefined();
    expect(errors.area).toBeDefined();
  });

  it("is stored as city · neighbourhood", () => {
    expect(shopLocation({ city: " Bahir Dar ", area: "Kebele 04 " })).toBe("Bahir Dar · Kebele 04");
  });
});

describe("loadDraft", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("moves a draft from the Bole-only area picker into Addis Ababa", () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => JSON.stringify({ name: "Selam", area: "Atlas" }) },
    });
    expect(loadDraft("u1")).toMatchObject({ city: "Addis Ababa", area: "Bole, Atlas" });
  });
});
