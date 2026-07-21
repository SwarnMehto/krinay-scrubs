import type { Metadata } from "next";
import { Suspense } from "react";

import ShopClient from "@/components/product/ShopClient";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop Medical Scrubs",
  description:
    "Shop comfortable and professional medical scrubs for doctors, nurses and healthcare professionals.",
};

export default function ShopPage() {
  return (
    <>
      <section className="bg-[#922424] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            Krinay Scrubs Collection
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Shop Medical Scrubs
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            Comfortable, functional and professional
            medical scrubs designed for demanding
            healthcare shifts.
          </p>
        </div>
      </section>

      <Suspense fallback={<ShopLoading />}>
        <ShopClient products={products} />
      </Suspense>
    </>
  );
}

function ShopLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="h-12 w-full animate-pulse rounded-full bg-[#f5dddd]" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden h-[500px] animate-pulse rounded-2xl bg-[#fff4f4] lg:block" />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-[430px] animate-pulse rounded-2xl bg-[#fff4f4]"
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}