import type { Metadata } from "next";
import Link from "next/link";

import HomePageClient from "@/components/home/HomePageClient";

/*
 * =========================================================
 * SITE CONFIG
 * =========================================================
 */

const SITE_URL = "https://www.krinay.in";

const SITE_NAME = "Krinay Scrubs";

const PAGE_TITLE =
  "Premium Medical Scrubs for Doctors, Nurses & Healthcare Professionals";

const PAGE_DESCRIPTION =
  "Shop Krinay medical scrubs for doctors, nurses, medical students and healthcare professionals. Discover comfortable, stretchable and professional men's and women's scrub sets designed for long healthcare shifts.";

/*
 * =========================================================
 * HOMEPAGE SEO METADATA
 * =========================================================
 *
 * IMPORTANT:
 * Root layout already has:
 *
 * title template: %s | Krinay Scrubs
 *
 * So do NOT manually add "| Krinay Scrubs"
 * to the title below.
 */

export const metadata: Metadata = {
  title: PAGE_TITLE,

  description: PAGE_DESCRIPTION,

  applicationName: SITE_NAME,

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,

  publisher: SITE_NAME,

  category: "Medical Apparel",

  keywords: [
    "medical scrubs",
    "medical scrubs India",
    "Krinay Scrubs",
    "doctor scrubs",
    "nurse scrubs",
    "hospital scrubs",
    "medical scrub sets",
    "scrub suits",
    "healthcare uniforms",
    "hospital uniforms",
    "medical uniforms India",
    "scrubs for doctors",
    "scrubs for nurses",
    "scrubs for medical students",
    "men medical scrubs",
    "women medical scrubs",
    "professional medical scrubs",
    "stretchable medical scrubs",
    "healthcare workwear",
  ],

  /*
   * =======================================================
   * CANONICAL
   * =======================================================
   */

  alternates: {
    canonical: SITE_URL,
  },

  /*
   * =======================================================
   * ROBOTS
   * =======================================================
   */

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview": "large",

      "max-snippet": -1,

      "max-video-preview": -1,
    },
  },

  /*
   * =======================================================
   * OPEN GRAPH
   * =======================================================
   */

  openGraph: {
    type: "website",

    locale: "en_IN",

    url: SITE_URL,

    siteName: SITE_NAME,

    title: PAGE_TITLE,

    description: PAGE_DESCRIPTION,
  },

  /*
   * =======================================================
   * TWITTER / SOCIAL
   * =======================================================
   */

  twitter: {
    card: "summary_large_image",

    title: PAGE_TITLE,

    description: PAGE_DESCRIPTION,
  },
};

/*
 * =========================================================
 * SAFE JSON-LD
 * =========================================================
 */

function jsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/*
 * =========================================================
 * HOMEPAGE
 * =========================================================
 */

