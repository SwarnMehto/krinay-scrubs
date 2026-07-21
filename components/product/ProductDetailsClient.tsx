"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";

type ProductDetailsClientProps = {
  product: Product;
  relatedProducts: Product[];
};

const colorMap: Record<string, string> = {
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

  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0] ?? "",
  );

  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] ?? "",
  );

  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);

  const discount =
    product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100,
        )
      : 0;

  const increaseQuantity = () => {
    if (!product.inStock) return;

    if (quantity < product.stock) {
      setQuantity((currentQuantity) => currentQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((currentQuantity) => currentQuantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product.inStock || product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selectedColor) {
      toast.error("Please select a colour");
      return;
    }

    if (quantity < 1) {
      toast.error("Please select a valid quantity");
      return;
    }

    if (quantity > product.stock) {
      toast.error(
        `Only ${product.stock} pieces are available`,
      );
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product.inStock || product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selectedColor) {
      toast.error("Please select a colour");
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    toast.success("Product added. Opening cart...");

    window.location.href = "/cart";
  };

  const toggleWishlist = () => {
    setWishlisted((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }

      return nextValue;
    });
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
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100">
              {product.badge && (
                <span className="absolute left-5 top-5 rounded-full bg-[#922424] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  {product.badge}
                </span>
              )}

              <button
                type="button"
                onClick={toggleWishlist}
                className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full shadow-md transition ${
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

              <div className="text-center">
                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-white/80 text-8xl shadow-sm">
                  🥼
                </div>

                <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                  Krinay Product Image
                </p>
              </div>

              {!product.inStock && (
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 px-4 py-4 text-center text-sm font-bold uppercase tracking-wider text-white">
                  Currently Out of Stock
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`flex aspect-square items-center justify-center rounded-2xl border bg-slate-50 text-4xl transition ${
                    item === 1
                      ? "border-[#922424] ring-2 ring-sky-100"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                  aria-label={`View product image ${item}`}
                >
                  🥼
                </button>
              ))}
            </div>
          </div>

          <div className="lg:py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#922424]">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-amber-500">
                <Star size={16} fill="currentColor" />

                <span className="text-sm font-bold text-slate-800">
                  {product.rating}
                </span>
              </div>

              <span className="text-sm text-slate-500">
                {product.reviewCount} customer reviews
              </span>

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
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {product.originalPrice && (
                <span className="text-lg text-slate-400 line-through">
                  ₹
                  {product.originalPrice.toLocaleString(
                    "en-IN",
                  )}
                </span>
              )}

              {discount > 0 && (
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Save {discount}%
                </span>
              )}
            </div>

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
                    onClick={() => setSelectedColor(color)}
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

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900">
                  Select Size
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    toast("Size guide will be added soon")
                  }
                  className="text-sm font-bold text-[#922424] hover:underline"
                >
                  Size Guide
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      selectedSize === size
                        ? "border-[#922424] bg-[#922424] text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-[#922424]"
                    }`}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

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

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#922424] disabled:cursor-not-allowed disabled:bg-slate-300"
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
                className="rounded-full border-2 border-[#922424] px-6 py-4 text-sm font-bold text-[#922424] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              >
                Buy Now
              </button>
            </div>

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

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#922424]">
                Customer Feedback
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Product Reviews
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                toast("Review form will be added soon")
              }
              className="rounded-full border border-[#922424] px-6 py-3 text-sm font-bold text-[#922424] transition hover:bg-sky-50"
            >
              Write a Review
            </button>
          </div>

          {product.reviews.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {product.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-900">
                        {review.customerName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {review.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={
                              index < review.rating
                                ? "text-amber-500"
                                : "text-slate-300"
                            }
                            fill={
                              index < review.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <Star
                className="mx-auto text-slate-300"
                size={42}
              />

              <h3 className="mt-4 text-lg font-black text-slate-900">
                No reviews yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Is product ke liye pehla review submit
                karein.
              </p>
            </div>
          )}
        </div>
      </section>

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
    </>
  );
}