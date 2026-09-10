import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

type BlogCardProps = {
  blog: {
    title: string;
    slug: string;
    excerpt: string;

    featuredImage?: string;

    imageAlt?: string;

    category?: string;

    publishedAt?:
      | string
      | Date
      | null;
  };
};

export default function BlogCard({
  blog,
}: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      {blog.featuredImage && (
        <Link
          href={`/blog/${blog.slug}`}
          className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
        >
          <Image
            src={
              blog.featuredImage
            }
            alt={
              blog.imageAlt ||
              blog.title
            }
            fill
            className="object-cover transition duration-300 hover:scale-[1.03]"
          />
        </Link>
      )}

      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#922424]">
          {blog.category ||
            "Scrub Guide"}
        </p>

        <h2 className="mt-3 text-xl font-black leading-tight text-slate-950">
          <Link
            href={`/blog/${blog.slug}`}
            className="transition hover:text-[#922424]"
          >
            {blog.title}
          </Link>
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {blog.excerpt}
        </p>

        {blog.publishedAt && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays
              size={14}
            />

            {new Date(
              blog.publishedAt,
            ).toLocaleDateString(
              "en-IN",
              {
                day:
                  "numeric",

                month:
                  "short",

                year:
                  "numeric",
              },
            )}
          </div>
        )}

        <Link
          href={`/blog/${blog.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#922424]"
        >
          Read Guide
          <ArrowRight
            size={16}
          />
        </Link>
      </div>
    </article>
  );
}