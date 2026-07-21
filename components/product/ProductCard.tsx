"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  const { addToCart } = useCart();

  const discount =
    product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100,
        )
      : 0;

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }

    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0];

    if (!defaultSize || !defaultColor) {
      toast.error("Product options are unavailable");
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });

    toast.success("Added to cart");
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100">
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#922424] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={() =>
            setWishlisted((current) => !current)
          }
          className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white text-slate-700 hover:text-red-500"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart
            size={19}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        <Link
          href={`/product/${product.slug}`}
          className="flex h-full items-center justify-center p-8"
        >
          <div className="text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white/80 text-6xl shadow-sm">
              🥼
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Product Image
            </p>
          </div>
        </Link>

        {!product.inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 py-3 text-center text-xs font-bold uppercase tracking-wider text-white">
            Out of stock
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#922424]">
          {product.category}
        </p>

        <Link href={`/product/${product.slug}`}>
          <h2 className="mt-2 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 transition group-hover:text-[#922424]">
            {product.name}
          </h2>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={15} fill="currentColor" />

            <span className="text-sm font-bold text-slate-700">
              {product.rating}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            ({product.reviewCount} reviews)
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xl font-black text-slate-950">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              ₹
              {product.originalPrice.toLocaleString(
                "en-IN",
              )}
            </span>
          )}

          {discount > 0 && (
            <span className="text-xs font-bold text-emerald-600">
              {discount}% OFF
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#922424] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingBag size={18} />

          {product.inStock
            ? "Add to Cart"
            : "Out of Stock"}
        </button>
      </div>
    </article>
  );
}