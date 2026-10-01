"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

/* =========================================================
   PRODUCT COLOUR MAP
   ========================================================= */

const COLOR_HEX: Record<string, string> = {
  Airforce: "#607d9d",
  "Airforce Blue": "#607d9d",

  "Royal Blue": "#1265d8",

  Black: "#111111",
  "Stealth Black": "#111111",

  Navy: "#082f59",

  /* NEW / SUPPORTED */
  Wine: "#5b2438",

  Maroon: "#7f1d2d",

  "Forest Green": "#315b49",

  "Ceil Blue": "#78bce4",

  "Heather Grey": "#64748b",

  "Galaxy Blue": "#0969b6",

  /* NEW / SUPPORTED */
  Olive: "#64755f",

  "Steel Grey": "#515866",

  "Pastel Lilac": "#b7a2da",

  Eucalyptus: "#789a8d",

  White: "#ffffff",
};

/* =========================================================
   SCRUB COLOUR VARIANTS
   =========================================================
   Every live Men/Women scrub card shows all 5 available
   colour variants. Clicking a dot opens that exact colour's
   product page.
   ========================================================= */

const SCRUB_VARIANT_COLOURS = [
  "Airforce Blue",
  "Royal Blue",
  "Black",
  "Wine",
  "Olive",
] as const;

const SCRUB_VARIANT_SLUGS: Record<
  "Men" | "Women",
  Record<string, string>
> = {
  Men: {
    "Airforce Blue":
      "mens-athletic-scrub-set-airforce-blue",
    "Royal Blue":
      "mens-athletic-scrub-set-royal-blue",
    Black:
      "mens-athletic-scrub-set-black",
    Wine:
      "mens-athletic-scrub-set-wine",
    Olive:
      "mens-athletic-scrub-set-mediterranean-olive",
  },

  Women: {
    "Airforce Blue":
      "womens-athletic-scrub-set-airforce-blue",
    "Royal Blue":
      "womens-athletic-scrub-set-royal-blue",
    Black:
      "womens-athletic-scrub-set-black",
    Wine:
      "womens-athletic-scrub-set-wine",
    Olive:
      "womens-athletic-scrub-set-mediterranean-olive",
  },
};

function getScrubVariantSlug(
  product: Product,
  color: string,
) {
  if (
    product.productType !== "scrub" ||
    (product.gender !== "Men" &&
      product.gender !== "Women")
  ) {
    return product.slug;
  }

  return (
    SCRUB_VARIANT_SLUGS[
      product.gender
    ]?.[color] ??
    product.slug
  );
}

/* =========================================================
   DISPLAY COLOUR NAME
   ========================================================= */

function getDisplayColourName(color: string) {
  const normalized = color.trim().toLowerCase();

  if (normalized === "black") {
    return "Black";
  }

  if (normalized === "airforce blue") {
    return "Airforce";
  }

  if (normalized === "wine") {
    return "Wine";
  }

  if (normalized === "olive") {
    return "Mediterranean Olive";
  }

  return color;
}

