"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { CartItem as CartItemType } from "@/types/cart";

type CartItemProps = {
  item: CartItemType;
};

export default function CartItem({ item }: CartItemProps) {
  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const itemSubtotal = item.price * item.quantity;

  const handleIncrease = () => {
    increaseQuantity(item.productId, item.size, item.color);
  };

  const handleDecrease = () => {
    decreaseQuantity(item.productId, item.size, item.color);
  };

  const handleRemove = () => {
    removeFromCart(item.productId, item.size, item.color);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex gap-4 sm:gap-6">
        {/* Product image */}
        <Link
          href={`/product/${item.slug}`}
          className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-32"
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              🥼
            </div>
          )}
        </Link>

        {/* Product information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={`/product/${item.slug}`}>
                <h2 className="line-clamp-2 text-sm font-black leading-6 text-slate-950 transition hover:text-[#922424] sm:text-base">
                  {item.name}
                </h2>
              </Link>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 sm:text-sm">
                <p>
                  Size:{" "}
                  <span className="font-bold text-slate-800">
                    {item.size}
                  </span>
                </p>

                <p>
                  Colour:{" "}
                  <span className="font-bold text-slate-800">
                    {item.color}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${item.name} from cart`}
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">Price</p>

              <p className="mt-1 text-base font-black text-slate-950">
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Quantity controller */}
            <div>
              <p className="mb-2 text-center text-xs text-slate-400">
                Quantity
              </p>

              <div className="flex items-center rounded-full border border-slate-300 bg-white p-1">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center text-sm font-black text-slate-900">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncrease}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">Subtotal</p>

              <p className="mt-1 text-lg font-black text-[#922424]">
                ₹{itemSubtotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}