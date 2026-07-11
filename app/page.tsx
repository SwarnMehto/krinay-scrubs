import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  RotateCcw,
  Truck,
} from "lucide-react";

const benefits = [
  {
    title: "Pan India Delivery",
    description: "Reliable shipping across India",
    icon: Truck,
  },
  {
    title: "Quality Assured",
    description: "Comfortable and durable fabrics",
    icon: BadgeCheck,
  },
  {
    title: "Easy Returns",
    description: "Simple return assistance",
    icon: RotateCcw,
  },
  {
    title: "Customer Support",
    description: "Help before and after ordering",
    icon: Headphones,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8f6fc] via-white to-[#d7eef9]">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="relative z-10">
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0b78bd] shadow-sm">
              Made for healthcare professionals
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Professional scrubs.
              <span className="block text-[#0b78bd]">All-day comfort.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Discover comfortable and functional medical scrubs designed for
              doctors, nurses, technicians and healthcare teams.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#063970] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b78bd]"
              >
                Shop Collection
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/category/women"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 transition hover:border-[#0b78bd] hover:text-[#0b78bd]"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center">
            <div className="absolute h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

            <div className="relative flex h-[420px] w-full max-w-md items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/60 p-8 shadow-2xl shadow-sky-900/10 backdrop-blur">
              <div className="text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#d9f2ff] text-5xl">
                  🩺
                </div>

                <p className="mt-6 text-xl font-black text-[#063970]">
                  Product image will appear here
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  We will add the original Krinay Scrubs model/product image in
                  the next homepage design step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
  <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0b78bd]">
          Featured Products
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Popular medical scrubs
        </h2>
      </div>

      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0b78bd]"
      >
        View All Products
        <ArrowRight size={18} />
      </Link>
    </div>

    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.slice(0, 4).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
</section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-4 sm:px-6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4 lg:px-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title} className="flex items-center gap-4 px-5 py-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0b78bd]">
                  <Icon size={21} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {benefit.title}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0b78bd]">
            Shop by category
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Scrubs for every healthcare professional
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Category cards and original product images will be added in the next
            step.
          </p>
        </div>
      </section>
    </>
  );
}