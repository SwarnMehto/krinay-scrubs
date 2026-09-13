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
  `${SITE_URL}/category/women`;

export const metadata: Metadata =
  {
    title:
      "Women's Medical Scrubs & Scrub Sets for Healthcare",

    description:
      "Shop premium women's medical scrubs by Krinay. Comfortable and stretchable scrub sets designed for doctors, nurses and healthcare professionals.",

    alternates: {
      canonical:
        CANONICAL_URL,
    },

    /*
     * /category/women is the main SEO URL.
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
        "Women's Medical Scrubs | Krinay Scrubs",

      description:
        "Premium medical scrubs and professional scrub sets for women.",

      url:
        CANONICAL_URL,
    },
  };

export default function WomenPage() {
  const womenProducts =
    products.filter(
      (product) =>
        product.gender ===
          "Women" &&
        product.productType ===
          "scrub",
    );

  const heroProduct =
    womenProducts[0];

  return (
    <main className="bg-white">
      {/* ==========================
          HERO
      ========================== */}

      <section className="bg-[#f5f1ed]">
        <div className="mx-auto grid min-h-[340px] max-w-[1340px] overflow-hidden lg:grid-cols-2">
          <div className="flex items-center px-7 py-14 sm:px-12 lg:px-16">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">
                Krinay Women
              </p>

              <h1 className="mt-4 max-w-md text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                Style meets
                functionality
              </h1>

              <p className="mt-4 text-xl text-slate-600">
                Premium
                medical
                scrubs for
                women
              </p>
            </div>
          </div>

          {heroProduct && (
            <div className="relative hidden min-h-[340px] lg:block">
              <img
                src={
                  heroProduct.image
                }
                alt="Krinay women's medical scrubs"
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
          Women&apos;s
          Scrubs Collection
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
            href="/category/women"
            className="font-bold hover:text-[#922424]"
          >
            Buy Women&apos;s
            Medical Scrub
            Suits with Krinay
          </Link>
        </nav>
      </section>

      <GenderCollectionClient
        gender="Women"
        products={
          womenProducts
        }
      />
    </main>
  );
}