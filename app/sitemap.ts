import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://krinay.in";

const currentDate = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },

    {
      url: `${baseUrl}/category/men`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/category/women`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/category/lab-coats`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },

    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/bulk-order`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/track-order`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: `${baseUrl}/return-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.2,
    },

    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}