import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/checkout/",
        "/profile/",
      ],
    },
    sitemap: "https://krinay.in/sitemap.xml",
    host: "https://krinay.in",
  };
}