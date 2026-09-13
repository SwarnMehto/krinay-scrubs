import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import ProductDetailsClient from "@/components/product/ProductDetailsClient";

import {
  getProductBySlug,
  products,
} from "@/data/products";

/*
 * =========================================================
 * CONFIG
 * =========================================================
 */

const SITE_URL =
  "https://www.krinay.in";

const BRAND_NAME =
  "Krinay Scrubs";

/*
 * =========================================================
 * PAGE PROPS
 * =========================================================
 */

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function makeAbsoluteUrl(
  value?: string,
) {
  if (!value) {
    return undefined;
  }

  if (
    value.startsWith(
      "http://",
    ) ||
    value.startsWith(
      "https://",
    )
  ) {
    return value;
  }

  return `${SITE_URL}${
    value.startsWith("/")
      ? value
      : `/${value}`
  }`;
}

/*
 * =========================================================
 * PRODUCT METADATA
 * =========================================================
 */

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const product =
    getProductBySlug(
      slug,
    );

  if (!product) {
    return {
      title:
        "Product Not Found",

      description:
        "The requested Krinay product could not be found.",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  /*
   * Using a flexible object here keeps the SEO layer
   * compatible with current/future product fields.
   */

  const productData =
    product as any;

  const productUrl =
    `${SITE_URL}/product/${product.slug}`;

  /*
   * -----------------------------------------
   * DESCRIPTION
   * -----------------------------------------
   */

  const description =
    product.shortDescription ||
    productData.description ||
    `Shop ${product.name} by Krinay Scrubs. Premium medical apparel designed for doctors, nurses, medical students and healthcare professionals.`;

  /*
   * -----------------------------------------
   * PRODUCT IMAGE
   * -----------------------------------------
   */

  const rawImages: string[] =
    Array.isArray(
      productData.images,
    )
      ? productData.images
      : [];

  const primaryImage =
    rawImages[0] ||
    productData.image ||
    productData.thumbnail;

  const absoluteImage =
    makeAbsoluteUrl(
      primaryImage,
    );

  /*
   * -----------------------------------------
   * METADATA
   * -----------------------------------------
   */

  return {
    /*
     * Root layout already uses:
     *
     * %s | Krinay Scrubs
     *
     * so only product name is needed here.
     */

    title:
      product.name,

    description,

    /*
     * =======================================
     * CANONICAL
     * =======================================
     */

    alternates: {
      canonical:
        productUrl,
    },

    /*
     * =======================================
     * ROBOTS
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
        BRAND_NAME,

      url:
        productUrl,

      title:
        product.name,

      description,

      ...(absoluteImage
        ? {
            images: [
              {
                url:
                  absoluteImage,

                alt:
                  product.name,
              },
            ],
          }
        : {}),
    },

    /*
     * =======================================
     * TWITTER
     * =======================================
     */

    twitter: {
      card:
        "summary_large_image",

      title:
        product.name,

      description,

      ...(absoluteImage
        ? {
            images: [
              absoluteImage,
            ],
          }
        : {}),
    },
  };
}

/*
 * =========================================================
 * STATIC PRODUCT ROUTES
 * =========================================================
 */

export function generateStaticParams() {
  return products.map(
    (product) => ({
      slug:
        product.slug,
    }),
  );
}

/*
 * =========================================================
 * PRODUCT PAGE LOADING FALLBACK
 * =========================================================
 */

function ProductDetailsFallback() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">

          {/* IMAGE SKELETON */}

          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-100" />

          {/* DETAILS SKELETON */}

          <div className="py-4">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

            <div className="mt-5 h-10 w-4/5 animate-pulse rounded bg-slate-100" />

            <div className="mt-3 h-10 w-3/5 animate-pulse rounded bg-slate-100" />

            <div className="mt-8 h-8 w-36 animate-pulse rounded bg-slate-100" />

            <div className="mt-8 h-20 w-full animate-pulse rounded bg-slate-100" />

            <div className="mt-8 h-12 w-full animate-pulse rounded-full bg-slate-100" />
          </div>

        </div>
      </div>
    </main>
  );
}

