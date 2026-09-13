import type {
  Metadata,
} from "next";

import Link from "next/link";
import { Suspense } from "react";

import ShopClient from "@/components/product/ShopClient";

import {
  products,
} from "@/data/products";

/*
 * =========================================================
 * SITE CONFIG
 * =========================================================
 */

const SITE_URL =
  "https://www.krinay.in";

const SHOP_URL =
  `${SITE_URL}/shop`;

const SITE_NAME =
  "Krinay Scrubs";

const SHOP_TITLE =
  "Shop Medical Scrubs for Doctors, Nurses & Healthcare Professionals";

const SHOP_DESCRIPTION =
  "Shop premium medical scrubs by Krinay for doctors, nurses, medical students and healthcare professionals. Explore comfortable, stretchable and professional scrub sets for long clinical shifts.";

/*
 * =========================================================
 * SEO METADATA
 * =========================================================
 *
 * Root layout already uses:
 *
 * %s | Krinay Scrubs
 *
 * Therefore do not manually append
 * "| Krinay Scrubs" here.
 */

export const metadata: Metadata =
  {
    title:
      SHOP_TITLE,

    description:
      SHOP_DESCRIPTION,

    keywords: [
      "medical scrubs",
      "medical scrubs India",
      "doctor scrubs",
      "nurse scrubs",
      "hospital scrubs",
      "medical scrub sets",
      "scrub suits",
      "scrubs for doctors",
      "scrubs for nurses",
      "scrubs for medical students",
      "healthcare uniforms",
      "hospital uniforms",
      "medical uniforms",
      "men medical scrubs",
      "women medical scrubs",
      "professional scrubs India",
      "Krinay Scrubs",
    ],

    /*
     * =======================================
     * CANONICAL
     * =======================================
     */

    alternates: {
      canonical:
        SHOP_URL,
    },

    /*
     * =======================================
     * SEARCH ENGINE CRAWLING
     * =======================================
     */

    robots: {
      index:
        true,

      follow:
        true,

      googleBot: {
        index:
          true,

        follow:
          true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },

    /*
     * =======================================
     * OPEN GRAPH
     * =======================================
     */

    openGraph: {
      type:
        "website",

      locale:
        "en_IN",

      siteName:
        SITE_NAME,

      url:
        SHOP_URL,

      title:
        SHOP_TITLE,

      description:
        SHOP_DESCRIPTION,
    },

    /*
     * =======================================
     * TWITTER / SOCIAL SHARING
     * =======================================
     */

    twitter: {
      card:
        "summary_large_image",

      title:
        SHOP_TITLE,

      description:
        SHOP_DESCRIPTION,
    },
  };

/*
 * =========================================================
 * SHOP PAGE
 * =========================================================
 */

export default function ShopPage() {
  /*
   * =======================================================
   * COLLECTION STRUCTURED DATA
   * =======================================================
   */

  const collectionSchema =
    {
      "@context":
        "https://schema.org",

      "@type":
        "CollectionPage",

      "@id":
        `${SHOP_URL}#collection`,

      name:
        "Krinay Medical Scrubs Collection",

      headline:
        SHOP_TITLE,

      description:
        SHOP_DESCRIPTION,

      url:
        SHOP_URL,

      inLanguage:
        "en-IN",

      isPartOf: {
        "@id":
          `${SITE_URL}/#website`,
      },

      about: [
        {
          "@type":
            "Thing",

          name:
            "Medical Scrubs",
        },

        {
          "@type":
            "Thing",

          name:
            "Healthcare Uniforms",
        },

        {
          "@type":
            "Thing",

          name:
            "Medical Apparel",
        },
      ],

      audience: [
        {
          "@type":
            "Audience",

          audienceType:
            "Doctors",
        },

        {
          "@type":
            "Audience",

          audienceType:
            "Nurses",
        },

        {
          "@type":
            "Audience",

          audienceType:
            "Medical Students",
        },

        {
          "@type":
            "Audience",

          audienceType:
            "Healthcare Professionals",
        },
      ],
    };

  /*
   * =======================================================
   * PRODUCT ITEM LIST SCHEMA
   * =======================================================
   *
   * Gives search engines a clear relationship between
   * the shop page and individual product pages.
   */

  const itemListSchema =
    {
      "@context":
        "https://schema.org",

      "@type":
        "ItemList",

      "@id":
        `${SHOP_URL}#products`,

      name:
        "Krinay Medical Scrubs",

      numberOfItems:
        products.length,

      itemListOrder:
        "https://schema.org/ItemListUnordered",

      itemListElement:
        products.map(
          (
            product,
            index,
          ) => ({
            "@type":
              "ListItem",

            position:
              index + 1,

            name:
              product.name,

            url:
              `${SITE_URL}/product/${product.slug}`,
          }),
        ),
    };

  /*
   * =======================================================
   * BREADCRUMB SCHEMA
   * =======================================================
   */

  const breadcrumbSchema =
    {
      "@context":
        "https://schema.org",

      "@type":
        "BreadcrumbList",

      "@id":
        `${SHOP_URL}#breadcrumb`,

      itemListElement: [
        {
          "@type":
            "ListItem",

          position:
            1,

          name:
            "Home",

          item:
            SITE_URL,
        },

        {
          "@type":
            "ListItem",

          position:
            2,

          name:
            "Shop Medical Scrubs",

          item:
            SHOP_URL,
        },
      ],
    };

  /*
   * =======================================================
   * FAQ SCHEMA
   * =======================================================
   *
   * These questions also appear visibly on the page.
   */

  const faqSchema =
    {
      "@context":
        "https://schema.org",

      "@type":
        "FAQPage",

      "@id":
        `${SHOP_URL}#faq`,

      mainEntity: [
        {
          "@type":
            "Question",

          name:
            "Who are Krinay medical scrubs designed for?",

          acceptedAnswer: {
            "@type":
              "Answer",

            text:
              "Krinay medical scrubs are designed for doctors, nurses, medical students and other healthcare professionals who need comfortable and professional workwear for clinical environments.",
          },
        },

        {
          "@type":
            "Question",

          name:
            "Does Krinay offer medical scrubs for both men and women?",

          acceptedAnswer: {
            "@type":
              "Answer",

            text:
              "Yes. Krinay offers dedicated medical scrub collections for men and women in multiple colours and sizes.",
          },
        },

        {
          "@type":
            "Question",

          name:
            "What are Krinay scrubs made from?",

          acceptedAnswer: {
            "@type":
              "Answer",

            text:
              "Krinay athletic scrubs use a 92% polyester and 8% Lycra fabric blend designed to provide comfort, stretch and ease of movement during long working shifts.",
          },
        },

        {
          "@type":
            "Question",

          name:
            "Can hospitals and clinics place bulk scrub orders?",

          acceptedAnswer: {
            "@type":
              "Answer",

            text:
              "Yes. Hospitals, clinics, medical institutes and healthcare teams can contact Krinay for bulk scrub and healthcare apparel requirements.",
          },
        },
      ],
    };

  return (
    <>
      {/*
       * ================================================
       * STRUCTURED DATA
       * ================================================
       */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              collectionSchema,
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              itemListSchema,
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema,
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              faqSchema,
            ),
        }}
      />

      {/*
       * ================================================
       * HERO
       * ================================================
       */}

      <section className="bg-[#922424] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex justify-center gap-2 text-sm text-white/70"
          >
            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <span>
              /
            </span>

            <span className="text-white">
              Shop
            </span>
          </nav>

          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            Krinay Scrubs
            Collection
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Shop Medical
            Scrubs
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            Comfortable,
            stretchable and
            professional
            medical scrubs
            designed for
            doctors, nurses,
            medical students
            and healthcare
            professionals.
          </p>
        </div>
      </section>

      {/*
       * ================================================
       * EXISTING SHOP
       * ================================================
       */}

      <Suspense
        fallback={
          <ShopLoading />
        }
      >
        <ShopClient
          products={
            products
          }
        />
      </Suspense>

      {/*
       * ================================================
       * SEO + GEO / AI CONTENT
       * ================================================
       *
       * Visible, useful content is better than hidden
       * keyword text.
       */}

      <section className="border-t border-[#eadada] bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
              Medical
              Workwear by
              Krinay
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Medical Scrubs
              Designed for
              Long Healthcare
              Shifts
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Krinay Scrubs
              provides medical
              scrub sets and
              healthcare
              workwear for
              doctors, nurses,
              medical students
              and healthcare
              professionals.
              Our athletic
              scrubs are
              designed around
              comfort,
              mobility and a
              professional
              appearance for
              demanding
              clinical
              environments.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-[#eadada] bg-[#fffafa] p-7">
              <h3 className="text-lg font-black text-slate-950">
                Scrubs for
                Doctors
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Professional
                medical scrub
                sets designed
                for doctors who
                need practical,
                comfortable
                workwear
                throughout
                consultations,
                rounds and long
                hospital
                shifts.
              </p>

              <Link
                href="/category/men"
                className="mt-5 inline-block text-sm font-bold text-[#922424] hover:underline"
              >
                Explore
                Men&apos;s
                Scrubs
              </Link>
            </article>

            <article className="rounded-3xl border border-[#eadada] bg-[#fffafa] p-7">
              <h3 className="text-lg font-black text-slate-950">
                Scrubs for
                Nurses &
                Healthcare
                Teams
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Flexible and
                functional
                healthcare
                uniforms
                suitable for
                nurses,
                technicians,
                clinical staff
                and healthcare
                professionals.
              </p>

              <Link
                href="/category/women"
                className="mt-5 inline-block text-sm font-bold text-[#922424] hover:underline"
              >
                Explore
                Women&apos;s
                Scrubs
              </Link>
            </article>

            <article className="rounded-3xl border border-[#eadada] bg-[#fffafa] p-7">
              <h3 className="text-lg font-black text-slate-950">
                Bulk Medical
                Uniform Orders
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Clinics,
                hospitals,
                medical
                institutes and
                healthcare
                organisations
                can contact
                Krinay for bulk
                medical scrub
                and healthcare
                apparel
                requirements.
              </p>

              <Link
                href="/bulk-order"
                className="mt-5 inline-block text-sm font-bold text-[#922424] hover:underline"
              >
                Request Bulk
                Order
              </Link>
            </article>
          </div>

          {/*
           * ============================================
           * FABRIC / PRODUCT INFORMATION
           * ============================================
           */}

          <div className="mt-14 rounded-3xl bg-[#922424] px-6 py-10 text-white sm:px-10">
            <h2 className="text-2xl font-black sm:text-3xl">
              Comfortable
              Stretch Fabric
              for Healthcare
              Professionals
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
              Krinay athletic
              medical scrubs
              use a blend of
              92% polyester
              and 8% Lycra.
              The fabric is
              designed to
              provide stretch,
              comfort and
              freedom of
              movement during
              long clinical
              shifts.
            </p>
          </div>

          {/*
           * ============================================
           * FAQ
           * ============================================
           */}

          <div className="mt-16">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
                Frequently
                Asked
                Questions
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                About Krinay
                Medical Scrubs
              </h2>
            </div>

            <div className="mt-8 space-y-4">
              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  Who are
                  Krinay
                  medical
                  scrubs
                  designed
                  for?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Krinay
                  medical
                  scrubs are
                  designed for
                  doctors,
                  nurses,
                  medical
                  students and
                  other
                  healthcare
                  professionals
                  who need
                  comfortable
                  and
                  professional
                  workwear for
                  clinical
                  environments.
                </p>
              </article>

              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  Does Krinay
                  offer scrubs
                  for both men
                  and women?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Yes. Krinay
                  offers
                  dedicated
                  medical
                  scrub
                  collections
                  for men and
                  women in
                  multiple
                  colours and
                  sizes.
                </p>
              </article>

              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  What are
                  Krinay
                  scrubs made
                  from?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Krinay
                  athletic
                  scrubs use a
                  92%
                  polyester
                  and 8% Lycra
                  fabric blend
                  designed to
                  provide
                  comfort,
                  stretch and
                  ease of
                  movement
                  during long
                  working
                  shifts.
                </p>
              </article>

              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  Can
                  hospitals
                  and clinics
                  place bulk
                  scrub
                  orders?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Yes.
                  Hospitals,
                  clinics,
                  medical
                  institutes
                  and
                  healthcare
                  teams can
                  contact
                  Krinay for
                  bulk scrub
                  and
                  healthcare
                  apparel
                  requirements.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/*
 * =========================================================
 * SHOP LOADING SKELETON
 * =========================================================
 */

function ShopLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="h-12 w-full animate-pulse rounded-full bg-[#f5dddd]" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden h-[500px] animate-pulse rounded-2xl bg-[#fff4f4] lg:block" />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length:
              6,
          }).map(
            (
              _,
              index,
            ) => (
              <div
                key={
                  index
                }
                className="h-[430px] animate-pulse rounded-2xl bg-[#fff4f4]"
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}