// Where the Django API lives. The one place these env vars are read.
//
// Two audiences, two URLs:
//  - Server code (Server Components, route handlers, the proxy) reaches Django
//    via API_INTERNAL_URL when set — inside Docker that is host.docker.internal
//    or a private hostname the browser could never resolve.
//  - The browser uses NEXT_PUBLIC_API_URL, which Next inlines into the client
//    bundle *at build time* (see the Dockerfile's build arg).

const LOCAL_DEFAULT = "http://localhost:8000";

/** Django base URL for server-side code. */
export const SERVER_API_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? LOCAL_DEFAULT;

/** Django base URL for code running in the browser. */
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? LOCAL_DEFAULT;

/** Whichever of the two applies where this module is evaluated. */
export const API_URL = typeof window === "undefined" ? SERVER_API_URL : PUBLIC_API_URL;

/**
 * The public origin of this site, for canonical URLs, Open Graph, the sitemap
 * and robots.txt. Read at runtime on the server (no NEXT_PUBLIC_ prefix), so
 * one image can serve any domain.
 */
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * Browser key for the Google Maps JavaScript API (the shop profile map).
 * Inlined at build time like NEXT_PUBLIC_API_URL. Optional: without it the
 * map is hidden and the address and directions link still work.
 */
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
