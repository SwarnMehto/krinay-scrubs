import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import { getProductBySlug, products } from "@/data/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter(
      (relatedProduct) =>
        relatedProduct.category === product.category &&
        relatedProduct.id !== product.id,
    )
    .slice(0, 4);

  const fallbackRelatedProducts =
    relatedProducts.length > 0
      ? relatedProducts
      : products
          .filter((relatedProduct) => relatedProduct.id !== product.id)
          .slice(0, 4);

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={fallbackRelatedProducts}
    />
  );
}