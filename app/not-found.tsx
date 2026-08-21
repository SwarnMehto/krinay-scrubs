import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-20">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-[#922424]">
          <SearchX size={42} />
        </div>

        <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[#922424]">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Product not found
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600">
          Requested product available nahi hai ya uska link change ho gaya hai.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#922424]"
        >
          <ArrowLeft size={18} />
          Back to Shop
        </Link>
      </div>
    </section>
  );
}