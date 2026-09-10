"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import toast from "react-hot-toast";

type BlogData = {
  _id?: string;

  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageAlt: string;
  author: string;
  category: string;
  tags: string[];

  status:
    | "draft"
    | "published";

  seoTitle: string;
  seoDescription: string;
};

const emptyData: BlogData =
  {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    imageAlt: "",
    author:
      "Krinay Editorial Team",
    category:
      "Scrub Guide",
    tags: [],
    status:
      "draft",
    seoTitle: "",
    seoDescription: "",
  };

function slugify(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

export default function BlogForm({
  initialData,
}: {
  initialData?: BlogData;
}) {
  const router =
    useRouter();

  const [form, setForm] =
    useState<BlogData>(
      initialData ||
        emptyData,
    );

  const [saving, setSaving] =
    useState(false);

  const update = (
    key: keyof BlogData,
    value: any,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const titleChange = (
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,

      title:
        value,

      slug:
        prev.slug ||
        slugify(
          value,
        ),

      seoTitle:
        prev.seoTitle ||
        value,
    }));
  };

  const submit =
    async () => {
      if (
        !form.title ||
        !form.excerpt ||
        !form.content
      ) {
        toast.error(
          "Title, excerpt and content required.",
        );

        return;
      }

      try {
        setSaving(true);

        const editing =
          Boolean(
            initialData?._id,
          );

        const response =
          await fetch(
            editing
              ? `/api/blogs/${initialData?._id}`
              : "/api/blogs",
            {
              method:
                editing
                  ? "PATCH"
                  : "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  form,
                ),
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Blog save failed.",
          );
        }

        toast.success(
          editing
            ? "Blog updated."
            : "Blog created.",
        );

        router.push(
          "/admin/blogs",
        );

        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Blog save failed.",
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="space-y-6">

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Blog Title"
          value={
            form.title
          }
          onChange={
            titleChange
          }
        />

        <Field
          label="URL Slug"
          value={
            form.slug
          }
          onChange={(
            value,
          ) =>
            update(
              "slug",
              slugify(
                value,
              ),
            )
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-black">
          Short Description
        </label>

        <textarea
          value={
            form.excerpt
          }
          onChange={(
            e,
          ) =>
            update(
              "excerpt",
              e.target.value,
            )
          }
          rows={4}
          className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-[#922424]"
          placeholder="Short SEO-friendly summary of this blog..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-black">
          Blog Content
        </label>

        <p className="mb-2 text-xs text-slate-500">
          Heading ke liye
          ##, subheading ke
          liye ### aur bullet
          ke liye - use karo.
        </p>

        <textarea
          value={
            form.content
          }
          onChange={(
            e,
          ) =>
            update(
              "content",
              e.target.value,
            )
          }
          rows={24}
          className="w-full rounded-xl border border-slate-300 p-4 font-mono text-sm outline-none focus:border-[#922424]"
          placeholder={`## Why Medical Scrubs Matter

Medical scrubs are designed...

### Benefits

- Comfortable for long shifts
- Professional appearance
- Easy movement`}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Featured Image URL"
          value={
            form.featuredImage
          }
          onChange={(
            value,
          ) =>
            update(
              "featuredImage",
              value,
            )
          }
        />

        <Field
          label="Image Alt Text"
          value={
            form.imageAlt
          }
          onChange={(
            value,
          ) =>
            update(
              "imageAlt",
              value,
            )
          }
        />

        <Field
          label="Author"
          value={
            form.author
          }
          onChange={(
            value,
          ) =>
            update(
              "author",
              value,
            )
          }
        />

        <Field
          label="Category"
          value={
            form.category
          }
          onChange={(
            value,
          ) =>
            update(
              "category",
              value,
            )
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-black">
          Tags
        </label>

        <input
          value={
            form.tags.join(
              ", ",
            )
          }
          onChange={(
            e,
          ) =>
            update(
              "tags",
              e.target.value
                .split(",")
                .map(
                  (
                    tag,
                  ) =>
                    tag.trim(),
                )
                .filter(
                  Boolean,
                ),
            )
          }
          placeholder="medical scrubs, doctor scrubs, nursing scrubs"
          className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-[#922424]"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-black">
          SEO Settings
        </h2>

        <div className="mt-5 space-y-5">
          <Field
            label="SEO Title"
            value={
              form.seoTitle
            }
            onChange={(
              value,
            ) =>
              update(
                "seoTitle",
                value,
              )
            }
          />

          <div>
            <label className="mb-2 block text-sm font-black">
              Meta Description
            </label>

            <textarea
              value={
                form.seoDescription
              }
              onChange={(
                e,
              ) =>
                update(
                  "seoDescription",
                  e.target.value,
                )
              }
              rows={3}
              maxLength={170}
              className="w-full rounded-xl border border-slate-300 bg-white p-4 outline-none focus:border-[#922424]"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {
                form
                  .seoDescription
                  .length
              }
              /170
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-black">
          Blog Status
        </label>

        <select
          value={
            form.status
          }
          onChange={(
            e,
          ) =>
            update(
              "status",
              e.target.value,
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-5 py-3"
        >
          <option value="draft">
            Draft
          </option>

          <option value="published">
            Published
          </option>
        </select>
      </div>

      <button
        type="button"
        disabled={
          saving
        }
        onClick={
          submit
        }
        className="rounded-full bg-[#922424] px-8 py-4 font-black text-white transition hover:bg-[#731b1b] disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : initialData?._id
            ? "Update Blog"
            : "Publish / Save Blog"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black">
        {label}
      </label>

      <input
        value={value}
        onChange={(
          e,
        ) =>
          onChange(
            e.target.value,
          )
        }
        className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-[#922424]"
      />
    </div>
  );
}