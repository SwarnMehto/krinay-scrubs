"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

import type { Product } from "@/types/product";

type CollectionProductCardProps = {
  product: Product;
};

const COLOR_HEX: Record<string, string> = {
  "Airforce Blue": "#607d9d",
  "Royal Blue": "#1265d8",
  Black: "#111111",

  Navy: "#082f59",
  Wine: "#5b2438",
  Maroon: "#7f1d2d",

  "Forest Green": "#315b49",
  "Ceil Blue": "#78bce4",
  "Heather Grey": "#64748b",
  "Galaxy Blue": "#0969b6",
  Olive: "#64755f",
  "Steel Grey": "#515866",
  "Pastel Lilac": "#b7a2da",
  Eucalyptus: "#789a8d",

  White: "#ffffff",
};

export default function CollectionProductCard({
  product,
}: CollectionProductCardProps) {
  /*
   * Main image:
   * 01-full-front.jpg
   *
   * Hover image:
   * 02-full-back.jpg
   */
  const mainImage =
    product.images?.[0] ||
    product.image;

  const hoverImage =
    product.images?.[1] ||
    product.image;

  const sellingPrice =
    product.setPrice ??
    product.price;

  const originalPrice =
    product.setOriginalPrice ??
    product.originalPrice;

  const styleLabel = (() => {
    const searchable = [
      product.style,
      ...(product.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    if (
      searchable.includes(
        "mandarin",
      )
    ) {
      return "Mandarin";
    }

    if (
      searchable.includes(
        "jogger",
      )
    ) {
      return "Jogger";
    }

    if (
      searchable.includes(
        "athletic",
      )
    ) {
      return "Athletic";
    }

    if (
      searchable.includes(
        "ecoflex",
      )
    ) {
      return "Ecoflex";
    }

    if (
      searchable.includes(
        "v-neck",
      )
    ) {
      return "V-Neck";
    }

    return "Classic";
  })();

  return (
    <article className="group w-full min-w-0 bg-white">
      {/* ========================================
          IMAGE AREA
      ======================================== */}

      <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f3f2]">
        {/* BADGE */}

        {product.badge &&
          product.inStock && (
            <span className="absolute left-3 top-3 z-30 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-600 shadow-sm">
              {product.badge}
            </span>
          )}

        {/* COMING SOON */}

        {!product.inStock && (
          <span className="absolute left-3 top-3 z-30 rounded-full bg-[#922424] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
            Coming Soon
          </span>
        )}

        {/* WISHLIST */}

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:text-[#922424]"
        >
          <Heart
            size={18}
          />
        </button>

        {/* CLICK PRODUCT */}

        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="relative block h-full w-full"
        >
          {/* FRONT IMAGE */}

          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="
              (max-width: 640px) 50vw,
              (max-width: 1024px) 33vw,
              25vw
            "
            className="
              object-cover
              object-top
              opacity-100
              transition-all
              duration-500
              ease-in-out
              group-hover:scale-[1.015]
              group-hover:opacity-0
            "
          />

          {/* SECOND / HOVER IMAGE */}

          {hoverImage !==
            mainImage && (
            <Image
              src={hoverImage}
              alt={`${product.name} back view`}
              fill
              sizes="
                (max-width: 640px) 50vw,
                (max-width: 1024px) 33vw,
                25vw
              "
              className="
                object-cover
                object-top
                opacity-0
                transition-all
                duration-500
                ease-in-out
                group-hover:scale-100
                group-hover:opacity-100
              "
            />
          )}
        </Link>
      </div>

      {/* ========================================
          PRODUCT INFO
      ======================================== */}

      <div className="pt-3">
        {/* STYLE + RATING */}

        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium text-slate-500 underline decoration-slate-400 underline-offset-2">
            {styleLabel}
          </span>

          {product.rating >
            0 && (
            <div className="flex items-center gap-1">
              <Star
                size={13}
                fill="currentColor"
                className="text-[#ff8178]"
              />

              <span className="text-[12px] font-medium text-[#ff8178]">
                {product.rating}
              </span>
            </div>
          )}
        </div>

        {/* PRODUCT NAME */}

        <Link
          href={`/product/${product.slug}`}
          className="block"
        >
          <h3 className="mt-2 min-h-[48px] line-clamp-2 text-[16px] font-medium leading-6 text-[#343434] transition group-hover:text-[#922424]">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[17px] font-medium text-slate-900">
            ₹{" "}
            {sellingPrice.toLocaleString(
              "en-IN",
            )}
          </span>

          {originalPrice &&
            originalPrice >
              sellingPrice && (
              <span className="text-[12px] text-slate-400 line-through">
                ₹{" "}
                {originalPrice.toLocaleString(
                  "en-IN",
                )}
              </span>
            )}
        </div>

        <p className="mt-0.5 text-[10px] text-slate-400">
          (*Incl. of taxes)
        </p>

        {/* ========================================
            SMALL COLOUR DOTS ONLY
            NO TEXT PILLS
            NO SET/TOP/BOTTOM
            NO BUTTON
        ======================================== */}

        <div className="mt-4 flex min-h-[24px] flex-wrap items-center gap-2">
          {product.colors
            .slice(0, 5)
            .map((color) => {
              const hex =
                COLOR_HEX[
                  color
                ] ??
                "#cbd5e1";

              return (
                <span
                  key={color}
                  title={color}
                  className="
                    flex
                    h-[21px]
                    w-[21px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-400
                    bg-white
                  "
                >
                  <span
                    className="h-[15px] w-[15px] rounded-full"
                    style={{
                      backgroundColor:
                        hex,
                    }}
                  />
                </span>
              );
            })}

          {product.colors.length >
            5 && (
            <span className="text-[13px] text-slate-400">
              +
              {product.colors
                .length -
                5}{" "}
              more
            </span>
          )}
        </div>
      </div>
    </article>
  );
}