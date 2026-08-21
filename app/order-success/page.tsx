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

  const invoiceHref =
    orderNumber && token
      ? `/invoice/${encodeURIComponent(
          orderNumber,
        )}?token=${encodeURIComponent(
          token,
        )}`
      : "";

  return (
    <main className="min-h-[80vh] bg-slate-50 px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2
            size={42}
          />
        </div>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
          Order Confirmed
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Thank you for your
          order
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600">
          Your Krinay order has
          been received. Shipping
          status will update after
          courier processing.
        </p>

        {orderNumber && (
          <div className="mx-auto mt-7 max-w-md rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Order Number
            </p>

            <p className="mt-2 text-xl font-black text-[#922424]">
              {orderNumber}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {invoiceHref && (
            <Link
              href={
                invoiceHref
              }
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#701a1a]"
            >
              <FileText
                size={18}
              />

              View Invoice
            </Link>
          )}

          <Link
            href="/track-order"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900"
          >
            <PackageSearch
              size={18}
            />

            Track Order
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 sm:col-span-2"
          >
            <ShoppingBag
              size={18}
            />

            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}