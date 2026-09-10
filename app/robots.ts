import type {
  MetadataRoute,
} from "next";

const baseUrl =
  (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "https://krinay.in"
  ).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent:
          "*",

        allow: [
          "/",
          "/shop",
          "/category/",
          "/product/",
          "/blog/",
          "/about",
          "/contact",
          "/bulk-order",
        ],

        disallow: [
          /*
           * Admin
           */
          "/admin/",
          "/api/",

          /*
           * Checkout / Cart
           */
          "/checkout/",
          "/cart/",

          /*
           * User account
           */
          "/profile/",
          "/account/",
          "/login",
          "/register",

          /*
           * Customer-specific utility
           */
          "/wishlist/",
        ],
      },
    ],

    sitemap:
      `${baseUrl}/sitemap.xml`,

    host:
      baseUrl,
  };
}