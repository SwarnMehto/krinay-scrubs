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
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description:
      product.shortDescription,
  };
}

export function generateStaticParams() {
  return products.map(
    (product) => ({
      slug: product.slug,
    }),
  );
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product =
    getProductBySlug(slug);

  if (!product) {
    notFound();
  }

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

  return (
    <Suspense
      fallback={
        <section className="min-h-[70vh] bg-white px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-100" />

              <div className="space-y-5 pt-6">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

                <div className="h-10 w-3/4 animate-pulse rounded bg-slate-100" />

                <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />

                <div className="h-20 w-full animate-pulse rounded bg-slate-100" />

                <div className="h-12 w-full animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </section>
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