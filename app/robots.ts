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

        allow:
          "/",

        disallow: [
          /*
           * Admin
           */
          "/admin",
          "/api",

          /*
           * Cart / Checkout / Order flow
           */
          "/cart",
          "/checkout",
          "/order-success",

          /*
           * Account / Authentication
           */
          "/account",
          "/profile",
          "/login",
          "/register",
          "/forgot-password",

          /*
           * Personal / utility pages
           */
          "/wishlist",
          "/invoice",
        ],
      },
    ],

    sitemap:
      `${baseUrl}/sitemap.xml`,

    host:
      baseUrl,
  };
}