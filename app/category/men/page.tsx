import type {
  Metadata,
} from "next";

import Link from "next/link";

import GenderCollectionClient from "@/components/product/GenderCollectionClient";

import {
  products,
} from "@/data/products";

const SITE_URL =
  "https://www.krinay.in";

const CANONICAL_URL =
  `${SITE_URL}/category/men`;

export const metadata: Metadata =
  {
    title:
      "Men's Medical Scrubs & Scrub Sets for Doctors",

    description:
      "Shop premium men's medical scrubs by Krinay. Comfortable, professional scrub sets designed for doctors, nurses and healthcare professionals.",

    alternates: {
      canonical:
        CANONICAL_URL,
    },

    /*
     * /category/men is the main SEO URL.
     * Keep this duplicate route out of the index.
     */

    robots: {
      index:
        false,

      follow:
        true,
    },

    openGraph: {
      type:
        "website",

      locale:
        "en_IN",

      siteName:
        "Krinay Scrubs",

      title:
        "Men's Medical Scrubs | Krinay Scrubs",

      description:
        "Premium medical scrubs and professional scrub sets for men.",

      url:
        CANONICAL_URL,
    },
  };

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
                Performance
                medical
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

        <nav
          aria-label="Breadcrumb"
          className="mt-3 flex flex-wrap items-center gap-2 text-sm"
        >
          <Link
            href="/"
            className="hover:text-[#922424]"
          >
            Home
          </Link>

          <span>
            /
          </span>

          <Link
            href="/category/men"
            className="font-bold hover:text-[#922424]"
          >
            Buy Men&apos;s
            Medical Scrub
            Suits with Krinay
          </Link>
        </nav>
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