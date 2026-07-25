import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://krinay.in";

const contactPageUrl = `${siteUrl}/contact`;

export const metadata: Metadata = {
  title:
    "Contact Krinay Scrubs | Product, Order & Bulk Enquiries",

  description:
    "Contact Krinay Scrubs for medical scrub sizing, product information, order support, delivery assistance, returns and hospital or clinic bulk orders in India.",

  keywords: [
    "contact Krinay Scrubs",
    "Krinay customer support",
    "medical scrubs contact India",
    "scrubs bulk order Delhi",
    "hospital uniform supplier Delhi",
    "doctor scrubs customer support",
    "nursing scrubs bulk order",
    "medical uniform enquiry",
    "Krinay order support",
  ],

  alternates: {
    canonical: contactPageUrl,
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: contactPageUrl,
    siteName: "Krinay Scrubs",

    title:
      "Contact Krinay Scrubs | Customer Support",

    description:
      "Get assistance with Krinay products, sizing, orders, delivery, returns and healthcare-team bulk purchases.",

    images: [
      {
        url: `${siteUrl}/og-contact.jpg`,
        width: 1200,
        height: 630,
        alt:
          "Contact Krinay Scrubs for product, order and bulk purchase support",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Contact Krinay Scrubs | Customer Support",

    description:
      "Contact Krinay for product, size, order, delivery and bulk-order assistance.",

    images: [`${siteUrl}/og-contact.jpg`],
  },

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
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",

  "@id": `${siteUrl}/#organization`,

  name: "Krinay Scrubs",

  alternateName: "Krinay",

  url: siteUrl,

  logo: `${siteUrl}/logo.png`,

  email: "contact@krinay.in",

  telephone: "+91-85860-83877",

  description:
    "Krinay is an Indian medical apparel brand offering comfortable and professional scrubs, medical uniforms and team bulk-order solutions for healthcare professionals.",

  address: {
    "@type": "PostalAddress",

    streetAddress:
      "First Floor, Plot No. 63, Harsh Vihar, Pitampura",

    addressLocality: "Delhi",

    addressRegion: "Delhi",

    postalCode: "110034",

    addressCountry: "IN",
  },

  contactPoint: [
    {
      "@type": "ContactPoint",

      telephone: "+91-85860-83877",

      contactType: "customer support",

      email: "contact@krinay.in",

      areaServed: "IN",

      availableLanguage: [
        "English",
        "Hindi",
      ],
    },

    {
      "@type": "ContactPoint",

      telephone: "+91-85860-83877",

      contactType: "sales",

      email: "contact@krinay.in",

      areaServed: "IN",

      availableLanguage: [
        "English",
        "Hindi",
      ],
    },
  ],

  sameAs: [
    // Actual Instagram URL milne ke baad uncomment karo:
    // "https://www.instagram.com/krinay",
  ],
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",

  "@id": `${contactPageUrl}/#webpage`,

  url: contactPageUrl,

  name: "Contact Krinay Scrubs",

  description:
    "Contact Krinay Scrubs for product, sizing, order, delivery, return and bulk-order assistance.",

  isPartOf: {
    "@type": "WebSite",

    "@id": `${siteUrl}/#website`,

    url: siteUrl,

    name: "Krinay Scrubs",
  },

  about: {
    "@id": `${siteUrl}/#organization`,
  },

  mainEntity: {
    "@id": `${siteUrl}/#organization`,
  },

  inLanguage: "en-IN",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",

  itemListElement: [
    {
      "@type": "ListItem",

      position: 1,

      name: "Home",

      item: siteUrl,
    },

    {
      "@type": "ListItem",

      position: 2,

      name: "Contact Us",

      item: contactPageUrl,
    },
  ],
};

function safeJsonLd(data: object) {
  return JSON.stringify(data).replace(
    /</g,
    "\\u003c",
  );
}

export default function ContactLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            organizationSchema,
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            contactPageSchema,
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbSchema,
          ),
        }}
      />

      {children}
    </>
  );
}