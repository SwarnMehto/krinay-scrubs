"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCart } from "@/hooks/useCart";
import { calculateShippingCharge } from "@/lib/shipping";

type CartItemForSummary = {
  quantity?: number;
  color?: string;

  /*
   * Depending on your cart model,
   * original MRP can be stored under
   * either originalPrice or mrp.
   */
  originalPrice?: number;
  mrp?: number;

  /*
   * basePrice = product selling price
   * without embroidery.
   */
  basePrice?: number;

  /*
   * price may already include embroidery.
   */
  price?: number;

  embroidery?: {
    enabled?: boolean;
    price?: number;
  };
};

export default function CartSummary() {
  const {
    subtotal,
    cart,
  } = useCart();

  const [
    coupon,
    setCoupon,
  ] = useState("");

  const [
    isCouponApplied,
    setIsCouponApplied,
  ] = useState(false);

  const [
    couponMessage,
    setCouponMessage,
  ] = useState("");

  /*
   * Coupon ko cart -> checkout same browser tab me
   * carry karne ke liye sessionStorage use hota hai.
   * Checkout par dobara code enter karna zaroori nahi.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedCoupon =
      window.sessionStorage.getItem(
        "krinay_applied_coupon",
      );

    if (savedCoupon === "SHUBHAM10") {
      setCoupon("SHUBHAM10");
      setIsCouponApplied(true);
    }
  }, []);

  /*
   * =========================================
   * PRODUCT DISCOUNT
   * =========================================
   *
   * Example:
   *
   * MRP          ₹2499
   * Selling      ₹1699
   * Saving       ₹800
   *
   * Embroidery is an add-on and is not
   * included in product discount.
   */
  const productDiscount =
    useMemo(() => {
      const items =
        cart as CartItemForSummary[];

      return items.reduce(
        (
          totalDiscount,
          item,
        ) => {
          const quantity =
            Number(
              item.quantity ?? 1,
            ) || 1;

          const embroideryPrice =
            Number(
              item.embroidery
                ?.price ?? 0,
            ) || 0;

          const finalItemPrice =
            Number(
              item.price ?? 0,
            ) || 0;

          /*
           * Prefer basePrice if available.
           *
           * Otherwise derive selling product
           * price by removing embroidery from
           * final cart price.
           */
          const sellingProductPrice =
            Number(
              item.basePrice ??
                Math.max(
                  finalItemPrice -
                    embroideryPrice,
                  0,
                ),
            ) || 0;

          const productMrp =
            Number(
              item.mrp ??
                item.originalPrice ??
                sellingProductPrice,
            ) || sellingProductPrice;

          const savingPerItem =
            Math.max(
              productMrp -
                sellingProductPrice,
              0,
            );

          return (
            totalDiscount +
            savingPerItem * quantity
          );
        },
        0,
      );
    }, [cart]);

  /*
   * Current subtotal already contains the
   * discounted selling price + embroidery.
   *
   * So original MRP value can be reconstructed
   * by adding product saving back.
   */
  const mrpValue =
    subtotal + productDiscount;

  /*
   * =========================================
   * SHIPPING
   * =========================================
   */
  const shipping = useMemo(() => {
    return calculateShippingCharge(
      subtotal,
      0,
      "prepaid",
    );
  }, [
    subtotal,
  ]);
  const hasEmbroidery = cart.some((item) =>
    Boolean(item.embroidery),
  );
  const couponEligibleSubtotal = useMemo(() => {
    return (cart as CartItemForSummary[]).reduce((total, item) => {
      const normalizedColor = String(item.color ?? "")
        .trim()
        .toLowerCase();
      const eligible =
        normalizedColor === "airforce blue" ||
        normalizedColor === "airforce" ||
        normalizedColor === "royal blue" ||
        normalizedColor === "black" ||
        normalizedColor === "wine" ||
        normalizedColor === "olive" ||
        normalizedColor === "mediterranean olive";

      if (!eligible) {
        return total;
      }

      const quantity = Number(item.quantity ?? 1) || 1;
      const embroideryPrice = Number(item.embroidery?.price ?? 0) || 0;
      const finalItemPrice = Number(item.price ?? 0) || 0;
      const sellingProductPrice =
        Number(
          item.basePrice ??
            Math.max(finalItemPrice - embroideryPrice, 0),
        ) || 0;

      return (
        total +
        (sellingProductPrice + embroideryPrice) * quantity
      );
    }, 0);
  }, [cart]);

  const couponDiscount = useMemo(() => {
    if (!isCouponApplied || couponEligibleSubtotal <= 0) {
      return 0;
    }

    return Math.round(((couponEligibleSubtotal * 10) / 100) * 100) / 100;
  }, [couponEligibleSubtotal, isCouponApplied]);
  const codShipping = calculateShippingCharge(
    subtotal,
    couponDiscount,
    "cod",
  );

  /*
   * Product discount is already reflected
   * inside subtotal.
   *
   * Only coupon discount needs to be
   * subtracted here.
   */
  const taxableAmount =
    Math.max(
      subtotal -
        couponDiscount,
      0,
    );

  /*
   * =========================================
   * GST
   * =========================================
   *
   * Product prices are GST-inclusive.
   *
   * Included GST @ 5%:
   *
   * GST =
   * Inclusive Price × 5 / 105
   *
   * GST is shown only for information.
   * It is NOT added again to total.
   */
  const gst = useMemo(() => {
    return Math.round(
      (taxableAmount * 5) /
        105,
    );
  }, [taxableAmount]);

  /*
   * =========================================
   * FINAL TOTAL
   * =========================================
   */
  const grandTotal =
    taxableAmount +
    shipping;

  /*
   * =========================================
   * COUPON
   * =========================================
   *
   * Currently no coupon is enabled.
   *
   * Future me coupon add karna ho toh
   * yahin code add kar sakte hain.
   */
  const applyCoupon = () => {
    const normalizedCoupon =
      coupon
        .trim()
        .toUpperCase();

    if (!normalizedCoupon) {
      setIsCouponApplied(false);

      setCouponMessage(
        "Please enter a coupon code.",
      );

      return;
    }

    if (normalizedCoupon !== "SHUBHAM10") {
      setIsCouponApplied(false);
      setCouponMessage(
        "Invalid coupon code.",
      );
      return;
    }

    if (couponEligibleSubtotal <= 0) {
      setIsCouponApplied(false);
      setCouponMessage(
        "SHUBHAM10 is valid only on scrub products.",
      );
      return;
    }

    setCoupon("SHUBHAM10");
    setIsCouponApplied(true);
    setCouponMessage(
      "SHUBHAM10 applied — 10% off on eligible scrubs.",
    );

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "krinay_applied_coupon",
        "SHUBHAM10",
      );
    }
  };

  return (
    <aside className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-black text-slate-900">
        Order Summary
      </h2>

      <div className="mt-6 space-y-5">
        {/* ===============================
            COUPON
        =============================== */}

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
                onChange={(
                  event,
                ) => {
                  setCoupon(
                    event.target.value,
                  );

                  setIsCouponApplied(false);
                  setCouponMessage("");

                  if (typeof window !== "undefined") {
                    window.sessionStorage.removeItem(
                      "krinay_applied_coupon",
                    );
                  }
                }}
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
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
              onClick={
                applyCoupon
              }
              className="rounded-xl bg-[#922424] px-5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
            >
              Apply
            </button>
          </div>

          {couponMessage && (
            <p
              className={`mt-2 text-xs font-semibold ${
                couponDiscount >
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {isCouponApplied && couponEligibleSubtotal <= 0
                ? "SHUBHAM10 is valid only on scrub products."
                : couponMessage}
            </p>
          )}
        </div>

        <hr className="border-slate-200" />

        {/* ===============================
            MRP VALUE
        =============================== */}

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            MRP Value
          </span>

          <span className="font-bold text-slate-900">
            ₹
            {mrpValue.toLocaleString(
              "en-IN",
            )}
          </span>
        </div>

        {/* ===============================
            PRODUCT DISCOUNT
        =============================== */}

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Product Discount
          </span>

          <span
            className={`font-bold ${
              productDiscount >
              0
                ? "text-green-600"
                : "text-slate-900"
            }`}
          >
            {productDiscount >
            0
              ? `-₹${productDiscount.toLocaleString(
                  "en-IN",
                )}`
              : "₹0"}
          </span>
        </div>

        {/* ===============================
            SUBTOTAL
        =============================== */}

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Subtotal
          </span>

          <span className="font-bold text-slate-900">
            ₹
            {subtotal.toLocaleString(
              "en-IN",
            )}
          </span>
        </div>

        {/* ===============================
            COUPON DISCOUNT
        =============================== */}

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Coupon Discount
          </span>

          <span
            className={`font-bold ${
              couponDiscount >
              0
                ? "text-green-600"
                : "text-slate-900"
            }`}
          >
            {couponDiscount >
            0
              ? `-₹${couponDiscount.toLocaleString(
                  "en-IN",
                )}`
              : "₹0"}
          </span>
        </div>

        {/* ===============================
            SHIPPING
        =============================== */}

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Shipping
          </span>

          {shipping === 0 ? (
            <span className="font-bold text-green-600">
              FREE
            </span>
          ) : (
            <span className="font-bold text-slate-900">
              ₹
              {shipping.toLocaleString(
                "en-IN",
              )}
            </span>
          )}
        </div>

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            COD delivery charge
          </span>

          <span className="text-right font-bold text-slate-900">
            {hasEmbroidery
              ? "Unavailable with embroidery"
              : `₹${codShipping.toLocaleString("en-IN")}`}
          </span>
        </div>
        {!hasEmbroidery && (
          <p className="-mt-4 text-right text-xs text-slate-400">
            Added only if Cash on Delivery is selected.
          </p>
        )}

        {/* ===============================
            GST
        =============================== */}

        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Included GST (5%)
          </span>

          <span className="font-bold text-slate-900">
            ₹
            {gst.toLocaleString(
              "en-IN",
            )}
          </span>
        </div>

        <hr className="border-slate-200" />

        {/* ===============================
            TOTAL
        =============================== */}

        <div className="flex justify-between gap-4 text-xl font-black">
          <span className="text-slate-950">
            Total
          </span>

          <span className="text-[#922424]">
            ₹
            {grandTotal.toLocaleString(
              "en-IN",
            )}
          </span>
        </div>

        {/* ===============================
            CHECKOUT
        =============================== */}

        <Link
          href="/checkout"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#701a1a]"
        >
          Proceed To Checkout

          <ArrowRight
            size={18}
          />
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