import { describe, expect, it } from "vitest";
import { getDirectionsUrl, getShopLocation } from "./shop-location";

describe("getShopLocation", () => {
  it("parses stored coordinates, numeric or string", () => {
    expect(getShopLocation({ latitude: "9.0108", longitude: "38.7613" })).toEqual({
      lat: 9.0108,
      lng: 38.7613,
    });
    expect(getShopLocation({ latitude: 9.0108, longitude: 38.7613 })).toEqual({
      lat: 9.0108,
      lng: 38.7613,
    });
  });

  it("keeps a zero coordinate", () => {
    expect(getShopLocation({ latitude: 0, longitude: 38.7613 })).toEqual({ lat: 0, lng: 38.7613 });
  });

  it("returns null when either coordinate is missing or unusable", () => {
    expect(getShopLocation({})).toBeNull();
    expect(getShopLocation({ latitude: null, longitude: "38.7613" })).toBeNull();
    expect(getShopLocation({ latitude: "", longitude: "38.7613" })).toBeNull();
    expect(getShopLocation({ latitude: "  ", longitude: "38.7613" })).toBeNull();
    expect(getShopLocation({ latitude: "abc", longitude: "38.7613" })).toBeNull();
    expect(getShopLocation({ latitude: "91", longitude: "38.7613" })).toBeNull();
    expect(getShopLocation({ latitude: "9.01", longitude: "181" })).toBeNull();
  });
});

describe("getDirectionsUrl", () => {
  it("builds a Google Maps directions link to the coordinates", () => {
    expect(getDirectionsUrl({ lat: 9.0108, lng: 38.7613 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=9.0108,38.7613"
    );
  });
});
