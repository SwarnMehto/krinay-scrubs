import BlogForm from "@/components/blog/BlogForm";

export default function NewBlogPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">
        KRINAY ADMIN
      </p>

      <h1 className="mt-2 text-4xl font-black">
        Add New Blog
      </h1>

      <p className="mt-2 text-slate-500">
        Create SEO-friendly
        articles for the Krinay
        Scrub Guide.
      </p>

      <div className="mt-10">
        <BlogForm />
      </div>
    </main>
  );
}