function getScrubCardPricing(product: Product) {
  const slug = product.slug.toLowerCase();

  let sellingPrice =
    product.setPrice ??
    product.price;

  if (product.productType === "scrub") {
    if (slug.includes("royal-blue")) {
      sellingPrice = 1599;
    } else if (
      slug.includes("airforce-blue") ||
      slug.endsWith("-black") ||
      slug.endsWith("-wine") ||
      slug.includes("mediterranean-olive")
    ) {
      sellingPrice = 1899;
    }
  }

  const originalPrice =
    product.setOriginalPrice ??
    product.originalPrice ??
    sellingPrice;

  return {
    sellingPrice,
    originalPrice,
  };
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

export default function ProductCard({
  product,
}: ProductCardProps) {
  /* =======================================================
     PRODUCT IMAGES
     ======================================================= */

  const mainImage =
    product.images?.[0] ??
    product.image;

  const hoverImage =
    product.images?.[1] ??
    product.image;

  /* =======================================================
     PRICING
     ======================================================= */

  const scrubCardPricing =
    product.productType === "scrub"
      ? getScrubCardPricing(product)
      : null;

  const sellingPrice =
    scrubCardPricing?.sellingPrice ??
    product.setPrice ??
    product.price;

  const originalPrice =
    scrubCardPricing?.originalPrice ??
    product.setOriginalPrice ??
    product.originalPrice;

  const discount =
    product.discountPercent ??
    (originalPrice &&
    originalPrice > sellingPrice
      ? Math.round(
          ((originalPrice - sellingPrice) /
            originalPrice) *
            100,
        )
      : 0);

  /* =======================================================
     PRODUCT STATUS
     ======================================================= */

  const normalizedBadge =
    product.badge
      ?.trim()
      .toLowerCase() ?? "";

  const isComingSoon =
    normalizedBadge === "coming soon" ||
    product.tags?.some(
      (tag) =>
        tag
          .trim()
          .toLowerCase() ===
        "coming soon",
    ) === true;

  const isUnavailable =
    !product.inStock ||
    product.stock <= 0;

  const displayBadge =
    isComingSoon
      ? "Coming Soon"
      : product.badge || "";

  /* =======================================================
     STYLE LABEL
     ======================================================= */

  const styleLabel = (() => {
    /*
     * LIVE SCRUBS
     */

    if (
      product.productType ===
        "scrub" &&
      product.inStock
    ) {
      return "V-Neck Athletic Scrub";
    }

    /*
     * COMING SOON / OTHER PRODUCTS
     */

    const searchable = [
      product.style,
      product.name,
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
      ) ||
      searchable.includes(
        "v neck",
      )
    ) {
      return "V-Neck Scrub";
    }

    /*
     * LAB COATS / MEDICAL APRONS
     *
     * Do not show a scrub-style label for
     * Flex-U Premium Medical Apron or any
     * other lab-coat product.
     */
    if (
      product.productType ===
      "lab-coat"
    ) {
      return "";
    }

    return (
      product.style ||
      "Krinay"
    );
  })();

  /* =======================================================
     RATING
     ======================================================= */

  const displayRating =
    product.inStock
      ? 5
      : product.rating;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <article className="group w-full min-w-0 bg-white">

      {/* ===================================================
          PRODUCT IMAGE
      =================================================== */}

      <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f3f2]">

        {/* =================================================
            TOP LEFT BADGE
        ================================================= */}

        {displayBadge && (
          <span
            className={`
              absolute
              left-3
              top-3
              z-30
              rounded-full
              px-3
              py-1.5
              text-[10px]
              font-black
              uppercase
              tracking-wide
              text-white

              ${
                isComingSoon
                  ? "bg-[#922424]"
                  : normalizedBadge ===
                      "out of stock"
                    ? "bg-slate-700"
                    : "bg-[#922424]"
              }
            `}
          >
            {displayBadge}
          </span>
        )}

        {/* =================================================
            FALLBACK COMING SOON
        ================================================= */}

        {!displayBadge &&
          isUnavailable && (
            <span className="absolute left-3 top-3 z-30 rounded-full bg-[#922424] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
              Coming Soon
            </span>
          )}

        {/* =================================================
            WISHLIST
        ================================================= */}

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          className="
            absolute
            right-3
            top-3
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white
            text-slate-700
            shadow-md
            transition
            hover:text-[#922424]
          "
        >
          <Heart size={18} />
        </button>

        {/* =================================================
            PRODUCT LINK
        ================================================= */}

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
              HOVER IMAGE
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
              DISCOUNT BADGE
          ================================================= */}

          {discount > 0 &&
            product.inStock &&
            !isComingSoon && (
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

        {/* =================================================
            STYLE + RATING
        ================================================= */}

        <div className="flex items-center justify-between gap-2">

          {styleLabel ? (
            <span className="text-[12px] font-medium text-slate-500 underline decoration-slate-400 underline-offset-2">
              {styleLabel}
            </span>
          ) : (
            <span />
          )}

          {displayRating > 0 &&
            !isComingSoon && (
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

        {/* =================================================
            PRODUCT NAME
        ================================================= */}

        <div className="mt-2 flex items-start gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="min-w-0 flex-1"
          >
            <h3 className="line-clamp-2 min-h-[48px] text-[16px] font-medium leading-6 text-[#343434] transition group-hover:text-[#922424]">
              {product.name}
            </h3>
          </Link>

        </div>

        {/* =================================================
            PRICE
        ================================================= */}

        {isComingSoon ? (
          <div className="mt-2">

            <span className="text-[13px] font-bold uppercase tracking-wide text-[#922424]">
              Coming Soon
            </span>

          </div>
        ) : (
          <>

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

          </>
        )}

        {/* =================================================
            COLOUR DOTS
        ================================================= */}

        {!isComingSoon &&
          product.productType ===
            "scrub" &&
          (product.gender === "Men" ||
            product.gender === "Women") && (
            <div className="mt-4 flex min-h-[24px] flex-wrap items-center gap-2">
              {SCRUB_VARIANT_COLOURS.map(
                (color) => {
                  const hex =
                    COLOR_HEX[color] ??
                    "#cbd5e1";

                  const productSlug = product.slug.toLowerCase();
                  const currentColor =
                    (color === "Airforce Blue" && productSlug.includes("airforce-blue")) ||
                    (color === "Royal Blue" && productSlug.includes("royal-blue")) ||
                    (color === "Black" && productSlug.endsWith("-black")) ||
                    (color === "Wine" && productSlug.endsWith("-wine")) ||
                    (color === "Olive" && productSlug.includes("mediterranean-olive"));

                  const variantSlug =
                    getScrubVariantSlug(
                      product,
                      color,
                    );

                  return (
                    <Link
                      key={color}
                      href={`/product/${variantSlug}?color=${encodeURIComponent(
                        color,
                      )}`}
                      title={color}
                      aria-label={`View ${product.name} in ${color}`}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      className={`
                        flex
                        h-[22px]
                        w-[22px]
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        transition
                        ${
                          currentColor
                            ? "border-2 border-[#922424]"
                            : "border border-slate-300 hover:border-[#922424]"
                        }
                      `}
                    >
                      <span
                        className="h-[15px] w-[15px] rounded-full border border-black/10"
                        style={{
                          backgroundColor:
                            hex,
                        }}
                      />
                    </Link>
                  );
                },
              )}
            </div>
          )}

        {!isComingSoon &&
          product.productType !==
            "scrub" &&
          product.colors?.length >
            0 && (
            <div className="mt-4 flex min-h-[24px] flex-wrap items-center gap-2">
              {product.colors
                .slice(0, 5)
                .map((color) => {
                  const hex =
                    COLOR_HEX[color] ??
                    "#cbd5e1";

                  return (
                    <span
                      key={color}
                      title={color}
                      aria-label={color}
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
            </div>
          )}

      </div>
    </article>
  );
}