"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const {
    isWishlisted,
    toggleWishlist,
  } = useWishlist();

  const wishlisted =
    isWishlisted(product.id);

  const discount =
    product.discountPercent ??
    (product.originalPrice &&
    product.originalPrice >
      product.price
      ? Math.round(
          ((product.originalPrice -
            product.price) /
            product.originalPrice) *
            100,
        )
      : 0);

  const handleWishlist =
    async () => {
      const added =
        await toggleWishlist(
          product.id,
        );

      toast.success(
        added
          ? "Added to wishlist"
          : "Removed from wishlist",
      );
    };

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        {product.badge && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-[#922424] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}

        {discount > 0 && (
          <span className="absolute bottom-3 left-3 z-20 rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-black text-white">
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition ${
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white text-slate-700 hover:text-red-500"
          }`}
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={19}
            fill={
              wishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <Link
          href={`/product/${product.slug}`}
          className="relative block h-full w-full"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        {!product.inStock && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-black/80 px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-white">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#922424]">
          {product.gender} ·{" "}
          {product.productType ===
          "scrub"
            ? "Medical Scrubs"
            : "Lab Coat"}
        </p>

        <Link
          href={`/product/${product.slug}`}
        >
          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-slate-950 transition hover:text-[#922424]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <Star
            size={15}
            fill="currentColor"
            className="text-amber-400"
          />

          <span className="text-sm font-bold text-slate-800">
            {product.rating}
          </span>

          <span className="text-xs text-slate-400">
            ({product.reviewCount})
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-xl font-black text-slate-950">
            ₹
            {product.price.toLocaleString(
              "en-IN",
            )}
          </span>

          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              ₹
              {product.originalPrice.toLocaleString(
                "en-IN",
              )}
            </span>
          )}
        </div>

        {product.purchaseOptions && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-slate-400">
                Top
              </p>

              <p className="mt-0.5 font-black text-slate-900">
                ₹
                {(
                  product.topPrice ??
                  722
                ).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-slate-400">
                Bottom
              </p>

              <p className="mt-0.5 font-black text-slate-900">
                ₹
                {(
                  product.bottomPrice ??
                  723
                ).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {product.colors
            .slice(0, 3)
            .map((color) => (
              <span
                key={color}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600"
              >
                {color}
              </span>
            ))}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#701a1a]"
        >
          <ShoppingBag size={17} />
          Select Options
        </Link>
      </div>
    </article>
  );
}