/*
 * =========================================================
 * PRODUCT PAGE
 * =========================================================
 */

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } =
    await params;

  const product =
    getProductBySlug(
      slug,
    );

  if (!product) {
    notFound();
  }

  const productData =
    product as any;

  /*
   * =======================================================
   * PRODUCT URL
   * =======================================================
   */

  const productUrl =
    `${SITE_URL}/product/${product.slug}`;

  /*
   * =======================================================
   * PRODUCT DESCRIPTION
   * =======================================================
   */

  const productDescription =
    product.shortDescription ||
    productData.description ||
    `Shop ${product.name} by Krinay Scrubs. Premium medical apparel designed for healthcare professionals.`;

  /*
   * =======================================================
   * PRODUCT IMAGES
   * =======================================================
   */

  const rawImages: string[] =
    Array.isArray(
      productData.images,
    )
      ? productData.images
      : [];

  const fallbackImage =
    productData.image ||
    productData.thumbnail;

  const productImages =
    [
      ...rawImages,

      ...(fallbackImage &&
      !rawImages.includes(
        fallbackImage,
      )
        ? [
            fallbackImage,
          ]
        : []),
    ]
      .map(
        (image) =>
          makeAbsoluteUrl(
            image,
          ),
      )
      .filter(
        (
          image,
        ): image is string =>
          Boolean(
            image,
          ),
      );

  /*
   * =======================================================
   * PRODUCT PRICE
   * =======================================================
   */

  const productPrice =
    Number(
      productData.price ??
        productData.setPrice ??
        0,
    );

  /*
   * =======================================================
   * STOCK
   * =======================================================
   */

  const productInStock =
    productData.inStock !==
    false;

  /*
   * =======================================================
   * PRODUCT STRUCTURED DATA
   * =======================================================
   *
   * Google uses this information to better understand
   * product name, price, brand, availability and images.
   */

  const productSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "Product",

    "@id":
      `${productUrl}#product`,

    name:
      product.name,

    description:
      productDescription,

    url:
      productUrl,

    ...(productImages.length >
    0
      ? {
          image:
            productImages,
        }
      : {}),

    ...(productData.sku
      ? {
          sku:
            String(
              productData.sku,
            ),
        }
      : {}),

    brand: {
      "@type":
        "Brand",

      name:
        BRAND_NAME,
    },

    offers: {
      "@type":
        "Offer",

      url:
        productUrl,

      priceCurrency:
        "INR",

      price:
        productPrice,

      availability:
        productInStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",

      seller: {
        "@type":
          "Organization",

        name:
          BRAND_NAME,

        url:
          SITE_URL,
      },
    },
  };

  /*
   * =======================================================
   * BREADCRUMB STRUCTURED DATA
   * =======================================================
   */

  const breadcrumbSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

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
          "Shop",

        item:
          `${SITE_URL}/shop`,
      },

      {
        "@type":
          "ListItem",

        position:
          3,

        name:
          product.name,

        item:
          productUrl,
      },
    ],
  };

  /*
   * =======================================================
   * RELATED PRODUCTS
   * =======================================================
   */

  const relatedProducts =
    products
      .filter(
        (
          relatedProduct,
        ) =>
          relatedProduct.category ===
            product.category &&
          relatedProduct.id !==
            product.id,
      )
      .slice(
        0,
        4,
      );

  /*
   * Fallback:
   *
   * If same category doesn't have enough products,
   * show other products.
   */

  const fallbackRelatedProducts =
    relatedProducts.length > 0
      ? relatedProducts
      : products
          .filter(
            (
              relatedProduct,
            ) =>
              relatedProduct.id !==
              product.id,
          )
          .slice(
            0,
            4,
          );

  /*
   * =======================================================
   * PAGE OUTPUT
   * =======================================================
   */

  return (
    <>
      {/*
       * ================================================
       * GOOGLE PRODUCT SCHEMA
       * ================================================
       */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              productSchema,
            ),
        }}
      />

      {/*
       * ================================================
       * BREADCRUMB SCHEMA
       * ================================================
       */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema,
            ),
        }}
      />

      {/*
       * ================================================
       * EXISTING PRODUCT UI
       * ================================================
       *
       * ProductDetailsClient uses client-only hooks
       * such as useSearchParams().
       *
       * Next.js 16 requires that component to be
       * rendered inside Suspense during prerendering.
       */}

      <Suspense
        fallback={
          <ProductDetailsFallback />
        }
      >
        <ProductDetailsClient
          product={
            product
          }
          relatedProducts={
            fallbackRelatedProducts
          }
        />
      </Suspense>
    </>
  );
}