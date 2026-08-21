"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
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
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/types/product";

type ProductDetailsClientProps = {
  product: Product;
  relatedProducts: Product[];
};

const colorMap: Record<string, string> = {
  "Airforce Blue": "#5f7898",
  "Navy Blue": "#16375b",
  "Sky Blue": "#60a5fa",
  Black: "#111827",
  Wine: "#881337",
  Lavender: "#c4b5fd",
  "Royal Blue": "#2563eb",
  Grey: "#64748b",
  White: "#ffffff",
  Teal: "#0f766e",
  Pink: "#f472b6",
  Olive: "#657153",
  Green: "#16a34a",
};

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const {
    isWishlisted,
    toggleWishlist: toggleWishlistItem,
  } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  /*
   * Existing single-size state is retained for older products.
   */
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0] ?? "",
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] ?? "",
  );

  /*
   * New scrub purchase flow.
   */
  const [purchaseType, setPurchaseType] =
    useState<ScrubPurchaseType>("set");

  const [selectedTopSize, setSelectedTopSize] =
    useState(
      product.topSizes?.[0] ??
        product.sizes[0] ??
        "",
    );

  const [selectedBottomSize, setSelectedBottomSize] =
    useState(
      product.bottomSizes?.[0] ??
        product.sizes[0] ??
        "",
    );

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);

  const [quantity, setQuantity] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [embroideryOpen, setEmbroideryOpen] = useState(false);
  const [embroidery, setEmbroidery] =
    useState<CartEmbroidery | undefined>(undefined);

  const initialReviewCount =
    product.reviews.length;

  const initialReviewRating =
    initialReviewCount > 0
      ? Number(
          (
            product.reviews.reduce(
              (sum, review) =>
                sum + review.rating,
              0,
            ) / initialReviewCount
          ).toFixed(1),
        )
      : 0;

  const [liveReviewCount, setLiveReviewCount] =
    useState(initialReviewCount);

  const [liveRating, setLiveRating] =
    useState(initialReviewRating);

  const supportsPurchaseOptions =
    product.purchaseOptions === true;

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

  const selectedBasePrice =
    supportsPurchaseOptions
      ? purchaseType === "top"
        ? product.topPrice ??
          product.price
        : purchaseType ===
            "bottom"
          ? product.bottomPrice ??
            product.price
          : product.setPrice ??
            product.price
      : product.price;

  const selectedMrp =
    supportsPurchaseOptions
      ? purchaseType === "top"
        ? product.topOriginalPrice ??
          product.originalPrice ??
          selectedBasePrice
        : purchaseType ===
            "bottom"
          ? product.bottomOriginalPrice ??
            product.originalPrice ??
            selectedBasePrice
          : product.setOriginalPrice ??
            product.originalPrice ??
            selectedBasePrice
      : product.originalPrice ??
        selectedBasePrice;

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

  const increaseQuantity = () => {
    if (!product.inStock) return;

    if (quantity < product.stock) {
      setQuantity(
        (currentQuantity) =>
          currentQuantity + 1,
      );
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(
        (currentQuantity) =>
          currentQuantity - 1,
      );
    }
  };

  const embroideryPrice =
    embroidery?.price ?? 0;

  const finalUnitPrice =
    selectedBasePrice +
    embroideryPrice;

  const currentSizeLabel =
    supportsPurchaseOptions
      ? purchaseType === "set"
        ? `Top ${selectedTopSize} / Bottom ${selectedBottomSize}`
        : purchaseType === "top"
          ? selectedTopSize
          : selectedBottomSize
      : selectedSize;

  const buildCartKey = () => {
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

  const validateSelection = () => {
    if (
      !product.inStock ||
      product.stock <= 0
    ) {
      toast.error(
        "This product is out of stock",
      );
      return false;
    }

    if (!selectedColor) {
      toast.error(
        "Please select a colour",
      );
      return false;
    }

    if (supportsPurchaseOptions) {
      if (
        (purchaseType === "set" ||
          purchaseType === "top") &&
        !selectedTopSize
      ) {
        toast.error(
          "Please select a top size",
        );
        return false;
      }

      if (
        (purchaseType === "set" ||
          purchaseType ===
            "bottom") &&
        !selectedBottomSize
      ) {
        toast.error(
          "Please select a bottom size",
        );
        return false;
      }
    } else if (!selectedSize) {
      toast.error(
        "Please select a size",
      );
      return false;
    }

    if (quantity < 1) {
      toast.error(
        "Please select a valid quantity",
      );
      return false;
    }

    if (
      quantity > product.stock
    ) {
      toast.error(
        `Only ${product.stock} pieces are available`,
      );
      return false;
    }

    return true;
  };

  const buildCartItem = () => {
    const itemName =
      supportsPurchaseOptions
        ? purchaseType === "top"
          ? `${product.name} - Top`
          : purchaseType ===
              "bottom"
            ? `${product.name} - Bottom`
            : product.name
        : product.name;

    return {
      productId: product.id,
      name: itemName,
      slug: product.slug,
      cartKey: buildCartKey(),

      image: selectedImage,

      basePrice:
        selectedBasePrice,

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
        purchaseType !== "bottom"
          ? selectedTopSize
          : undefined,

      bottomSize:
        supportsPurchaseOptions &&
        purchaseType !== "top"
          ? selectedBottomSize
          : undefined,

      mrp: selectedMrp,
      discountPercent:
        discount,
      discountAmount,

      embroidery,
    };
  };

  const handleAddToCart = () => {
    if (!validateSelection()) {
      return;
    }

    addToCart(
      buildCartItem(),
    );

    toast.success(
      `${product.name} added to cart`,
    );
  };

  const handleBuyNow = () => {
    if (!validateSelection()) {
      return;
    }

    addToCart(
      buildCartItem(),
    );

    toast.success(
      "Product added. Opening cart...",
    );

    window.location.href =
      "/cart";
  };

  const handleToggleWishlist = async () => {
    const added = await toggleWishlistItem(product.id);

    toast.success(
      added ? "Added to wishlist" : "Removed from wishlist",
    );
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-[#922424]">
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link href="/shop" className="hover:text-[#922424]">
            Shop
          </Link>

          <span className="mx-2">/</span>

          <span className="text-slate-800">
            {product.name}
          </span>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100">
              {product.badge && (
                <span className="absolute left-5 top-5 z-20 rounded-full bg-[#922424] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  {product.badge}
                </span>
              )}

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full shadow-md transition ${
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
                  size={21}
                  fill={wishlisted ? "currentColor" : "none"}
                />
              </button>

              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={`${product.name} - ${selectedColor}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl">
                  🥼
                </div>
              )}

              {!product.inStock && (
                <div className="absolute inset-x-0 bottom-0 z-20 bg-slate-950/85 px-4 py-4 text-center text-sm font-bold uppercase tracking-wider text-white">
                  Currently Out of Stock
                </div>
              )}
            </div>

            {selectedGallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {selectedGallery.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          index,
                        )
                      }
                      className={`relative aspect-[4/5] overflow-hidden rounded-xl border bg-slate-100 transition ${
                        selectedImageIndex ===
                        index
                          ? "border-[#922424] ring-2 ring-[#922424]/20"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${selectedColor} image ${index + 1}`}
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
            <div className="mb-6 rounded-2xl border border-[#eadada] bg-[#fffafa] p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    Add Your Identity
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Live-preview name, designation, medical icon or
                    custom clinic logo embroidery.
                  </p>

                  {embroidery && (
                    <p className="mt-2 text-xs font-bold text-emerald-700">
                      Selected: {embroidery.mode} embroidery ·
                      {" "}₹{embroidery.price.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEmbroideryOpen(true)}
                  className="rounded-full bg-[#922424] px-5 py-3 text-sm font-black text-white transition hover:bg-[#701a1a]"
                >
                  {embroidery ? "Edit Embroidery" : "Customize Embroidery"}
                </button>
              </div>

              {embroidery && (
                <button
                  type="button"
                  onClick={() => setEmbroidery(undefined)}
                  className="mt-3 text-xs font-bold text-[#922424] underline"
                >
                  Remove embroidery
                </button>
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#922424]">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {liveReviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-amber-500">
                    <Star size={16} fill="currentColor" />

                    <span className="text-sm font-bold text-slate-800">
                      {liveRating}
                    </span>
                  </div>

                  <span className="text-sm text-slate-500">
                    {liveReviewCount}{" "}
                    {liveReviewCount === 1
                      ? "customer review"
                      : "customer reviews"}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-slate-500">
                  No reviews yet
                </span>
              )}

              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                  <Check size={16} />
                  In Stock
                </span>
              ) : (
                <span className="text-sm font-bold text-red-600">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-black text-slate-950">
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
                  Save {discount}%
                </span>
              )}

              {embroidery && (
                <span className="rounded-full bg-[#fff0f0] px-3 py-1.5 text-xs font-bold text-[#922424]">
                  + ₹
                  {embroidery.price.toLocaleString(
                    "en-IN",
                  )}{" "}
                  embroidery
                </span>
              )}
            </div>

            {embroidery && (
              <p className="mt-2 text-sm font-black text-slate-900">
                Final per-piece price: ₹
                {finalUnitPrice.toLocaleString(
                  "en-IN",
                )}
              </p>
            )}

            <p className="mt-6 text-base leading-8 text-slate-600">
              {product.shortDescription}
            </p>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900">
                  Select Colour
                </h2>

                <span className="text-sm font-semibold text-slate-500">
                  {selectedColor || "Not selected"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedImageIndex(0);
                    }}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      selectedColor === color
                        ? "border-[#922424] bg-sky-50 text-[#922424] ring-2 ring-sky-100"
                        : "border-slate-300 text-slate-700 hover:border-slate-500"
                    }`}
                    aria-pressed={selectedColor === color}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-slate-300"
                      style={{
                        backgroundColor:
                          colorMap[color] ?? "#cbd5e1",
                      }}
                    />

                    {color}
                  </button>
                ))}
              </div>
            </div>

            {supportsPurchaseOptions ? (
              <>
                <div className="mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-sm font-black text-slate-900">
                      What do you need?
                    </h2>

                    <span className="text-xs font-bold text-emerald-700">
                      15% launch offer
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {(
                      [
                        {
                          type: "set" as const,
                          title:
                            "Complete Scrub Set",
                          subtitle:
                            "Top + Bottom",
                          price:
                            product.setPrice ??
                            product.price,
                          mrp:
                            product.setOriginalPrice ??
                            product.originalPrice ??
                            product.price,
                        },
                        {
                          type: "top" as const,
                          title:
                            "Scrub Top Only",
                          subtitle:
                            "Select top size",
                          price:
                            product.topPrice ??
                            product.price,
                          mrp:
                            product.topOriginalPrice ??
                            product.originalPrice ??
                            product.price,
                        },
                        {
                          type: "bottom" as const,
                          title:
                            "Scrub Bottom Only",
                          subtitle:
                            "Select bottom size",
                          price:
                            product.bottomPrice ??
                            product.price,
                          mrp:
                            product.bottomOriginalPrice ??
                            product.originalPrice ??
                            product.price,
                        },
                      ]
                    ).map((option) => (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() =>
                          setPurchaseType(
                            option.type,
                          )
                        }
                        className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                          purchaseType ===
                          option.type
                            ? "border-[#922424] bg-[#fff7f7] ring-2 ring-[#922424]/10"
                            : "border-slate-200 bg-white hover:border-[#d8b8b8]"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-black text-slate-950">
                            {option.title}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {
                              option.subtitle
                            }
                          </span>
                        </span>

                        <span className="text-right">
                          <span className="block text-base font-black text-[#922424]">
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
                    ))}
                  </div>
                </div>

                {(purchaseType === "set" ||
                  purchaseType === "top") && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-black text-slate-900">
                        Top Size
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          setSizeGuideOpen(
                            true,
                          )
                        }
                        className="text-sm font-bold text-[#922424] underline-offset-4 transition hover:underline"
                        aria-haspopup="dialog"
                      >
                        Size Guide
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {(
                        product.topSizes ??
                        product.sizes
                      ).map((size) => (
                        <button
                          key={`top-${size}`}
                          type="button"
                          onClick={() =>
                            setSelectedTopSize(
                              size,
                            )
                          }
                          className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                            selectedTopSize ===
                            size
                              ? "border-[#922424] bg-[#922424] text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-[#922424]"
                          }`}
                          aria-pressed={
                            selectedTopSize ===
                            size
                          }
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(purchaseType === "set" ||
                  purchaseType ===
                    "bottom") && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-black text-slate-900">
                        Bottom Size
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          setSizeGuideOpen(
                            true,
                          )
                        }
                        className="text-sm font-bold text-[#922424] underline-offset-4 transition hover:underline"
                        aria-haspopup="dialog"
                      >
                        Size Guide
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {(
                        product.bottomSizes ??
                        product.sizes
                      ).map((size) => (
                        <button
                          key={`bottom-${size}`}
                          type="button"
                          onClick={() =>
                            setSelectedBottomSize(
                              size,
                            )
                          }
                          className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                            selectedBottomSize ===
                            size
                              ? "border-[#922424] bg-[#922424] text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-[#922424]"
                          }`}
                          aria-pressed={
                            selectedBottomSize ===
                            size
                          }
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900">
                    Select Size
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setSizeGuideOpen(true)
                    }
                    className="text-sm font-bold text-[#922424] underline-offset-4 transition hover:underline"
                    aria-haspopup="dialog"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {product.sizes.map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setSelectedSize(
                            size,
                          )
                        }
                        className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                          selectedSize ===
                          size
                            ? "border-[#922424] bg-[#922424] text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-[#922424]"
                        }`}
                        aria-pressed={
                          selectedSize ===
                          size
                        }
                      >
                        {size}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-sm font-black text-slate-900">
                Quantity
              </h2>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-slate-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="w-12 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      !product.inStock ||
                      quantity >= product.stock
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {product.inStock && (
                  <p className="text-xs text-slate-500">
                    {product.stock} pieces available
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-full bg-[#922424] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingBag size={19} />

                {product.inStock
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleBuyNow}
                className="rounded-full border-2 border-[#922424] px-5 py-4 text-sm font-bold text-[#922424] transition hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              >
                Buy Now
              </button>

              {user ? (
                <Link
                  href="/account"
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-4 text-center text-sm font-bold text-slate-800 transition hover:border-[#922424] hover:text-[#922424]"
                >
                  <UserRound size={18} />
                  My Account · {user.points} pts
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/login?next=${encodeURIComponent(
                      `/product/${product.slug}`,
                    )}`}
                    className="flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-3 text-center text-xs font-black text-slate-800 transition hover:border-[#922424] hover:text-[#922424]"
                  >
                    Login
                  </Link>

                  <Link
                    href={`/register?next=${encodeURIComponent(
                      `/product/${product.slug}`,
                    )}`}
                    className="flex items-center justify-center rounded-full bg-[#fff0f0] px-3 py-3 text-center text-xs font-black text-[#922424] transition hover:bg-[#f6dddd]"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {!user && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl bg-[#fff7f7] px-4 py-3 text-xs leading-5 text-slate-600">
                <Gift size={17} className="mt-0.5 shrink-0 text-[#922424]" />
                <p>
                  Account create karo aur 100 welcome points pao.
                  ₹1,599+ qualifying order par 100 points; 1,500
                  points par free customized scrub reward unlock hoga.
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Truck
                  className="mt-0.5 text-[#922424]"
                  size={22}
                />

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Pan India Delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Delivery through trusted courier partners
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 text-[#922424]"
                  size={22}
                />

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Secure Payment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Razorpay secured checkout
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={() =>
                  setDetailsOpen((current) => !current)
                }
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={detailsOpen}
              >
                <span className="font-black text-slate-900">
                  Product Information
                </span>

                {detailsOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {detailsOpen && (
                <div className="pb-6 text-sm leading-7 text-slate-600">
                  <p>{product.description}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Fabric
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {product.fabric}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Fit
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {product.fit}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {product.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3"
                      >
                        <Check
                          className="mt-1 shrink-0 text-emerald-600"
                          size={16}
                        />

                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200">
              <button
                type="button"
                onClick={() =>
                  setCareOpen((current) => !current)
                }
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={careOpen}
              >
                <span className="font-black text-slate-900">
                  Care Instructions
                </span>

                {careOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {careOpen && (
                <ul className="space-y-3 pb-6 text-sm text-slate-600">
                  {product.careInstructions.map(
                    (instruction) => (
                      <li
                        key={instruction}
                        className="flex items-start gap-3"
                      >
                        <Check
                          className="mt-0.5 shrink-0 text-emerald-600"
                          size={16}
                        />

                        {instruction}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProductReviews
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        initialReviews={product.reviews}
        onStatsChange={(rating, count) => {
          setLiveRating(rating);
          setLiveReviewCount(count);
        }}
      />

      {relatedProducts.length > 0 && (
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#922424]">
                  You May Also Like
                </p>

                <h2 className="mt-3 text-3xl font-black text-slate-950">
                  Related Products
                </h2>
              </div>

              <Link
                href="/shop"
                className="hidden text-sm font-bold text-[#922424] sm:block"
              >
                View All
              </Link>
            </div>

            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                />
              ))}
              
            </div>
          </div>
        </section>
      )}

      <EmbroideryCustomizerModal
        open={embroideryOpen}
        onClose={() => setEmbroideryOpen(false)}
        productName={product.name}
        productImage={selectedImage}
        productColor={selectedColor}
        initialValue={embroidery}
        onProceed={setEmbroidery}
      />

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </>
  );
}