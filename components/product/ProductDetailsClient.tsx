"use client";

import Image from "next/image";

import Link from "next/link";

import { trackEvent } from "@/lib/fbpixel";
import {
  getScrubSizeSurcharge,
  SCRUB_SIZE_SURCHARGE,
} from "@/lib/size-pricing";
import {

  useRouter,

  useSearchParams,

} from "next/navigation";

import {
   useEffect,
  useRef,
  useState,

} from "react";

import toast from "react-hot-toast";

import {

  Check,

  ChevronLeft,

  ChevronRight,

  ChevronDown,

  ChevronUp,

  Gift,

  Heart,

  Minus,

  Plus,

  ShieldCheck,

  ShoppingBag,

  Star,

  Truck,

  UserRound,

} from "lucide-react";

import SizeGuideModal from "@/components/product/SizeGuideModal";

import ProductCard from "@/components/product/ProductCard";

import ProductReviews from "@/components/product/ProductReviews";

import EmbroideryCustomizerModal from "@/components/product/EmbroideryCustomizerModal";

import type {

  CartEmbroidery,

  ScrubPurchaseType,

} from "@/types/cart";

import {

  useCart,

} from "@/hooks/useCart";

import {

  useAuth,

} from "@/hooks/useAuth";

import {

  useWishlist,

} from "@/hooks/useWishlist";

import type {

  Product,

} from "@/types/product";

type ProductDetailsClientProps = {

  product: Product;

  relatedProducts: Product[];

};

const colorMap: Record<

  string,

  string

> = {

  Airforce:

    "#5f7898",

  "Airforce Blue":

    "#5f7898",

  "Black":

    "#111827",

  "Royal Blue":

    "#2563eb",

  "Navy Blue":

    "#16375b",

  "Sky Blue":

    "#60a5fa",

  Wine:

    "#881337",

  Lavender:

    "#c4b5fd",

  Grey:

    "#64748b",

  White:

    "#ffffff",

  Teal:

    "#0f766e",

  Pink:

    "#f472b6",

  Olive:

    "#657153",

  "Steel Grey":

    "#515866",

  "Fuchsia Berry":

    "#c026d3",

  Purple:

    "#7e22ce",

  Green:

    "#16a34a",

};

const SCRUB_COLOUR_ORDER = [

  "Airforce Blue",

  "Royal Blue",

  "Black",

  "Wine",

  "Olive",

] as const;

const CLASSIC_V_NECK_COLOUR_ORDER = [
  "Fuchsia Berry",
  "Steel Grey",
  "Lavender",
  "Navy Blue",
  "Purple",
  "Black",
] as const;

const SCRUB_VARIANT_SLUGS: Record<string, Record<string, string>> = {

  Men: {

    "Airforce Blue": "mens-athletic-scrub-set-airforce-blue",

    "Royal Blue": "mens-athletic-scrub-set-royal-blue",

    Black: "mens-athletic-scrub-set-black",

    Wine: "mens-athletic-scrub-set-wine",

    Olive: "mens-athletic-scrub-set-mediterranean-olive",

  },

  Women: {

    "Airforce Blue": "womens-athletic-scrub-set-airforce-blue",

    "Royal Blue": "womens-athletic-scrub-set-royal-blue",

    Black: "womens-athletic-scrub-set-black",

    Wine: "womens-athletic-scrub-set-wine",

    Olive: "womens-athletic-scrub-set-mediterranean-olive",

  },
};

const CLASSIC_V_NECK_VARIANT_SLUGS: Record<
  string,
  Record<string, string>
> = {
  Men: {
    "Fuchsia Berry": "mens-classic-v-neck-scrub-set-fuchsia-berry",
    "Steel Grey": "mens-classic-v-neck-scrub-set-steel-grey",
    Lavender: "mens-classic-v-neck-scrub-set-lavender",
    "Navy Blue": "mens-classic-v-neck-scrub-set-navy-blue",
    Purple: "mens-classic-v-neck-scrub-set-purple",
  },
  Women: {
    "Fuchsia Berry": "womens-classic-v-neck-scrub-set-fuchsia-berry",
    "Steel Grey": "womens-classic-v-neck-scrub-set-steel-grey",
    Lavender: "womens-classic-v-neck-scrub-set-lavender",
    "Navy Blue": "womens-classic-v-neck-scrub-set-navy-blue",
    Purple: "womens-classic-v-neck-scrub-set-purple",
    Black: "womens-classic-v-neck-scrub-set-black",
  },
};

function getScrubVariantSlug(product: Product, color: string) {
  if (product.style === "v-neck") {
    return (
      CLASSIC_V_NECK_VARIANT_SLUGS[product.gender]?.[color] ??
      product.slug
    );
  }

  return SCRUB_VARIANT_SLUGS[product.gender ?? ""]?.[color] ?? product.slug;
}

function getDisplayColourName(color: string) {

  return color.trim().toLowerCase() === "olive"

    ? "Mediterranean Olive"

    : color;

}

