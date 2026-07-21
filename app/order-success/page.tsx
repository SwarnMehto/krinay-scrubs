"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderNumber =
    searchParams.get("orderNumber") ?? "";

  const shippingStatus =
    searchParams.get("shipping") ?? "pending";

  const shiprocketReady =
    shippingStatus === "ready";

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-[#eadada] bg-white shadow-sm">
          <div className="bg-[#922424] px-6 py-10 text-center text-white sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Order placed successfully
            </h1>

            <p className="mt-2 text-sm text-white/85 sm:text-base">
              Thank you for shopping with Krinay Scrubs.
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-10">
            {orderNumber ? (
              <div className="rounded-2xl border border-[#eadada] bg-[#fff7f7] p-5 text-center">
                <p className="text-sm text-gray-600">
                  Your order number
                </p>

                <p className="mt-2 text-xl font-bold text-[#922424]">
                  {orderNumber}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Please save this number for order tracking.
                </p>
              </div>
            ) : null}

            <div
              className={`flex items-start gap-4 rounded-2xl border p-5 ${
                shiprocketReady
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  shiprocketReady
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {shiprocketReady ? (
                  <PackageCheck className="h-6 w-6" />
                ) : (
                  <Clock3 className="h-6 w-6" />
                )}
              </div>

              <div>
                <h2
                  className={`font-semibold ${
                    shiprocketReady
                      ? "text-green-900"
                      : "text-amber-900"
                  }`}
                >
                  {shiprocketReady
                    ? "Ready in Shiprocket"
                    : "Shipping setup pending"}
                </h2>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    shiprocketReady
                      ? "text-green-700"
                      : "text-amber-700"
                  }`}
                >
                  {shiprocketReady
                    ? "Your order has been created in Shiprocket. Courier selection, AWB generation and pickup scheduling will be completed from the Shiprocket panel."
                    : "Your order is confirmed, but Shiprocket synchronization is pending. The order can be synced again from the admin side."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={
                  orderNumber
                    ? `/track-order?orderNumber=${encodeURIComponent(
                        orderNumber,
                      )}`
                    : "/track-order"
                }
                className="flex min-h-12 items-center justify-center rounded-xl bg-[#922424] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#7d1e1e]"
              >
                Track Order
              </Link>

              <Link
                href="/shop"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#922424] px-5 py-3 text-center font-semibold text-[#922424] transition hover:bg-[#fff0f0]"
              >
                <ShoppingBag className="h-5 w-5" />
                Continue Shopping
              </Link>
            </div>

            <Link
              href="/"
              className="block text-center text-sm font-medium text-gray-600 underline-offset-4 hover:text-[#922424] hover:underline"
            >
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fff7f7] px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadada] border-t-[#922424]" />

            <p className="mt-4 text-sm text-gray-600">
              Loading order details...
            </p>
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}