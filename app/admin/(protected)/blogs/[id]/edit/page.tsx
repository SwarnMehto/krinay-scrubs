"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import BlogForm from "@/components/blog/BlogForm";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    use(params);

  const [blog, setBlog] =
    useState<any>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response =
          await fetch(
            `/api/blogs/${id}`,
            {
              cache:
                "no-store",
            },
          );

        const data =
          await response.json();

        if (response.ok) {
          setBlog(
            data.blog,
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10">
        Loading blog...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-10">
        Blog not found.
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">
        KRINAY ADMIN
      </p>

      <h1 className="mt-2 text-4xl font-black">
        Edit Blog
      </h1>

      <div className="mt-10">
        <BlogForm
          initialData={{
            _id:
              blog._id,

            title:
              blog.title ||
              "",

            slug:
              blog.slug ||
              "",

            excerpt:
              blog.excerpt ||
              "",

            content:
              blog.content ||
              "",

            featuredImage:
              blog.featuredImage ||
              "",

            imageAlt:
              blog.imageAlt ||
              "",

            author:
              blog.author ||
              "Krinay Editorial Team",

            category:
              blog.category ||
              "Scrub Guide",

            tags:
              blog.tags ||
              [],

            status:
              blog.status ||
              "draft",

            seoTitle:
              blog.seoTitle ||
              "",

            seoDescription:
              blog.seoDescription ||
              "",
          }}
        />
      </div>
    </main>
  );
}