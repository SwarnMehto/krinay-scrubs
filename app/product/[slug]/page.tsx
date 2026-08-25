import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import {
  getProductBySlug,
  products,
} from "@/data/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product =
    getProductBySlug(slug);

  if (!product) {
    return {
      title:
        "Product Not Found | Krinay",
      description:
        "The requested Krinay product could not be found.",
    };
  }

  return {
    title: `${product.name} | Krinay Scrubs`,

    description:
      product.shortDescription,
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
      slug: product.slug,
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
  const { slug } = await params;

  const product =
    getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  /*
   * =======================================================
   * RELATED PRODUCTS
   * =======================================================
   */

  const relatedProducts =
    products
      .filter(
        (relatedProduct) =>
          relatedProduct.category ===
            product.category &&
          relatedProduct.id !==
            product.id,
      )
      .slice(0, 4);

  /*
   * Fallback:
   * If same category doesn't have enough products,
   * show other products.
   */

  const fallbackRelatedProducts =
    relatedProducts.length > 0
      ? relatedProducts
      : products
          .filter(
            (relatedProduct) =>
              relatedProduct.id !==
              product.id,
          )
          .slice(0, 4);

  /*
   * IMPORTANT:
   *
   * ProductDetailsClient uses client-only hooks
   * such as useSearchParams().
   *
   * Next.js 16 requires that component to be
   * rendered inside Suspense during prerendering.
   */

  return (
    <Suspense
      fallback={
        <ProductDetailsFallback />
      }
    >
      <ProductDetailsClient
        product={product}
        relatedProducts={
          fallbackRelatedProducts
        }
      />
    </Suspense>
  );
}