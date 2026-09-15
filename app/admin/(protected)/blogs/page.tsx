"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Edit,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

type Blog = {
  _id: string;

  title: string;

  slug: string;

  status:
    | "draft"
    | "published";

  createdAt: string;
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] =
    useState<Blog[]>(
      [],
    );

  const [loading, setLoading] =
    useState(true);

  const loadBlogs =
    async () => {
      try {
        const response =
          await fetch(
            "/api/blogs?admin=1",
            {
              cache:
                "no-store",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load blogs.",
          );
        }

        setBlogs(
          data.blogs ||
            [],
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load blogs.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadBlogs();
  }, []);

  const deleteBlog =
    async (
      id: string,
    ) => {
      const confirmed =
        window.confirm(
          "Delete this blog permanently?",
        );

      if (!confirmed) {
        return;
      }

      const response =
        await fetch(
          `/api/blogs/${id}`,
          {
            method:
              "DELETE",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        toast.error(
          data.message ||
            "Delete failed.",
        );

        return;
      }

      toast.success(
        "Blog deleted.",
      );

      await loadBlogs();
    };

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">

      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">
            KRINAY ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Blog Management
          </h1>

          <p className="mt-2 text-slate-500">
            Add, edit, publish
            or remove Scrub
            Guide articles.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-6 py-3 font-black text-white"
        >
          <Plus size={18} />

          Add New Blog
        </Link>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-10 text-center">
            Loading blogs...
          </div>
        ) : blogs.length ===
          0 ? (
          <div className="p-14 text-center">
            <h2 className="text-2xl font-black">
              No blogs yet
            </h2>

            <p className="mt-2 text-slate-500">
              Create your first
              Krinay SEO article.
            </p>

            <Link
              href="/admin/blogs/new"
              className="mt-6 inline-block rounded-full bg-[#922424] px-6 py-3 font-black text-white"
            >
              Add First Blog
            </Link>
          </div>
        ) : (
          blogs.map(
            (blog) => (
              <div
                key={
                  blog._id
                }
                className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-200 p-5 last:border-0"
              >
                <div>
                  <h2 className="font-black text-slate-950">
                    {
                      blog.title
                    }
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    /blog/
                    {
                      blog.slug
                    }
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black capitalize ${
                      blog.status ===
                      "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {
                      blog.status
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {blog.status ===
                    "published" && (
                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200"
                    >
                      <Eye
                        size={17}
                      />
                    </Link>
                  )}

                  <Link
                    href={`/admin/blogs/${blog._id}/edit`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200"
                  >
                    <Edit
                      size={17}
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      deleteBlog(
                        blog._id,
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-600"
                  >
                    <Trash2
                      size={17}
                    />
                  </button>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </main>
  );
}