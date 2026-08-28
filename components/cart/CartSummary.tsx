"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { useMemo, useState } from "react";

import { useCart } from "@/hooks/useCart";

export default function CartSummary() {
  const { subtotal, cart } = useCart();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const shipping = useMemo(() => {
    if (cart.length === 0) {
      return 0;
    }

    return subtotal >= 999 ? 0 : 99;
  }, [subtotal, cart.length]);

  const taxableAmount = Math.max(subtotal - discount, 0);

  /*
   * Product prices GST-inclusive hain.
   * GST ko total me dobara add nahi kiya ja raha.
   */
  const gst = useMemo(() => {
    return Math.round((taxableAmount * 12) / 112);
  }, [taxableAmount]);

  const grandTotal = taxableAmount + shipping;

  const applyCoupon = () => {
    const normalizedCoupon = coupon.trim().toUpperCase();

    if (!normalizedCoupon) {
      setDiscount(0);
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (normalizedCoupon === "") {
      const couponDiscount = Math.round(subtotal * 0.1);

      setCoupon("");
      setDiscount(couponDiscount);
      setCouponMessage(" applied successfully.");
      return;
    }

    setDiscount(0);
    setCouponMessage("Invalid coupon code.");
  };

  return (
    <aside className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-black text-slate-900">
        Order Summary
      </h2>

      <div className="mt-6 space-y-5">
        {/* Coupon */}
        <div>
          <label
            htmlFor="cart-coupon"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Coupon
          </label>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Tag
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="cart-coupon"
                type="text"
                value={coupon}
                onChange={(event) => {
                  setCoupon(event.target.value);
                  setCouponMessage("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyCoupon();
                  }
                }}
                placeholder=""
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
              />
            </div>

            <button
              type="button"
              onClick={applyCoupon}
              className="rounded-xl bg-[#922424] px-5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
            >
              Apply
            </button>
          </div>

          {couponMessage && (
            <p
              className={`mt-2 text-xs font-semibold ${
                discount > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {couponMessage}
            </p>
          )}
        </div>

        <hr className="border-slate-200" />

        {/* Pricing */}
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">Subtotal</span>

          <span className="font-bold text-slate-900">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">Discount</span>

          <span
            className={`font-bold ${
              discount > 0
                ? "text-green-600"
                : "text-slate-900"
            }`}
          >
            {discount > 0
              ? `-₹${discount.toLocaleString("en-IN")}`
              : "₹0"}
          </span>
        </div>

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">Shipping</span>

          {shipping === 0 ? (
            <span className="font-bold text-green-600">
              FREE
            </span>
          ) : (
            <span className="font-bold text-slate-900">
              ₹{shipping.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Included GST
          </span>

          <span className="font-bold text-slate-900">
            ₹{gst.toLocaleString("en-IN")}
          </span>
        </div>

        <hr className="border-slate-200" />

        {/* Total */}
        <div className="flex justify-between gap-4 text-xl font-black">
          <span className="text-slate-950">Total</span>

          <span className="text-[#922424]">
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Only one checkout button */}
        <Link
          href="/checkout"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#701a1a]"
        >
          Proceed To Checkout
          <ArrowRight size={18} />
        </Link>

        <Link
          href="/shop"
          className="block text-center text-sm font-bold text-[#922424] transition hover:text-[#701a1a]"
        >
          Continue Shopping
        </Link>
      </div>
    </aside>
  );
}