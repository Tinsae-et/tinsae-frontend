import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or pointless to index: the merchant dashboard, account pages,
      // auth screens and the JSON routes.
      disallow: ["/shop/", "/dashboard", "/account", "/settings", "/signin", "/signup", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