export default function HomePage() {
  /*
   * =======================================================
   * ORGANIZATION ENTITY
   * =======================================================
   *
   * This establishes:
   *
   * Krinay Scrubs
   *      ↓
   * Medical Apparel Brand
   *      ↓
   * Medical Scrubs / Healthcare Workwear
   *
   * Using a stable @id allows other schemas across the
   * website to reference the same brand entity.
   */

  const organizationSchema = {
    "@context": "https://schema.org",

    "@type": "Organization",

    "@id": `${SITE_URL}/#organization`,

    name: SITE_NAME,

    alternateName: "Krinay",

    url: SITE_URL,

    description:
      "Krinay Scrubs is a medical apparel brand offering professional medical scrubs and healthcare workwear for doctors, nurses, medical students and healthcare professionals.",

    knowsAbout: [
      "Medical Scrubs",
      "Healthcare Uniforms",
      "Medical Apparel",
      "Hospital Workwear",
      "Scrub Sets",
      "Lab Coats",
    ],
  };

  /*
   * =======================================================
   * WEBSITE ENTITY
   * =======================================================
   */

  const websiteSchema = {
    "@context": "https://schema.org",

    "@type": "WebSite",

    "@id": `${SITE_URL}/#website`,

    url: SITE_URL,

    name: SITE_NAME,

    alternateName: "Krinay",

    description: PAGE_DESCRIPTION,

    inLanguage: "en-IN",

    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  /*
   * =======================================================
   * HOMEPAGE ENTITY
   * =======================================================
   */

  const webPageSchema = {
    "@context": "https://schema.org",

    "@type": "WebPage",

    "@id": `${SITE_URL}/#webpage`,

    url: SITE_URL,

    name: PAGE_TITLE,

    description: PAGE_DESCRIPTION,

    inLanguage: "en-IN",

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    about: {
      "@id": `${SITE_URL}/#organization`,
    },

    primaryImageOfPage: undefined,

    breadcrumb: {
      "@id": `${SITE_URL}/#breadcrumb`,
    },
  };

  /*
   * Remove undefined properties before output.
   */

  const cleanWebPageSchema = JSON.parse(
    JSON.stringify(webPageSchema),
  );

  /*
   * =======================================================
   * BREADCRUMB
   * =======================================================
   */

  const breadcrumbSchema = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    "@id": `${SITE_URL}/#breadcrumb`,

    itemListElement: [
      {
        "@type": "ListItem",

        position: 1,

        name: "Home",

        item: SITE_URL,
      },
    ],
  };

  return (
    <>
      {/*
       * ===================================================
       * STRUCTURED DATA
       * ===================================================
       */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(organizationSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(websiteSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(cleanWebPageSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbSchema),
        }}
      />

      {/*
       * ===================================================
       * EXISTING HOMEPAGE UI
       * ===================================================
       *
       * No changes to your existing HomePageClient.
       */}

      <HomePageClient />

      {/*
       * ===================================================
       * SEO + GEO + AI ENTITY CONTENT
       * ===================================================
       *
       * This content is visible to both users and crawlers.
       * Do not hide SEO content with display:none.
       */}

      <section className="border-t border-[#eadada] bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
              Krinay Medical
              Workwear
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Medical Scrubs
              Designed for
              Healthcare
              Professionals
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Krinay Scrubs
              is a medical
              apparel brand
              offering
              professional
              medical scrubs
              and healthcare
              workwear for
              doctors, nurses,
              medical students
              and healthcare
              professionals.
              Krinay scrubs
              are designed for
              comfort,
              flexibility and
              professional
              appearance
              during long
              clinical and
              hospital shifts.
            </p>
          </div>

          {/*
           * =================================================
           * BRAND FACTS
           * =================================================
           */}

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-[#eadada] bg-[#fffafa] p-7">
              <h3 className="text-lg font-black text-slate-950">
                Athletic
                Medical
                Scrubs
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Krinay
                athletic
                scrubs are
                created for
                healthcare
                professionals
                who need
                comfort and
                ease of
                movement
                throughout
                demanding
                workdays.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-flex font-bold text-[#922424] transition hover:underline"
              >
                Shop Medical
                Scrubs →
              </Link>
            </article>

            <article className="rounded-3xl border border-[#eadada] bg-[#fffafa] p-7">
              <h3 className="text-lg font-black text-slate-950">
                92%
                Polyester +
                8% Lycra
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Krinay
                athletic
                medical
                scrubs use a
                92%
                polyester and
                8% Lycra
                fabric blend
                designed to
                provide
                stretch,
                comfort and
                mobility
                during long
                healthcare
                shifts.
              </p>
            </article>

            <article className="rounded-3xl border border-[#eadada] bg-[#fffafa] p-7">
              <h3 className="text-lg font-black text-slate-950">
                For
                Healthcare
                Professionals
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Krinay
                medical
                workwear is
                intended for
                doctors,
                nurses,
                medical
                students,
                technicians
                and other
                professionals
                working in
                healthcare
                environments.
              </p>
            </article>
          </div>

          {/*
           * =================================================
           * INTERNAL LINKING
           * =================================================
           */}

          <div className="mt-16">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
                Explore
                Krinay
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Shop
                Healthcare
                Workwear by
                Collection
              </h2>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/category/men"
                className="group rounded-3xl border border-[#eadada] p-6 transition hover:border-[#922424]"
              >
                <h3 className="font-black text-slate-950 transition group-hover:text-[#922424]">
                  Men&apos;s
                  Medical
                  Scrubs
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore
                  professional
                  medical scrub
                  sets for men.
                </p>

                <span className="mt-4 inline-block text-sm font-bold text-[#922424]">
                  View
                  Collection →
                </span>
              </Link>

              <Link
                href="/category/women"
                className="group rounded-3xl border border-[#eadada] p-6 transition hover:border-[#922424]"
              >
                <h3 className="font-black text-slate-950 transition group-hover:text-[#922424]">
                  Women&apos;s
                  Medical
                  Scrubs
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore
                  comfortable
                  medical scrub
                  sets for
                  women.
                </p>

                <span className="mt-4 inline-block text-sm font-bold text-[#922424]">
                  View
                  Collection →
                </span>
              </Link>

              <Link
                href="/category/lab-coats"
                className="group rounded-3xl border border-[#eadada] p-6 transition hover:border-[#922424]"
              >
                <h3 className="font-black text-slate-950 transition group-hover:text-[#922424]">
                  Medical Lab
                  Coats
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Discover
                  professional
                  lab coats for
                  doctors and
                  medical
                  students.
                </p>

                <span className="mt-4 inline-block text-sm font-bold text-[#922424]">
                  Explore Lab
                  Coats →
                </span>
              </Link>

              <Link
                href="/bulk-order"
                className="group rounded-3xl border border-[#eadada] p-6 transition hover:border-[#922424]"
              >
                <h3 className="font-black text-slate-950 transition group-hover:text-[#922424]">
                  Bulk
                  Healthcare
                  Orders
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Medical
                  institutes,
                  clinics and
                  healthcare
                  teams can
                  contact
                  Krinay for
                  bulk
                  requirements.
                </p>

                <span className="mt-4 inline-block text-sm font-bold text-[#922424]">
                  Bulk Order →
                </span>
              </Link>
            </div>
          </div>

          {/*
           * =================================================
           * AI / GEO FRIENDLY Q&A
           * =================================================
           */}

          <div className="mt-16">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
                About Krinay
                Scrubs
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Medical
                Scrubs for
                Modern
                Healthcare
              </h2>
            </div>

            <div className="mx-auto mt-9 max-w-4xl space-y-4">
              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  What is
                  Krinay
                  Scrubs?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Krinay
                  Scrubs is a
                  medical
                  apparel
                  brand
                  focused on
                  professional
                  scrubs and
                  healthcare
                  workwear for
                  doctors,
                  nurses,
                  medical
                  students and
                  other
                  healthcare
                  professionals.
                </p>
              </article>

              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  Who can
                  wear Krinay
                  medical
                  scrubs?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Krinay
                  medical
                  scrubs are
                  suitable for
                  doctors,
                  nurses,
                  medical
                  students,
                  technicians
                  and other
                  healthcare
                  professionals
                  who require
                  practical
                  clinical
                  workwear.
                </p>
              </article>

              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  What fabric
                  is used in
                  Krinay
                  athletic
                  scrubs?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Krinay
                  athletic
                  scrubs use
                  a blend of
                  92%
                  polyester
                  and 8%
                  Lycra,
                  providing
                  stretch and
                  comfortable
                  movement for
                  healthcare
                  professionals.
                </p>
              </article>

              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  Does Krinay
                  offer
                  scrubs for
                  men and
                  women?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Yes. Krinay
                  offers
                  dedicated
                  medical
                  scrub
                  collections
                  for men and
                  women, with
                  multiple
                  colours and
                  size
                  options.
                </p>
              </article>

              <article className="rounded-2xl border border-[#eadada] p-6">
                <h3 className="font-black text-slate-950">
                  Can clinics,
                  hospitals
                  and medical
                  institutes
                  order in
                  bulk?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Krinay
                  provides a
                  bulk-order
                  enquiry
                  option for
                  clinics,
                  hospitals,
                  medical
                  institutes
                  and
                  healthcare
                  teams that
                  require
                  multiple
                  medical
                  uniforms.
                </p>

                <Link
                  href="/bulk-order"
                  className="mt-4 inline-block text-sm font-bold text-[#922424] hover:underline"
                >
                  Enquire
                  About Bulk
                  Orders →
                </Link>
              </article>
            </div>
          </div>

          {/*
           * =================================================
           * SUPPORTING INTERNAL LINKS
           * =================================================
           */}

          <div className="mt-16 border-t border-[#eadada] pt-10">
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-4 text-sm font-bold">
              <Link
                href="/shop"
                className="text-slate-700 transition hover:text-[#922424]"
              >
                Shop Medical
                Scrubs
              </Link>

              <Link
                href="/category/men"
                className="text-slate-700 transition hover:text-[#922424]"
              >
                Men&apos;s
                Scrubs
              </Link>

              <Link
                href="/category/women"
                className="text-slate-700 transition hover:text-[#922424]"
              >
                Women&apos;s
                Scrubs
              </Link>

              <Link
                href="/category/lab-coats"
                className="text-slate-700 transition hover:text-[#922424]"
              >
                Lab Coats
              </Link>

              <Link
                href="/about"
                className="text-slate-700 transition hover:text-[#922424]"
              >
                About Krinay
              </Link>

              <Link
                href="/bulk-order"
                className="text-slate-700 transition hover:text-[#922424]"
              >
                Bulk Orders
              </Link>

              <Link
                href="/contact"
                className="text-slate-700 transition hover:text-[#922424]"
              >
                Contact
                Krinay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}