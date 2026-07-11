import type { Metadata } from "next";
import ShopClient from "@/components/product/ShopClient";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop Medical Scrubs",
  description:
    "Shop medical scrubs, scrub sets and lab coats for healthcare professionals.",
};

export default function ShopPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-[#063970] to-[#0b78bd] px-4 py-16 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
            Krinay Scrubs Collection
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Shop Medical Scrubs
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-sky-50 sm:text-base">
            Comfortable and practical medical uniforms for doctors, nurses,
            technicians and healthcare teams.
          </p>
        </div>
      </section>

      <ShopClient products={products} />
    </>
  );
}