"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { cart, cartCount, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-20">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-[#0b78bd]">
            <ShoppingBag size={42} />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#0b78bd]">
            Your Cart
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            Abhi cart me koi product add nahi hai. Krinay Scrubs collection
            explore karke apne preferred size aur colour ke products add karein.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#063970] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b78bd]"
          >
            <ArrowLeft size={18} />
            Start Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <Link href="/" className="transition hover:text-[#0b78bd]">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="font-semibold text-slate-800">Cart</span>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0b78bd]">
                Shopping Cart
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Review your order
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                {cartCount} {cartCount === 1 ? "item" : "items"} currently in
                your cart
              </p>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 sm:self-auto"
            >
              <Trash2 size={17} />
              Clear Cart
            </button>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              {cart.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.size}-${item.color}`}
                  item={item}
                />
              ))}

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 py-3 text-sm font-bold text-[#0b78bd] transition hover:text-[#063970]"
              >
                <ArrowLeft size={18} />
                Continue Shopping
              </Link>
            </div>

            <CartSummary />
          </div>
        </div>
      </section>
    </>
  );
}