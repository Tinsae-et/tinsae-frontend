import type { NextConfig } from "next";

// Product images are served by Django with absolute URLs built from the request
// host (catalog/serializers.py -> build_absolute_uri), so next/image needs the
// backend host allow-listed. Derived from the env vars the API client uses
// (NEXT_PUBLIC_API_URL and API_INTERNAL_URL) plus local dev defaults
// (localhost, 127.0.0.1, host.docker.internal).
const rawUrls = [
  process.env.NEXT_PUBLIC_API_URL,
  process.env.API_INTERNAL_URL,
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://host.docker.internal:8000",
].filter(Boolean) as string[];

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const patterns: RemotePattern[] = [];
const seen = new Set<string>();

for (const urlStr of rawUrls) {
  try {
    const { protocol, hostname, port } = new URL(urlStr);
    const key = `${protocol}//${hostname}:${port}`;
    if (!seen.has(key)) {
      seen.add(key);
      patterns.push({
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port: port || undefined,
        pathname: "/media/**",
      });
    }
  } catch {
    // ignore invalid URL
  }
}

// Support seed/mock external image sources if present (e.g. Unsplash)
patterns.push({
  protocol: "https",
  hostname: "images.unsplash.com",
  pathname: "/**",
});

const backendMediaUrl =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: patterns,
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${backendMediaUrl}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
