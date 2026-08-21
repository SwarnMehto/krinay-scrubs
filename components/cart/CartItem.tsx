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
  const embroideryPrice = item.embroidery?.price ?? 0;

  const sellingBasePrice =
    item.basePrice ??
    item.price - embroideryPrice;

  const mrp =
    item.mrp ??
    sellingBasePrice;

  const discountPercent =
    item.discountPercent ??
    (mrp > sellingBasePrice
      ? Math.round(
          ((mrp - sellingBasePrice) /
            mrp) *
            100,
        )
      : 0);

  const handleIncrease = () => {
    increaseQuantity(item.productId, item.size, item.color, item.cartKey);
  };

  const handleDecrease = () => {
    decreaseQuantity(item.productId, item.size, item.color, item.cartKey);
  };

  const handleRemove = () => {
    removeFromCart(item.productId, item.size, item.color, item.cartKey);
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
                {item.purchaseType ? (
                  <>
                    <p>
                      Type:{" "}
                      <span className="font-bold capitalize text-slate-800">
                        {item.purchaseType === "set"
                          ? "Complete Set"
                          : item.purchaseType === "top"
                            ? "Top Only"
                            : "Bottom Only"}
                      </span>
                    </p>

                    {item.topSize && (
                      <p>
                        Top Size:{" "}
                        <span className="font-bold text-slate-800">
                          {item.topSize}
                        </span>
                      </p>
                    )}

                    {item.bottomSize && (
                      <p>
                        Bottom Size:{" "}
                        <span className="font-bold text-slate-800">
                          {item.bottomSize}
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    Size:{" "}
                    <span className="font-bold text-slate-800">
                      {item.size}
                    </span>
                  </p>
                )}

                <p>
                  Colour:{" "}
                  <span className="font-bold text-slate-800">
                    {item.color}
                  </span>
                </p>
              </div>

              {item.embroidery && (
                <div className="mt-3 rounded-xl border border-[#eadada] bg-[#fff8f8] px-3 py-2.5 text-xs leading-5 text-slate-600">
                  <p className="font-black text-[#922424]">
                    Customized embroidery · ₹
                    {item.embroidery.price.toLocaleString("en-IN")} per piece
                  </p>

                  {(item.embroidery.line1 || item.embroidery.line2) && (
                    <p className="mt-1">
                      Text: {[item.embroidery.line1, item.embroidery.line2]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  )}

                  {item.embroidery.selectedIconLabel && (
                    <p>
                      Icon: {item.embroidery.selectedIconLabel}
                    </p>
                  )}

                  {item.embroidery.fileName && (
                    <p className="truncate">
                      Logo: {item.embroidery.fileName}
                    </p>
                  )}
                </div>
              )}
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

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-base font-black text-slate-950">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>

                {mrp > sellingBasePrice && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {item.embroidery ? (
                <p className="mt-1 text-[11px] text-slate-500">
                  Scrub ₹
                  {sellingBasePrice.toLocaleString("en-IN")}{" "}
                  + embroidery ₹
                  {embroideryPrice.toLocaleString("en-IN")}
                </p>
              ) : (
                mrp > sellingBasePrice && (
                  <p className="mt-1 text-[11px] text-emerald-700">
                    You save ₹
                    {(mrp - sellingBasePrice).toLocaleString("en-IN")} per piece
                  </p>
                )
              )}
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