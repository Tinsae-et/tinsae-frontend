import type { NextConfig } from "next";

// Product images are served by Django with absolute URLs built from the request
// host (catalog/serializers.py -> build_absolute_uri), so next/image needs the
// backend host allow-listed. Derived from the same env var the API client uses
// so this keeps working when the backend moves.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const { protocol, hostname, port } = new URL(apiUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port: port || undefined,
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