export default function ProductDetailsClient({

  product,

  relatedProducts,

}: ProductDetailsClientProps) {

  const router = useRouter();

  const searchParams =

    useSearchParams();

  const { addToCart } =

    useCart();

  const { user } =

    useAuth();

  const {

    isWishlisted,

    toggleWishlist:

      toggleWishlistItem,

  } = useWishlist();

  const wishlisted =
    isWishlisted(
      product.id,
    );

  const scrubColours: readonly string[] =
    product.style === "v-neck"
      ? CLASSIC_V_NECK_COLOUR_ORDER.filter(
          (color) => color !== "Black" || product.gender === "Women",
        )
      : SCRUB_COLOUR_ORDER;

  /*

   * =====================================

   * INITIAL COLOUR

   * =====================================

   */

  const requestedColour = searchParams.get("color");

const productSlug = product.slug?.trim().toLowerCase() ?? "";

const productColourFromSlug =

  productSlug.includes("airforce-blue")

    ? "Airforce Blue"

    : productSlug.includes("royal-blue")

      ? "Royal Blue"

      : productSlug.endsWith("-black")

        ? "Black"

        : productSlug.endsWith("-wine")

          ? "Wine"

          : productSlug.includes("mediterranean-olive")

            ? "Olive"

            : "";

const initialColour =

requestedColour &&

scrubColours.includes(requestedColour)

  ? requestedColour

  : productColourFromSlug &&

      scrubColours.includes(productColourFromSlug)

      ? productColourFromSlug

      : product.colors[0] ?? "";

  const [

    selectedColor,

    setSelectedColor,

  ] =

    useState(

      initialColour,

    );

  /*

   * =====================================

   * SIZE

   * =====================================

   */

  const [

    selectedSize,

    setSelectedSize,

  ] =

    useState(

      product.sizes[0] ??

        "",

    );

  const [

    purchaseType,

    setPurchaseType,

  ] =

    useState<ScrubPurchaseType>(

      "set",

    );

  const [

    selectedTopSize,

    setSelectedTopSize,

  ] =

    useState(

      product.topSizes?.[0] ??

        product.sizes[0] ??

        "",

    );

  const [

    selectedBottomSize,

    setSelectedBottomSize,

  ] =

    useState(

      product

        .bottomSizes?.[0] ??

        product.sizes[0] ??

        "",

    );

  const [

    selectedImageIndex,

    setSelectedImageIndex,

  ] =

    useState(0);

  /*

   * =====================================

   * IMAGE GALLERY CONTROLS

   * =====================================

   */

  const [

    galleryControlsVisible,

    setGalleryControlsVisible,

  ] = useState(false);

  const [

    quantity,

    setQuantity,

  ] =

    useState(1);

  const [

    detailsOpen,

    setDetailsOpen,

  ] =

    useState(true);

  const [

    careOpen,

    setCareOpen,

  ] =

    useState(false);

  const [

    sizeGuideOpen,

    setSizeGuideOpen,

  ] =

    useState(false);

  const [

    embroideryOpen,

    setEmbroideryOpen,

  ] =

    useState(false);

  const [

    embroidery,

    setEmbroidery,

  ] =

    useState<

      | CartEmbroidery

      | undefined

    >(undefined);

  const [

    embroideryChoice,

    setEmbroideryChoice,

  ] =

    useState<

      | "add"

      | "skip"

      | null

    >(null);

  /*

   * =====================================

   * REVIEWS

   * =====================================

   */

  const initialReviewCount =

    product.reviews.length;

  const initialReviewRating =

    initialReviewCount > 0

      ? Number(

          (

            product.reviews.reduce(

              (total, review) =>

                total + review.rating,

              0,

            ) /

            initialReviewCount

          ).toFixed(1),

        )

      : 0;

  const [

    liveReviewCount,

    setLiveReviewCount,

  ] =

    useState(

      initialReviewCount,

    );

  const [

    liveRating,

    setLiveRating,

  ] =

    useState(

      initialReviewRating,

    );

  /*

   * =====================================

   * PURCHASE SYSTEM

   * =====================================

   */

  const supportsPurchaseOptions =

    product.purchaseOptions ===

    true;

  /*

   * =====================================

   * COLOUR-BASED SCRUB PRICING

   * =====================================

   *

   * Royal Blue  -> Set ₹1,599 | Top ₹799 | Bottom ₹800

   * Airforce Blue / Airforce -> Set ₹1,899 | Top ₹949 | Bottom ₹950

   * Black       -> Set ₹1,899 | Top ₹949 | Bottom ₹950

   * Wine        -> Set ₹1,899 | Top ₹949 | Bottom ₹950

   * Olive       -> Set ₹1,899 | Top ₹949 | Bottom ₹950

   *

   * Other colours/product types continue using

   * their existing catalog prices.

   */

  const getColourPricing = (color: string) => {

    if (product.productType !== "scrub") {

      return {

        setPrice: product.setPrice ?? product.price,

        topPrice: product.topPrice ?? product.price,

        bottomPrice: product.bottomPrice ?? product.price,

      };

    }

    const normalizedColor = color.trim().toLowerCase();

    if (normalizedColor === "royal blue") {

      return {

        setPrice: 1599,

        topPrice: 799,

        bottomPrice: 800,

      };

    }

    if (

      normalizedColor === "airforce" ||

      normalizedColor === "airforce blue" ||

      normalizedColor === "black" ||

      normalizedColor === "wine" ||

      normalizedColor === "olive"

    ) {

      return {

        setPrice: 1899,

        topPrice: 949,

        bottomPrice: 950,

      };

    }

    return {

      setPrice: product.setPrice ?? product.price,

      topPrice: product.topPrice ?? product.price,

      bottomPrice: product.bottomPrice ?? product.price,

    };

  };

  const selectedColourPricing =

    getColourPricing(selectedColor);

  /*

   * =====================================

   * SELECTED COLOUR GALLERY

   * =====================================

   */

  const selectedGallery =

    product.colorImages?.[

      selectedColor

    ] ??

    product.images ??

    [product.image];

  const selectedImage =

    selectedGallery[

      selectedImageIndex

    ] ??

    selectedGallery[0] ??

    product.image;

  const hasMultipleImages =

    selectedGallery.length > 1;

  const showPreviousImage = () => {

    if (!hasMultipleImages) {

      return;

    }

    setSelectedImageIndex(

      (currentIndex) =>

        currentIndex <= 0

          ? selectedGallery.length - 1

          : currentIndex - 1,

    );

    setGalleryControlsVisible(

      true,

    );

  };

  const showNextImage = () => {

    if (!hasMultipleImages) {

      return;

    }

    setSelectedImageIndex(

      (currentIndex) =>

        currentIndex >=

        selectedGallery.length - 1

          ? 0

          : currentIndex + 1,

    );

    setGalleryControlsVisible(

      true,

    );

  };

  /*

   * =====================================

   * DYNAMIC PRICE

   * =====================================

   */

  /*

   * Original catalog selling price.

   *

   * Size surcharge is NOT included here.

   */

  const selectedCatalogPrice =

    supportsPurchaseOptions

      ? purchaseType ===

        "top"

        ? selectedColourPricing.topPrice

        : purchaseType ===

            "bottom"

          ? selectedColourPricing.bottomPrice

          : selectedColourPricing.setPrice

      : product.price;

  const sizeSurcharge =
    supportsPurchaseOptions
      ? getScrubSizeSurcharge(
          product.productType,
          purchaseType === "set" || purchaseType === "top"
            ? selectedTopSize
            : undefined,
          purchaseType === "set" || purchaseType === "bottom"
            ? selectedBottomSize
            : undefined,
        )
      : getScrubSizeSurcharge(product.productType, selectedSize);

  /*

   * Final product selling price before

   * embroidery.

   */

  const selectedBasePrice =

    selectedCatalogPrice +

    sizeSurcharge;

  const selectedMrp =

    supportsPurchaseOptions

      ? purchaseType ===

        "top"

        ? product.topOriginalPrice ??
          product.originalPrice ??
          selectedCatalogPrice
        : purchaseType ===
            "bottom"
          ? product.bottomOriginalPrice ??
            product.originalPrice ??
            selectedCatalogPrice
          : product.setOriginalPrice ??
            product.originalPrice ??
            selectedCatalogPrice
      : product.originalPrice ??
        selectedCatalogPrice;

  const discount =

    selectedMrp >

    selectedBasePrice

      ? Math.round(

          ((selectedMrp -

            selectedBasePrice) /

            selectedMrp) *

            100,

        )

      : 0;

  const discountAmount =

    Math.max(

      selectedMrp -

        selectedBasePrice,

      0,

    );

  const embroideryPrice =

    embroidery?.price ??

    0;

  const finalUnitPrice =

    selectedBasePrice +

    embroideryPrice;

  /*

   * =====================================

   * QUANTITY

   * =====================================

   */

  const increaseQuantity =

    () => {

      if (

        !product.inStock

      ) {

        return;

      }

      if (

        quantity <

        product.stock

      ) {

        setQuantity(

          (current) =>

            current + 1,

        );

      }

    };

  const decreaseQuantity =

    () => {

      if (

        quantity > 1

      ) {

        setQuantity(

          (current) =>

            current - 1,

        );

      }

    };

  /*

   * =====================================

   * SIZE LABEL

   * =====================================

   */

  const currentSizeLabel =

    supportsPurchaseOptions

      ? purchaseType ===

        "set"

        ? `Top ${selectedTopSize} / Bottom ${selectedBottomSize}`

        : purchaseType ===

            "top"

          ? selectedTopSize

          : selectedBottomSize

      : selectedSize;

  /*

   * =====================================

   * CART KEY

   * =====================================

   */

  const buildCartKey =

    () => {

      const embroiderySignature =

        embroidery

          ? [

              embroidery.mode,

              embroidery.line1,

              embroidery.line2,

              embroidery.font,

              embroidery.textColor,

              embroidery.selectedIconId,

              embroidery.fileUrl,

              embroidery.addBottomName

                ? "bottom"

                : "",

            ].join("|")

          : "plain";

      return [

        product.id,

        selectedColor,

        supportsPurchaseOptions

          ? purchaseType

          : "standard",

        supportsPurchaseOptions

          ? selectedTopSize

          : selectedSize,

        supportsPurchaseOptions

          ? selectedBottomSize

          : "",

        embroiderySignature,

      ].join("::");

    };

  /*

   * =====================================

   * VALIDATION

   * =====================================

   */

  const validateSelection =

    () => {

      if (

        !product.inStock ||

        product.stock <= 0

      ) {

        toast.error(

          "This product is out of stock",

        );

        return false;

      }

      if (

        !selectedColor

      ) {

        toast.error(

          "Please select a colour",

        );

        return false;

      }

      if (

        supportsPurchaseOptions

      ) {

        if (

          (purchaseType ===

            "set" ||

            purchaseType ===

              "top") &&

          !selectedTopSize

        ) {

          toast.error(

            "Please select a top size",

          );

          return false;

        }

        if (

          (purchaseType ===

            "set" ||

            purchaseType ===

              "bottom") &&

          !selectedBottomSize

        ) {

          toast.error(

            "Please select a bottom size",

          );

          return false;

        }

      } else if (

        !selectedSize

      ) {

        toast.error(

          "Please select a size",

        );

        return false;

      }

      /*

       * Scrub / lab-coat customer must explicitly choose:

       * Add Embroidery OR Skip for Now.

       */

      if (

        (product.productType === "scrub" || product.productType === "lab-coat") &&

        embroideryChoice === null

      ) {

        toast.error(

          "Please choose Add Embroidery or Skip for Now.",

        );

        return false;

      }

            if (

        supportsPurchaseOptions &&

        selectedColor === "Royal Blue" &&

        (

          (

            (purchaseType === "set" ||

              purchaseType === "top") &&

            selectedTopSize === "XXL"

          ) ||

          (

            (purchaseType === "set" ||

              purchaseType === "bottom") &&

            selectedBottomSize === "XXL"

          )

        )

      ) {

        toast.error(

          "Royal Blue XXL is currently out of stock.",

        );

        return false;

      }

      /*

       * If Add Embroidery is selected, customization

       * must actually be completed before cart/checkout.

       */

      if (

        (product.productType === "scrub" || product.productType === "lab-coat") &&

        embroideryChoice ===

          "add" &&

        !embroidery

      ) {

        toast.error(

          "Please complete your embroidery customization.",

        );

        setEmbroideryOpen(

          true,

        );

        return false;

      }

      if (

        quantity < 1

      ) {

        toast.error(

          "Please select a valid quantity",

        );

        return false;

      }

      if (

        quantity >

        product.stock

      ) {

        toast.error(

          `Only ${product.stock} pieces are available`,

        );

        return false;

      }

      return true;

    };

  /*

   * =====================================

   * BUILD CART ITEM

   * =====================================

   */

  const buildCartItem =

    () => {

      const itemName =

        supportsPurchaseOptions

          ? purchaseType ===

            "top"

            ? `${product.name} - Top`

            : purchaseType ===

                "bottom"

              ? `${product.name} - Bottom`

              : product.name

          : product.name;

      return {

        productId:

          product.id,

        name:

          itemName,

        slug:

          product.slug,

        cartKey:

          buildCartKey(),

        image:

          selectedImage,

        basePrice:

          selectedBasePrice,

        sizeSurcharge,

        price:

          finalUnitPrice,

        size:

          currentSizeLabel,

        color:

          selectedColor,

        quantity,

        purchaseType:

          supportsPurchaseOptions

            ? purchaseType

            : undefined,

        topSize:

          supportsPurchaseOptions &&

          purchaseType !==

            "bottom"

            ? selectedTopSize

            : undefined,

        bottomSize:

          supportsPurchaseOptions &&

          purchaseType !==

            "top"

            ? selectedBottomSize

            : undefined,

        mrp:

          selectedMrp,

        discountPercent:

          discount,

        discountAmount,

        embroidery,

      };

    };

  const handleAddToCart =

    () => {

      if (

        !validateSelection()

      ) {

        return;

      }

      addToCart(

        buildCartItem(),

      );

      toast.success(

        `${product.name} added to cart`,

      );

    };

  const handleBuyNow =

    () => {

      if (

        !validateSelection()

      ) {

        return;

      }

      addToCart(

        buildCartItem(),

      );

      window.location.href =

        "/cart";

    };

  const handleToggleWishlist =

    async () => {

      const added =

        await toggleWishlistItem(

          product.id,

        );

      toast.success(

        added

          ? "Added to wishlist"

          : "Removed from wishlist",

      );

    };

  return (

    <>

      <section className="border-b border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">

          <Link

            href="/"

            className="hover:text-[#922424]"

          >

            Home

          </Link>

          <span className="mx-2">

            /

          </span>

          <Link

            href="/shop"

            className="hover:text-[#922424]"

          >

            Shop

          </Link>

          <span className="mx-2">

            /

          </span>

          <span className="text-slate-800">

            {product.name}

          </span>

        </div>

      </section>

      <section className="bg-white">

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">

          <div>

            <div

              className="group/gallery relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100"

              onClick={() =>

                setGalleryControlsVisible(

                  true,

                )

              }

              onMouseLeave={() =>

                setGalleryControlsVisible(

                  false,

                )

              }

            >

              {product.badge && (

                <span className="absolute left-5 top-5 z-30 rounded-full bg-[#922424] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">

                  {

                    product.badge

                  }

                </span>

              )}

              <button

                type="button"

                onClick={(event) => {

                  event.stopPropagation();

                  handleToggleWishlist();

                }}

                aria-label={

                  wishlisted

                    ? "Remove from wishlist"

                    : "Add to wishlist"

                }

                className={`absolute right-5 top-5 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-md transition ${

                  wishlisted

                    ? "bg-red-500 text-white"

                    : "bg-white text-slate-700 hover:text-red-500"

                }`}

              >

                <Heart

                  size={21}

                  fill={

                    wishlisted

                      ? "currentColor"

                      : "none"

                  }

                />

              </button>

              <Image

                src={selectedImage}

                alt={`${product.name} - ${selectedColor} - image ${

                  selectedImageIndex + 1

                }`}

                fill

                priority

                loading="eager"

                sizes="(max-width: 1024px) 100vw, 50vw"

                className="cursor-pointer object-cover object-top"

              />

              {hasMultipleImages && (

                <button

                  type="button"

                  onClick={(event) => {

                    event.stopPropagation();

                    showPreviousImage();

                  }}

                  aria-label="Previous product image"

                  className={`absolute left-4 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition-all duration-200 hover:bg-[#922424] hover:text-white focus:opacity-100 ${

                    galleryControlsVisible

                      ? "opacity-100"

                      : "opacity-100 md:opacity-0 md:group-hover/gallery:opacity-100"

                  }`}

                >

                  <ChevronLeft

                    size={25}

                  />

                </button>

              )}

              {hasMultipleImages && (

                <button

                  type="button"

                  onClick={(event) => {

                    event.stopPropagation();

                    showNextImage();

                  }}

                  aria-label="Next product image"

                  className={`absolute right-4 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition-all duration-200 hover:bg-[#922424] hover:text-white focus:opacity-100 ${

                    galleryControlsVisible

                      ? "opacity-100"

                      : "opacity-100 md:opacity-0 md:group-hover/gallery:opacity-100"

                  }`}

                >

                  <ChevronRight

                    size={25}

                  />

                </button>

              )}

              {hasMultipleImages && (

                <span className="absolute bottom-4 right-4 z-30 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white">

                  {selectedImageIndex +

                    1}{" "}

                  /{" "}

                  {

                    selectedGallery.length

                  }

                </span>

              )}

            </div>

            {hasMultipleImages && (

              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">

                {selectedGallery.map(

                  (

                    image,

                    index,

                  ) => (

                    <button

                      key={`${image}-${index}`}

                      type="button"

                      onClick={() => {

                        setSelectedImageIndex(

                          index,

                        );

                        setGalleryControlsVisible(

                          true,

                        );

                      }}

                      aria-label={`View product image ${

                        index + 1

                      }`}

                      className={`relative aspect-[4/5] overflow-hidden rounded-xl border bg-slate-100 transition ${

                        selectedImageIndex ===

                        index

                          ? "border-[#922424] ring-2 ring-[#922424]/20"

                          : "border-slate-200 hover:border-[#922424]/50"

                      }`}

                    >

                      <Image

                        src={

                          image

                        }

                        alt={`${product.name} ${selectedColor} thumbnail ${

                          index + 1

                        }`}

                        fill

                        sizes="120px"

                        className="object-cover object-top"

                      />

                    </button>

                  ),

                )}

              </div>

            )}

          </div>

          <div className="lg:py-3">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">

              {product.category}

            </p>

            <div className="mt-3 flex items-start gap-2">

              <h1 className="min-w-0 flex-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">

                {product.name}

              </h1>

              {(product.productType === "scrub" ||

                product.productType === "lab-coat") && (

                <div className="group/advisory relative mt-1 shrink-0">

                  <span className="inline-flex h-14 cursor-help items-center rounded-md border border-slate-400 bg-white px-3.5 text-[12px] font-black uppercase tracking-[0.08em] text-slate-900 shadow-sm">

                    Fit Advisory

                  </span>

                  <div className="pointer-events-none absolute right-0 top-9 z-50 w-100 translate-y-1 rounded-xl border border-slate-200 bg-white p-8 text-[12px] leading-5 text-slate-900 opacity-0 shadow-2xl transition-all duration-150 group-hover/advisory:pointer-events-auto group-hover/advisory:translate-y-0 group-hover/advisory:opacity-100">

                    <p className="font-black text-slate-900">

                      Fit Advisory: <span className="font-bold">Athletic Fit</span>

                    </p>

                    <p className="mt-1">

                      Athletic Fit features a tailored, high-performance silhouette.

                    </p>

                    <p className="mt-1">

                      If you prefer your regular fit or are between sizes, please size up (e.g., <strong>Small → Medium</strong>).

                    </p>

                  </div>

                </div>

              )}

            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">

              {liveReviewCount >

              0 ? (

                <>

                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5">

                    <Star

                      size={

                        16

                      }

                      fill="currentColor"

                      className="text-amber-500"

                    />

                    <span className="text-sm font-bold">

                      {

                        liveRating

                      }

                    </span>

                  </div>

                  <span className="text-sm text-slate-500">

                    {

                      liveReviewCount

                    }{" "}

                    reviews

                  </span>

                </>

              ) : (

                <span className="text-sm text-slate-500">

                  No reviews yet

                </span>

              )}

              <span className="text-sm font-bold text-emerald-600">

                <Check

                  className="inline"

                  size={16}

                />{" "}

                In Stock

              </span>

            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">

              <span className="text-3xl font-black">

                ₹

                {selectedBasePrice.toLocaleString(

                  "en-IN",

                )}

              </span>

              {selectedMrp >

                selectedBasePrice && (

                <span className="text-lg text-slate-400 line-through">

                  ₹

                  {selectedMrp.toLocaleString(

                    "en-IN",

                  )}

                </span>

              )}

              {discount > 0 && (

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">

                  Save{" "}

                  {

                    discount

                  }

                  %

                </span>

              )}

              {sizeSurcharge > 0 && (

                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">

                  Applied +₹
                  {sizeSurcharge.toLocaleString(
                    "en-IN",
                  )}

                </span>

              )}

            </div>

            <p className="mt-5 leading-7 text-slate-600">

              {

                product.shortDescription

              }

            </p>

            <div className="mt-8">

              <div className="flex justify-between">

                <h2 className="text-sm font-black">

                  Select Colour

                </h2>

                <span className="text-xs font-semibold text-slate-500">

                  {getDisplayColourName(selectedColor)}

                </span>

              </div>

              <div className="mt-3 flex flex-wrap gap-2">

                {scrubColours.map((color) => {

                  const variantSlug =

                    product.productType === "scrub"

                      ? getScrubVariantSlug(product, color)

                      : product.slug;

                  const isSelected = selectedColor === color;

                  return (

                    <button

                      key={color}

                      type="button"

                      title={getDisplayColourName(color)}

                      aria-label={`Select ${getDisplayColourName(color)}`}

                      onClick={() => {

                        if (

                          product.productType === "scrub" &&

                          variantSlug !== product.slug

                        ) {

                          router.push(`/product/${variantSlug}?color=${encodeURIComponent(color)}`);

                          return;

                        }

                        setSelectedColor(color);

                        setSelectedImageIndex(0);

                        setGalleryControlsVisible(false);

                      }}

                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition ${

                        isSelected

                          ? "border-[#922424] bg-[#fff7f7] text-[#922424]"

                          : "border-slate-300 bg-white text-slate-700 hover:border-[#922424]"

                      }`}

                    >

                      <span

                        className="h-4 w-4 rounded-full border border-black/10"

                        style={{

                          backgroundColor: colorMap[color] ?? "#cbd5e1",

                        }}

                      />

                      {getDisplayColourName(color)}

                    </button>

                  );

                })}

              </div>

            </div>

            {supportsPurchaseOptions ? (

              <>

                <div className="mt-8">

                  <div className="flex items-center justify-between">

                    <h2 className="text-sm font-black">

                      What do you

                      need?

                    </h2>

                  </div>

                  <div className="mt-4 grid gap-3">

                    {[

                      {

                        type:

                          "set" as const,

                        title:

                          "Complete Scrub Set",

                        subtitle:

                          "Top + Bottom",

                        price:

                          selectedColourPricing.setPrice,

                        mrp:

                          product.setOriginalPrice ??

                          product.originalPrice ??

                          product.price,

                      },

                      {

                        type:

                          "top" as const,

                        title:

                          "Scrub Top Only",

                        subtitle:

                          "Select top size",

                        price:

                          selectedColourPricing.topPrice,

                        mrp:

                          product.topOriginalPrice ??

                          product.originalPrice ??

                          product.price,

                      },

                      {

                        type:

                          "bottom" as const,

                        title:

                          "Scrub Bottom Only",

                        subtitle:

                          "Select bottom size",

                        price:

                          selectedColourPricing.bottomPrice,

                        mrp:

                          product.bottomOriginalPrice ??

                          product.originalPrice ??

                          product.price,

                      },

                    ].map(

                      (

                        option,

                      ) => (

                        <button

                          key={

                            option.type

                          }

                          type="button"

                          onClick={() =>

                            setPurchaseType(

                              option.type,

                            )

                          }

                          className={`flex items-center justify-between rounded-2xl border p-4 text-left ${

                            purchaseType ===

                            option.type

                              ? "border-[#922424] bg-[#fff7f7] ring-2 ring-[#922424]/10"

                              : "border-slate-200"

                          }`}

                        >

                          <span>

                            <span className="block text-sm font-black">

                              {

                                option.title

                              }

                            </span>

                            <span className="mt-1 block text-xs text-slate-500">

                              {

                                option.subtitle

                              }

                            </span>

                          </span>

                          <span className="text-right">

                            <span className="block font-black text-[#922424]">

                              ₹

                              {option.price.toLocaleString(

                                "en-IN",

                              )}

                            </span>

                            {option.mrp >

                              option.price && (

                              <span className="text-xs text-slate-400 line-through">

                                ₹

                                {option.mrp.toLocaleString(

                                  "en-IN",

                                )}

                              </span>

                            )}

                          </span>

                        </button>

                      ),

                    )}

                  </div>

                </div>

                {(purchaseType ===

                  "set" ||

                  purchaseType ===

                    "top") && (

                  <SizeSelector

                    title="Top Size"

                    sizes={

                      product.topSizes ??

                      product.sizes

                    }

                    selected={

                      selectedTopSize

                    }

                    onSelect={

                      setSelectedTopSize

                    }

                    onGuide={() =>

                      setSizeGuideOpen(

                        true,

                      )

                    }

                  />

                )}

                {(purchaseType ===

                  "set" ||

                  purchaseType ===

                    "bottom") && (

                  <SizeSelector

                    title="Bottom Size"

                    sizes={

                      product.bottomSizes ??

                      product.sizes

                    }

                    selected={

                      selectedBottomSize

                    }

                    onSelect={

                      setSelectedBottomSize

                    }

                    onGuide={() =>

                      setSizeGuideOpen(

                        true,

                      )

                    }

                  />

                )}

              </>

            ) : (

              <SizeSelector

                title="Select Size"

                sizes={

                  product.sizes

                }

                selected={

                  selectedSize

                }

                onSelect={

                  setSelectedSize

                }

                onGuide={() =>

                  setSizeGuideOpen(

                    true,

                  )

                }

              />

            )}
            {product.productType === "scrub" && (
              <p className="mt-3 text-sm font-semibold text-slate-600">
                XXL &amp; Above: +₹
                {SCRUB_SIZE_SURCHARGE.toLocaleString("en-IN")}
              </p>
            )}
                {(product.productType === "scrub" || product.productType === "lab-coat") && (

                  <div className="mt-8 overflow-hidden rounded-2xl border border-[#eadada] bg-white shadow-sm">

                    <div className="bg-[#922424] px-5 py-4 text-white">

                      <div className="flex items-center gap-3">

                        <span className="text-2xl">

                          🪡

                        </span>

                        <div>

                          <p className="text-lg font-black">

                            Custom Embroidery

                          </p>

                          <p className="mt-0.5 text-xs text-white/80">

                            Personalise your uniform with name,

                            designation, icon or logo.

                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="space-y-1 p-4">

                      <button

                        type="button"

                        onClick={() => {

                          setEmbroideryChoice(

                            "add",

                          );

                          setEmbroideryOpen(

                            true,

                          );

                        }}

                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${

                          embroideryChoice ===

                          "add"

                            ? "bg-[#fff4f4]"

                            : "hover:bg-slate-50"

                        }`}

                      >

                        <span

                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${

                            embroideryChoice ===

                            "add"

                              ? "border-[#922424]"

                              : "border-slate-400"

                          }`}

                        >

                          {embroideryChoice ===

                            "add" && (

                            <span className="h-2.5 w-2.5 rounded-full bg-[#922424]" />

                          )}

                        </span>

                        <span className="min-w-0 flex-1">

                          <span className="block text-sm font-black text-slate-950">

                            {embroidery

                              ? "Edit Embroidery"

                              : "Add Embroidery"}

                          </span>

                          <span className="mt-1 block text-xs leading-5 text-slate-500">

                            Add your name, designation,

                            medical icon or clinic logo.

                          </span>

                          {embroidery && (

                            <span className="mt-1 block text-xs font-black text-emerald-700">

                              Selected · +₹

                              {embroidery.price.toLocaleString(

                                "en-IN",

                              )}

                            </span>

                          )}

                        </span>

                      </button>

                      <button

                        type="button"

                        onClick={() => {

                          setEmbroideryChoice(

                            "skip",

                          );

                          setEmbroidery(

                            undefined,

                          );

                          setEmbroideryOpen(

                            false,

                          );

                        }}

                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${

                          embroideryChoice ===

                          "skip"

                            ? "bg-[#fff4f4]"

                            : "hover:bg-slate-50"

                        }`}

                      >

                        <span

                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${

                            embroideryChoice ===

                            "skip"

                              ? "border-[#922424]"

                              : "border-slate-400"

                          }`}

                        >

                          {embroideryChoice ===

                            "skip" && (

                            <span className="h-2.5 w-2.5 rounded-full bg-[#922424]" />

                          )}

                        </span>

                        <span>

                          <span className="block text-sm font-black text-slate-950">

                            Skip for Now

                          </span>

                          <span className="mt-1 block text-xs leading-5 text-slate-500">

                            Continue without custom embroidery.

                          </span>

                        </span>

                      </button>

                      {embroideryChoice ===

                        null && (

                        <p className="px-3 pt-2 text-xs font-bold text-[#922424]">

                          Please select one option before adding

                          this product to cart.

                        </p>

                      )}

                    </div>

                  </div>

                )}

            <div className="mt-8">

              <h2 className="text-sm font-black">

                Quantity

              </h2>

              <div className="mt-4 flex items-center gap-4">

                <div className="flex items-center rounded-full border p-1">

                  <button

                    type="button"

                    onClick={

                      decreaseQuantity

                    }

                    disabled={

                      quantity <= 1

                    }

                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"

                  >

                    <Minus

                      size={

                        18

                      }

                    />

                  </button>

                  <span className="w-12 text-center font-black">

                    {

                      quantity

                    }

                  </span>

                  <button

                    type="button"

                    onClick={

                      increaseQuantity

                    }

                    disabled={

                      quantity >=

                      product.stock

                    }

                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"

                  >

                    <Plus

                      size={

                        18

                      }

                    />

                  </button>

                </div>

                <span className="text-xs text-slate-500">

                  {

                    product.stock

                  }{" "}

                  available

                </span>

              </div>

            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">

              <button

                type="button"

                onClick={

                  handleAddToCart

                }

                disabled={

                  !product.inStock

                }

                className="flex items-center justify-center gap-2 rounded-full bg-[#922424] px-5 py-4 text-sm font-black text-white disabled:bg-slate-300"

              >

                <ShoppingBag

                  size={18}

                />

                Add to Cart

              </button>

              <button

                type="button"

                onClick={

                  handleBuyNow

                }

                disabled={

                  !product.inStock

                }

                className="rounded-full border-2 border-[#922424] px-5 py-4 text-sm font-black text-[#922424]"

              >

                Buy Now

              </button>

              {user ? (

                <Link

                  href="/account"

                  className="flex items-center justify-center gap-2 rounded-full border px-4 py-4 text-sm font-black"

                >

                  <UserRound

                    size={

                      18

                    }

                  />

                  {

                    user.points

                  }{" "}

                  pts

                </Link>

              ) : (

                <Link

                  href={`/login?next=${encodeURIComponent(

                    `/product/${product.slug}`,

                  )}`}

                  className="flex items-center justify-center rounded-full border px-4 py-4 text-sm font-black"

                >

                  Login / Create

                </Link>

              )}

            </div>

            <section
              aria-label="7-day free size exchange offer"
              className="mt-5 rounded-2xl border-2 border-[#922424] bg-[#fff7f7] p-5 text-center shadow-sm sm:p-6"
            >
              <p className="text-xl font-black leading-tight text-[#922424] sm:text-2xl lg:text-3xl">
                7-Day Hassle-Free Size Exchange Offer
              </p>
              <p className="mt-2 text-base font-bold leading-relaxed text-slate-900 sm:text-lg">
                Fit Not Perfect? Instant 7-Day Free Exchange.
              </p>
            </section>

            {!user && (
              <div className="mt-4 flex gap-2 rounded-2xl bg-[#fff7f7] p-4 text-xs leading-5 text-slate-600">

                <Gift

                  size={

                    17

                  }

                  className="shrink-0 text-[#922424]"

                />

                Create account

                and get 100

                welcome points.

              </div>

            )}

            <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">

              <div className="flex gap-3">

                <Truck className="text-[#922424]" />

                <div>

                  <p className="text-sm font-black">

                    Pan India

                    Delivery

                  </p>

                  <p className="text-xs text-slate-500">

                    Trusted courier

                    partners

                  </p>

                </div>

              </div>

              <div className="flex gap-3">

                <ShieldCheck className="text-[#922424]" />

                <div>

                  <p className="text-sm font-black">

                    Secure Payment

                  </p>

                  <p className="text-xs text-slate-500">

                    Razorpay secured

                    checkout

                  </p>

                </div>

              </div>

            </div>

            <Accordion

              title="Product Information"

              open={

                detailsOpen

              }

              onToggle={() =>

                setDetailsOpen(

                  !detailsOpen,

                )

              }

            >

              <p>

                {

                  product.description

                }

              </p>

              <p className="mt-4">

                <strong>

                  Fabric:

                </strong>{" "}

                {

                  product.fabric

                }

              </p>

              <p>

                <strong>

                  Fit:

                </strong>{" "}

                {product.fit}

              </p>

              <ul className="mt-4 space-y-2">

                {product.features.map(

                  (

                    feature,

                  ) => (

                    <li

                      key={

                        feature

                      }

                      className="flex gap-2"

                    >

                      <Check

                        size={

                          16

                        }

                        className="mt-1 text-emerald-600"

                      />

                      {

                        feature

                      }

                    </li>

                  ),

                )}

              </ul>

            </Accordion>

            <Accordion

              title="Care Instructions"

              open={careOpen}

              onToggle={() =>

                setCareOpen(

                  !careOpen,

                )

              }

            >

              <ul className="space-y-2">

                {product.careInstructions.map(

                  (

                    instruction,

                  ) => (

                    <li

                      key={

                        instruction

                      }

                    >

                      •{" "}

                      {

                        instruction

                      }

                    </li>

                  ),

                )}

              </ul>

            </Accordion>

          </div>

        </div>

      </section>

      <ProductReviews

        productId={

          product.id

        }

        productSlug={

          product.slug

        }

        productName={

          product.name

        }

        initialReviews={

          product.reviews

        }

        onStatsChange={(

          rating,

          count,

        ) => {

          setLiveRating(

            rating,

          );

          setLiveReviewCount(

            count,

          );

        }}

      />

      {relatedProducts.length >

        0 && (

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-7xl">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">

              You May Also

              Like

            </p>

            <h2 className="mt-3 text-3xl font-black">

              Related Products

            </h2>

            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {relatedProducts.map(

                (

                  relatedProduct,

                ) => (

                  <ProductCard

                    key={

                      relatedProduct.id

                    }

                    product={

                      relatedProduct

                    }

                  />

                ),

              )}

            </div>

          </div>

        </section>

      )}

      {(product.productType === "scrub" || product.productType === "lab-coat") && (

        <EmbroideryCustomizerModal

          open={

            embroideryOpen

          }

          onClose={() =>

            setEmbroideryOpen(

              false,

            )

          }

          productName={

            product.name

          }

          productImage={

            selectedImage

          }

          productColor={

            selectedColor

          }

          initialValue={

            embroidery

          }

          onProceed={(

            value,

          ) => {

            setEmbroidery(

              value,

            );

            setEmbroideryChoice(

              "add",

            );

          }}

        />

      )}

      <SizeGuideModal

        isOpen={

          sizeGuideOpen

        }

        onClose={() =>

          setSizeGuideOpen(

            false,

          )

        }

        category={

          product.category

        }

      />

    </>

  );

}

function SizeSelector({

  title,

  sizes,

  selected,

  onSelect,

  isOutOfStock,

  onGuide,

}: {

  title: string;

  sizes: string[];

  selected: string;

  onSelect:

    (size: string) =>

      void;

  isOutOfStock?:

    (size: string) =>

      boolean;

  onGuide: () =>

    void;

}) {

  return (

    <div className="mt-8">

      <div className="flex items-center justify-between">

        <h2 className="text-sm font-black">

          {title}

        </h2>

        <button

          type="button"

          onClick={

            onGuide

          }

          className="text-sm font-bold text-[#922424] hover:underline"

        >

          Size Guide

        </button>

      </div>

      <div className="mt-4 flex flex-wrap gap-3">

        {sizes.map(

          (size) => {

            const outOfStock =

              isOutOfStock?.(

                size,

              ) ?? false;

            return (

              <button

                key={`${title}-${size}`}

                type="button"

                disabled={

                  outOfStock

                }

                onClick={() => {

                  if (

                    outOfStock

                  ) {

                    return;

                  }

                  onSelect(

                    size,

                  );

                }}

                className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-black ${

                  outOfStock

                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70"

                    : selected ===

                        size

                      ? "border-[#922424] bg-[#922424] text-white"

                      : "border-slate-300 bg-white text-slate-700 hover:border-[#922424]"

                }`}

              >

                <span className="block">

                  {size}

                  {!outOfStock &&

                    size ===

                      "XXL" &&

                    title ===

                      "Bottom Size" && (

                      <span className="ml-1 text-[10px]">

                        +

                      </span>

                    )}

                </span>

                {outOfStock && (

                  <span className="mt-0.5 block text-[9px] font-bold uppercase leading-none">

                    Out of Stock

                  </span>

                )}

              </button>

            );

          },

        )}

      </div>

    </div>

  );

}

function Accordion({

  title,

  open,

  onToggle,

  children,

}: {

  title: string;

  open: boolean;

  onToggle: () =>

    void;

  children:

    React.ReactNode;

}) {

  return (

    <div className="mt-8 border-t border-slate-200">

      <button

        type="button"

        onClick={

          onToggle

        }

        className="flex w-full items-center justify-between py-5 text-left"

      >

        <span className="font-black">

          {title}

        </span>

        {open ? (

          <ChevronUp

            size={20}

          />

        ) : (

          <ChevronDown

            size={20}

          />

        )}

      </button>

      {open && (

        <div className="pb-6 text-sm leading-7 text-slate-600">

          {children}

        </div>

      )}

    </div>

  );

}
