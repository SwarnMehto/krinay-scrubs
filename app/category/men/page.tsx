import Link from "next/link";

import GenderCollectionClient from "@/components/product/GenderCollectionClient";

import {
  products,
} from "@/data/products";

export default function MenPage() {
  const menProducts =
    products.filter(
      (product) =>
        product.gender ===
          "Men" &&
        product.productType ===
          "scrub",
    );

  const heroProduct =
    menProducts[0];

  return (
    <main className="bg-white">
      {/* ==========================
          HERO
      ========================== */}

      <section className="bg-[#f3f2f0]">
        <div className="mx-auto grid min-h-[340px] max-w-[1340px] overflow-hidden lg:grid-cols-2">
          <div className="flex items-center px-7 py-14 sm:px-12 lg:px-16">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">
                Krinay Men
              </p>

              <h1 className="mt-4 max-w-md text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                Confidence in
                every stitch
              </h1>

              <p className="mt-4 text-xl text-slate-600">
                Performance medical
                scrubs for men
              </p>
            </div>
          </div>

          {heroProduct && (
            <div className="relative hidden min-h-[340px] lg:block">
              <img
                src={
                  heroProduct.image
                }
                alt="Krinay men's medical scrubs"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </div>
          )}
        </div>
      </section>

      {/* ==========================
          COLLECTION
      ========================== */}

      <section className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6">
        <h2 className="text-xl font-semibold">
          Men&apos;s Scrub
          Collections
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="hover:text-[#922424]"
          >
            Home
          </Link>

          <span>/</span>

          <strong>
            Buy Men&apos;s
            Medical Scrub Suits
            with Krinay
          </strong>
        </div>
      </section>

      <GenderCollectionClient
        gender="Men"
        products={
          menProducts
        }
      />
    </main>
  );
}