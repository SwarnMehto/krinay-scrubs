import type {
  MetadataRoute,
} from "next";

import {
  getPublishedBlogs,
} from "@/lib/blog-utils";

const baseUrl =
  (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "https://krinay.in"
  ).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate =
    new Date();

  /*
   * ==========================================
   * STATIC WEBSITE PAGES
   * ==========================================
   */

  const staticPages: MetadataRoute.Sitemap =
    [
      {
        url:
          `${baseUrl}`,

        lastModified:
          currentDate,

        changeFrequency:
          "weekly",

        priority:
          1,
      },

      {
        url:
          `${baseUrl}/shop`,

        lastModified:
          currentDate,

        changeFrequency:
          "daily",

        priority:
          0.95,
      },

      {
        url:
          `${baseUrl}/category/men`,

        lastModified:
          currentDate,

        changeFrequency:
          "weekly",

        priority:
          0.9,
      },

      {
        url:
          `${baseUrl}/category/women`,

        lastModified:
          currentDate,

        changeFrequency:
          "weekly",

        priority:
          0.9,
      },

      {
        url:
          `${baseUrl}/category/lab-coats`,

        lastModified:
          currentDate,

        changeFrequency:
          "weekly",

        priority:
          0.85,
      },

      /*
       * ======================================
       * SCRUB GUIDE / BLOG
       * ======================================
       */

      {
        url:
          `${baseUrl}/blog`,

        lastModified:
          currentDate,

        changeFrequency:
          "daily",

        priority:
          0.85,
      },

      {
        url:
          `${baseUrl}/about`,

        lastModified:
          currentDate,

        changeFrequency:
          "monthly",

        priority:
          0.7,
      },

      {
        url:
          `${baseUrl}/contact`,

        lastModified:
          currentDate,

        changeFrequency:
          "monthly",

        priority:
          0.8,
      },

      {
        url:
          `${baseUrl}/bulk-order`,

        lastModified:
          currentDate,

        changeFrequency:
          "monthly",

        priority:
          0.8,
      },

      {
        url:
          `${baseUrl}/track-order`,

        lastModified:
          currentDate,

        changeFrequency:
          "monthly",

        priority:
          0.6,
      },

      {
        url:
          `${baseUrl}/shipping-policy`,

        lastModified:
          currentDate,

        changeFrequency:
          "yearly",

        priority:
          0.3,
      },

      {
        url:
          `${baseUrl}/return-policy`,

        lastModified:
          currentDate,

        changeFrequency:
          "yearly",

        priority:
          0.3,
      },

      {
        url:
          `${baseUrl}/privacy-policy`,

        lastModified:
          currentDate,

        changeFrequency:
          "yearly",

        priority:
          0.2,
      },

      {
        url:
          `${baseUrl}/terms-and-conditions`,

        lastModified:
          currentDate,

        changeFrequency:
          "yearly",

        priority:
          0.2,
      },
    ];

  /*
   * ==========================================
   * DYNAMIC PUBLISHED BLOGS
   * ==========================================
   *
   * Draft blogs sitemap me nahi aayenge.
   */

  try {
    const blogs: any[] =
      await getPublishedBlogs();

    const blogPages: MetadataRoute.Sitemap =
      blogs.map(
        (blog) => ({
          url:
            `${baseUrl}/blog/${blog.slug}`,

          lastModified:
            blog.updatedAt
              ? new Date(
                  blog.updatedAt,
                )
              : blog.publishedAt
                ? new Date(
                    blog.publishedAt,
                  )
                : currentDate,

          changeFrequency:
            "monthly" as const,

          priority:
            0.75,
        }),
      );

    return [
      ...staticPages,
      ...blogPages,
    ];
  } catch (error) {
    /*
     * DB temporary unavailable ho to
     * sitemap completely crash nahi karega.
     */

    console.error(
      "[SITEMAP] Blog sitemap generation failed:",
      error,
    );

    return staticPages;
  }
}