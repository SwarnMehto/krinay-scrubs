import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
} from "lucide-react";

import BlogContent from "@/components/blog/BlogContent";

import {
  getPublishedBlogBySlug,
} from "@/lib/blog-utils";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const blog: any =
    await getPublishedBlogBySlug(
      slug,
    );

  if (!blog) {
    return {
      title:
        "Blog Not Found | KRINAY",
    };
  }

  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "https://krinay.in";

  const url =
    `${siteUrl}/blog/${blog.slug}`;

  return {
    title:
      blog.seoTitle ||
      blog.title,

    description:
      blog.seoDescription ||
      blog.excerpt,

    alternates: {
      canonical:
        url,
    },

    openGraph: {
      type:
        "article",

      title:
        blog.seoTitle ||
        blog.title,

      description:
        blog.seoDescription ||
        blog.excerpt,

      url,

      images:
        blog.featuredImage
          ? [
              {
                url:
                  blog.featuredImage,

                alt:
                  blog.imageAlt ||
                  blog.title,
              },
            ]
          : [],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        blog.seoTitle ||
        blog.title,

      description:
        blog.seoDescription ||
        blog.excerpt,

      images:
        blog.featuredImage
          ? [
              blog.featuredImage,
            ]
          : [],
    },
  };
}

export const revalidate =
  3600;

export default async function BlogArticlePage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const blog: any =
    await getPublishedBlogBySlug(
      slug,
    );

  if (!blog) {
    notFound();
  }

  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "https://krinay.in";

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      blog.title,

    description:
      blog.seoDescription ||
      blog.excerpt,

    image:
      blog.featuredImage
        ? [
            blog.featuredImage,
          ]
        : [],

    datePublished:
      blog.publishedAt,

    dateModified:
      blog.updatedAt,

    author: {
      "@type":
        "Organization",

      name:
        blog.author ||
        "KRINAY",
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "KRINAY",

      url:
        siteUrl,
    },

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        `${siteUrl}/blog/${blog.slug}`,
    },
  };

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd,
            ),
        }}
      />

      <article className="mx-auto max-w-4xl px-5 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#922424]"
        >
          <ArrowLeft
            size={16}
          />
          Scrub Guide
        </Link>

        <header className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#922424]">
            {blog.category ||
              "Scrub Guide"}
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            {blog.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {blog.excerpt}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="font-bold">
              By{" "}
              {blog.author ||
                "KRINAY"}
            </span>

            {blog.publishedAt && (
              <span className="flex items-center gap-2">
                <CalendarDays
                  size={16}
                />

                {new Date(
                  blog.publishedAt,
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day:
                      "numeric",

                    month:
                      "long",

                    year:
                      "numeric",
                  },
                )}
              </span>
            )}
          </div>
        </header>

        {blog.featuredImage && (
          <div className="relative mt-9 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100">
            <Image
              src={
                blog.featuredImage
              }
              alt={
                blog.imageAlt ||
                blog.title
              }
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-10">
          <BlogContent
            content={
              blog.content
            }
          />
        </div>

        <div className="mt-14 rounded-3xl bg-[#fff6f6] p-7">
          <h2 className="text-2xl font-black">
            Shop KRINAY Medical
            Scrubs
          </h2>

          <p className="mt-2 leading-7 text-slate-600">
            Explore comfortable,
            performance-focused
            scrubs designed for
            healthcare
            professionals.
          </p>

          <Link
            href="/shop"
            className="mt-5 inline-block rounded-full bg-[#922424] px-6 py-3 font-black text-white"
          >
            Shop Scrubs
          </Link>
        </div>
      </article>
    </main>
  );
}