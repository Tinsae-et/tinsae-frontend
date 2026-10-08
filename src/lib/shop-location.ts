import type { Shop } from "./types";

export type LatLng = { lat: number; lng: number };

/**
 * The shop's stored coordinates, or null when it has none. Never guesses: a
 * missing, blank or out-of-range value means "no location", not a city centre.
 */
export function getShopLocation(shop: Pick<Shop, "latitude" | "longitude">): LatLng | null {
  const lat = toCoordinate(shop.latitude);
  const lng = toCoordinate(shop.longitude);
  if (lat === null || lng === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

/** Google Maps directions to the point; on phones this opens the Maps app. */
export function getDirectionsUrl({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function toCoordinate(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
