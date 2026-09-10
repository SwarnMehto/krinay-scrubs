import type {
  Metadata,
} from "next";

import BlogCard from "@/components/blog/BlogCard";

import {
  getPublishedBlogs,
} from "@/lib/blog-utils";

export const metadata: Metadata =
  {
    title:
      "Medical Scrub Guides & Healthcare Apparel Tips | KRINAY",

    description:
      "Explore KRINAY Scrub Guide for medical scrub buying tips, size guides, fabric advice, scrub care and helpful information for doctors, nurses and healthcare professionals.",

    alternates: {
      canonical:
        "/blog",
    },

    openGraph: {
      title:
        "KRINAY Scrub Guide",

      description:
        "Medical scrub guides, sizing, fabric advice and healthcare apparel tips.",

      type:
        "website",
    },
  };

export const revalidate =
  3600;

export default async function BlogPage() {
  const blogs =
    await getPublishedBlogs();

  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
            KRINAY
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
            Scrub Guide
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Practical guides for
            doctors, nurses,
            healthcare workers and
            medical students to
            choose, wear and care
            for medical scrubs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        {blogs.length ===
        0 ? (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-black">
              Scrub guides coming
              soon.
            </h2>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map(
              (blog:
                any) => (
                <BlogCard
                  key={String(
                    blog._id,
                  )}
                  blog={{
                    ...blog,

                    publishedAt:
                      blog.publishedAt
                        ? String(
                            blog.publishedAt,
                          )
                        : null,
                  }}
                />
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}