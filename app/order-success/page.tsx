import Link from "next/link";

import {
  CheckCircle2,
  FileText,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";

export const dynamic =
  "force-dynamic";

type Props = {
  searchParams: Promise<{
    orderNumber?: string;
    token?: string;
    shippingCharge?: string;
    total?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  const orderNumber =
    params.orderNumber?.trim() ??
    "";

  const token =
    params.token?.trim() ?? "";
  const shippingCharge = Number(params.shippingCharge);
  const orderTotal = Number(params.total);
  const hasPricingSummary =
    params.shippingCharge?.trim() !== "" &&
    params.total?.trim() !== "" &&
    Number.isFinite(shippingCharge) &&
    shippingCharge >= 0 &&
    Number.isFinite(orderTotal) &&
    orderTotal >= 0;

  /*
   * =========================================================
   * INVOICE LINK
   * =========================================================
   *
   * Invoice tab तभी show hoga jab:
   *
   * orderNumber + token
   *
   * dono available hon.
   */

  const invoiceHref =
    orderNumber && token
      ? `/invoice/${encodeURIComponent(
          orderNumber,
        )}?token=${encodeURIComponent(
          token,
        )}`
      : "";

  /*
   * =========================================================
   * TRACK ORDER LINK
   * =========================================================
   *
   * Order number available hai to track page ko
   * order number ke saath open karenge.
   */

  const trackOrderHref =
    orderNumber
      ? `/track-order?orderNumber=${encodeURIComponent(
          orderNumber,
        )}`
      : "/track-order";

  return (
    <main className="min-h-[80vh] bg-slate-50 px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-12">
        {/* =====================================================
            SUCCESS ICON
        ===================================================== */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2
            size={42}
          />
        </div>

        {/* =====================================================
            STATUS
        ===================================================== */}

        <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
          Order Confirmed
        </p>

        {/* =====================================================
            TITLE
        ===================================================== */}

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Thank you for your order
        </h1>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600">
          Your Krinay order has been
          received successfully.
          Shipping and tracking
          details will update after
          courier processing.
        </p>

        {/* =====================================================
            ORDER NUMBER
        ===================================================== */}

        {orderNumber ? (
          <div className="mx-auto mt-7 max-w-md rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Order Number
            </p>

            <p className="mt-2 break-all text-xl font-black text-[#922424]">
              {orderNumber}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Keep this order number
              safe for tracking and
              support.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-7 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-bold text-amber-800">
              Order number is not
              available.
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              If you have completed
              an order, please check
              your order history or
              contact Krinay support.
            </p>
          </div>
        )}

        {hasPricingSummary && (
          <div className="mx-auto mt-4 max-w-md rounded-2xl border border-slate-200 px-5 py-4 text-left">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Delivery charge</span>
              <span className="font-bold text-slate-900">
                {shippingCharge === 0
                  ? "FREE"
                  : `₹${shippingCharge.toLocaleString("en-IN")}`}
              </span>
            </div>
            <div className="mt-3 flex justify-between gap-4 border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-700">Order total</span>
              <span className="font-black text-[#922424]">
                ₹{orderTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {/* =================================================
              VIEW INVOICE
          ================================================= */}

          {invoiceHref && (
            <Link
              href={invoiceHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
            >
              <FileText
                size={18}
              />

              View Invoice
            </Link>
          )}

          {/* =================================================
              TRACK ORDER
          ================================================= */}

          <Link
            href={trackOrderHref}
            className={`inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:border-[#922424] hover:text-[#922424] ${
              !invoiceHref
                ? "sm:col-span-2"
                : ""
            }`}
          >
            <PackageSearch
              size={18}
            />

            Track Order
          </Link>

          {/* =================================================
              CONTINUE SHOPPING
          ================================================= */}

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:border-[#922424] hover:text-[#922424] sm:col-span-2"
          >
            <ShoppingBag
              size={18}
            />

            Continue Shopping
          </Link>
        </div>

        {/* =====================================================
            SUPPORT NOTE
        ===================================================== */}

        <p className="mx-auto mt-8 max-w-lg text-xs leading-6 text-slate-400">
          Shipping status may take
          some time to appear after
          the order is confirmed and
          processed by the courier
          partner.
        </p>
      </section>
    </main>
  );
}