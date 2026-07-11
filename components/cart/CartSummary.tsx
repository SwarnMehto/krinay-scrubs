"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";

export default function CartSummary() {
  const { subtotal, cart } = useCart();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = useMemo(() => {
    if (cart.length === 0) return 0;

    if (subtotal >= 999) return 0;

    return 99;
  }, [subtotal, cart]);

  const taxableAmount = Math.max(subtotal - discount, 0);

const gst = useMemo(() => {
  return Math.round((taxableAmount * 12) / 112);
}, [taxableAmount]);

const grandTotal = taxableAmount + shipping;

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === "WELCOME10") {
      setDiscount(Math.round(subtotal * 0.1));
    } else {
      setDiscount(0);
      alert("Invalid Coupon");
    }
  }

  return (
    <aside className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-black text-slate-900">
        Order Summary
      </h2>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Coupon
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="WELCOME10"
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-[#0b78bd]"
              />
            </div>

            <button
              onClick={applyCoupon}
              className="rounded-xl bg-[#063970] px-5 text-white transition hover:bg-[#0b78bd]"
            >
              Apply
            </button>
          </div>
        </div>

        <hr />

        <div className="flex justify-between text-sm">
          <span>Subtotal</span>

          <span className="font-bold">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Discount</span>

          <span className="font-bold text-green-600">
            -₹{discount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Shipping</span>

          {shipping === 0 ? (
            <span className="font-bold text-green-600">FREE</span>
          ) : (
            <span className="font-bold">
              ₹{shipping.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span>Included GST</span>

          <span className="font-bold">
            ₹{gst.toLocaleString("en-IN")}
          </span>
        </div>

        <hr />

        <div className="flex justify-between text-xl font-black">
          <span>Total</span>

          <span className="text-[#063970]">
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
        </div>

        <button
  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#063970] px-6 py-4 font-bold text-white transition hover:bg-[#0b78bd]"
>
  Proceed To Checkout
  <ArrowRight size={18} />
</button>

        <Link
  href="/checkout"
  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#063970] px-6 py-4 font-bold text-white transition hover:bg-[#0b78bd]"
>
  Proceed To Checkout
  <ArrowRight size={18} />
</Link>
      </div>
    </aside>
  );
}