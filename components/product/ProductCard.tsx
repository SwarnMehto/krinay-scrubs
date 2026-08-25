"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Star,
} from "lucide-react";

import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

/*
 * =========================================================
 * COLOUR HEX
 * =========================================================
 */

const COLOR_HEX: Record<
  string,
  string
> = {
  Airforce: "#607d9d",
  "Airforce Blue": "#607d9d",

  "Royal Blue": "#1265d8",

  Black: "#111111",
  "Stealth Black": "#111111",

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

/*
 * =========================================================
 * DISPLAY COLOUR NAME
 * =========================================================
 */

function getDisplayColourName(
  color: string,
) {
  const normalized = color
    .trim()
    .toLowerCase();

  /*
   * Backend/data can still use:
   *
   * Black
   *
   * But customer sees:
   *
   * Stealth Black
   */

  if (normalized === "black") {
    return "Stealth Black";
  }

  /*
   * Backend/data can use:
   *
   * Airforce Blue
   *
   * Customer display:
   *
   * Airforce
   */

  if (
    normalized ===
    "airforce blue"
  ) {
    return "Airforce";
  }

  return color;
}

/*
 * =========================================================
 * STYLE LABEL
 * =========================================================
 */

function getStyleLabel(
  product: Product,
) {
  /*
   * Every currently LIVE scrub card:
   *
   * V-Neck Athletic Scrub
   */

  if (
    product.productType ===
      "scrub" &&
    product.inStock
  ) {
    return "V-Neck Athletic Scrub";
  }

  const searchable = [
    product.style ?? "",
    product.name ?? "",
    ...(product.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (
    searchable.includes(
      "mandarin",
    )
  ) {
    return "Mandarin Collar";
  }

  if (
    searchable.includes(
      "jogger",
    )
  ) {
    return "Jogger Scrub";
  }

  if (
    searchable.includes(
      "athletic",
    )
  ) {
    return "Athletic Scrub";
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
    return "V-Neck Scrub";
  }

  if (
    searchable.includes(
      "classic",
    )
  ) {
    return "Classic Scrub";
  }

  if (
    product.productType ===
    "lab-coat"
  ) {
    return "Lab Coat";
  }

  return (
    product.style ||
    "Krinay"
  );
}

/*
 * =========================================================
 * PRODUCT CARD
 * =========================================================
 */

export default function ProductCard({
  product,
}: ProductCardProps) {
  /*
   * =========================================================
   * PRODUCT IMAGES
   * =========================================================
   */

  const mainImage =
    product.images?.[0] ??
    product.image;

  const hoverImage =
    product.images?.[1] ??
    product.image;

  /*
   * =========================================================
   * PRICING
   * =========================================================
   */

  const sellingPrice =
    product.setPrice ??
    product.price;

  const originalPrice =
    product.setOriginalPrice ??
    product.originalPrice;

  const discount =
    product.discountPercent ??
    (originalPrice &&
    originalPrice >
      sellingPrice
      ? Math.round(
          ((originalPrice -
            sellingPrice) /
            originalPrice) *
            100,
        )
      : 0);

  /*
   * =========================================================
   * STYLE
   * =========================================================
   */

  const styleLabel =
    getStyleLabel(product);

  /*
   * =========================================================
   * AUTOMATIC BADGES
   * =========================================================
   *
   * IMPORTANT:
   *
   * Gender does NOT control badge.
   *
   * MEN can be:
   * NEW
   * BESTSELLER
   * BOTH
   *
   * WOMEN can be:
   * NEW
   * BESTSELLER
   * BOTH
   *
   * Control everything from:
   *
   * data/products.ts
   *
   * Example:
   *
   * isNewArrival: true,
   * isBestseller: false,
   *
   * → NEW
   *
   *
   * isNewArrival: false,
   * isBestseller: true,
   *
   * → BESTSELLER
   *
   *
   * isNewArrival: true,
   * isBestseller: true,
   *
   * → NEW + BESTSELLER
   */

  const displayBadges: string[] =
    [];

  if (
    product.isNewArrival
  ) {
    displayBadges.push("New");
  }

  if (
    product.isBestseller
  ) {
    displayBadges.push(
      "Bestseller",
    );
  }

  /*
   * Optional custom badge fallback.
   *
   * It is used only when product is
   * neither New nor Bestseller.
   */

  if (
    displayBadges.length === 0 &&
    product.badge
  ) {
    displayBadges.push(
      product.badge,
    );
  }

  /*
   * =========================================================
   * RATING
   * =========================================================
   *
   * Every live scrub:
   *
   * 5.0
   */

  const displayRating =
    product.productType ===
      "scrub" &&
    product.inStock
      ? 5
      : product.rating ?? 0;

  return (
    <article className="group w-full min-w-0 bg-white">
      {/* =====================================================
          PRODUCT IMAGE
      ===================================================== */}

      <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f3f2]">
        {/* ===================================================
            NEW / BESTSELLER BADGES
        =================================================== */}

        {product.inStock &&
          displayBadges.length >
            0 && (
            <div className="absolute left-3 top-3 z-30 flex flex-wrap gap-1.5">
              {displayBadges.map(
                (badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-[#922424] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>
          )}

        {/* ===================================================
            COMING SOON
        =================================================== */}

        {product.inStock &&
  displayBadges.length > 0 && (
    <div className="absolute left-3 top-3 z-30 flex flex-wrap gap-1.5">
      {displayBadges.map((badge) => (
        <span
          key={badge}
          className="rounded-full bg-[#922424] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
        >
          {badge}
        </span>
      ))}
    </div>
  )}

        {/* ===================================================
            WISHLIST
        =================================================== */}

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:text-[#922424]"
        >
          <Heart size={18} />
        </button>

        {/* ===================================================
            PRODUCT LINK
        =================================================== */}

        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="relative block h-full w-full"
        >
          {/* =================================================
              FRONT IMAGE
          ================================================= */}

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
              group-hover:scale-[1.02]
              group-hover:opacity-0
            "
          />

          {/* =================================================
              BACK / HOVER IMAGE
          ================================================= */}

          {hoverImage !==
            mainImage && (
            <Image
              src={hoverImage}
              alt={`${product.name} alternate view`}
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
                group-hover:opacity-100
              "
            />
          )}

          {/* =================================================
              DISCOUNT
          ================================================= */}

          {discount > 0 &&
            product.inStock && (
              <span className="absolute bottom-3 left-3 z-30 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white">
                {discount}% OFF
              </span>
            )}
        </Link>
      </div>

      {/* =====================================================
          PRODUCT INFORMATION
      ===================================================== */}

      <div className="pt-3">
        {/* ===================================================
            STYLE + RATING
        =================================================== */}

        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-medium text-slate-500 underline decoration-slate-400 underline-offset-2">
            {styleLabel}
          </span>

          {displayRating >
            0 && (
            <div className="flex items-center gap-1">
              <Star
                size={13}
                fill="currentColor"
                className="text-[#ff8178]"
              />

              <span className="text-[12px] font-medium text-[#ff8178]">
                {displayRating.toFixed(
                  1,
                )}
              </span>
            </div>
          )}
        </div>

        {/* ===================================================
            PRODUCT NAME
        =================================================== */}

        <Link
          href={`/product/${product.slug}`}
          className="block"
        >
          <h3 className="mt-2 line-clamp-2 min-h-[48px] text-[16px] font-medium leading-6 text-[#343434] transition group-hover:text-[#922424]">
            {product.name}
          </h3>
        </Link>

        {/* ===================================================
            PRICE
        =================================================== */}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[17px] font-semibold text-slate-900">
            ₹
            {sellingPrice.toLocaleString(
              "en-IN",
            )}
          </span>

          {originalPrice &&
            originalPrice >
              sellingPrice && (
              <span className="text-[12px] text-slate-400 line-through">
                ₹
                {originalPrice.toLocaleString(
                  "en-IN",
                )}
              </span>
            )}
        </div>

        <p className="mt-0.5 text-[10px] text-slate-400">
          (*Incl. of taxes)
        </p>

        {/* ===================================================
            COLOUR DOTS
        =================================================== */}

        {product.colors?.length >
          0 && (
          <div className="mt-4 flex min-h-[24px] flex-wrap items-center gap-2">
            {product.colors
              .slice(0, 5)
              .map((color) => {
                const hex =
                  COLOR_HEX[
                    color
                  ] ??
                  "#cbd5e1";

                const displayName =
                  getDisplayColourName(
                    color,
                  );

                return (
                  <span
                    key={color}
                    title={
                      displayName
                    }
                    aria-label={
                      displayName
                    }
                    className="flex h-[21px] w-[21px] items-center justify-center rounded-full border border-slate-400 bg-white"
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
                  .length - 5}{" "}
                more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}