"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

type InvoiceLine = {
  id: string;
  name: string;
  description: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image: string;
  type:
    | "top"
    | "bottom"
    | "product"
    | "embroidery";
};

type InvoiceData = {
  invoiceNumber: string;
  orderNumber: string;
  createdAt: string;

  paymentMethod: string;
  paymentStatus: string;
  paymentLabel: string;

  razorpayPaymentId: string;

  orderStatus: string;

  seller: {
    name: string;
    brand: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
    hsn: string;
  };

  customer: {
    fullName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };

  items: InvoiceLine[];

  pricing: {
    subtotal: number;
    discount: number;
    taxableValue: number;
    shippingCharge: number;

    gstRate: number;
    gstIncluded: number;

    cgst: number;
    sgst: number;
    igst: number;

    total: number;
  };
};

type InvoiceApiResponse = {
  success: boolean;
  message?: string;
  invoice?: InvoiceData;
};

type Props = {
  orderNumber: string;
  token: string;
};

function money(
  value: number,
) {
  return `₹${Number(
    value,
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvoiceClient({
  orderNumber,
  token,
}: Props) {
  const [
    invoice,
    setInvoice,
  ] =
    useState<InvoiceData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInvoice() {
      if (!token) {
        setError(
          "Invoice access token missing hai.",
        );

        setLoading(false);

        return;
      }

      try {
        const response =
          await fetch(
            `/api/invoice?orderNumber=${encodeURIComponent(
              orderNumber,
            )}&token=${encodeURIComponent(
              token,
            )}`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as InvoiceApiResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.invoice
        ) {
          throw new Error(
            result.message ||
              "Invoice load nahi ho paya.",
          );
        }

        if (!cancelled) {
          setInvoice(
            result.invoice,
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Invoice load nahi ho paya.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [
    orderNumber,
    token,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#922424]" />
      </div>
    );
  }

  if (!invoice || error) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black">
          Invoice unavailable
        </h1>

        <p className="mt-4 text-slate-500">
          {error ||
            "Invoice nahi mila."}
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#922424] px-6 py-3 font-bold text-white"
        >
          Back Home
        </Link>
      </section>
    );
  }

  const date =
    new Date(
      invoice.createdAt,
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={`/order-success?orderNumber=${encodeURIComponent(
              invoice.orderNumber,
            )}&token=${encodeURIComponent(
              token,
            )}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#922424]"
          >
            <ArrowLeft
              size={18}
            />

            Back to Order
          </Link>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold"
            >
              <Printer
                size={17}
              />

              Print
            </button>

            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#922424] px-5 py-3 text-sm font-bold text-white"
            >
              <Download
                size={17}
              />

              Download PDF
            </button>
          </div>
        </div>

        <article className="overflow-hidden rounded-3xl bg-white shadow-sm print:rounded-none print:shadow-none">
          <div className="border-b-4 border-[#922424] p-7 sm:p-10">
            <div className="flex flex-col justify-between gap-6 sm:flex-row">
              <div>
                <p className="text-3xl font-black tracking-tight text-[#922424]">
                  KRINAY
                </p>

                <p className="mt-1 text-sm font-bold tracking-[0.22em] text-slate-500">
                  SCRUBS
                </p>

                {invoice.seller.name && (
                  <p className="mt-5 font-bold text-slate-900">
                    {
                      invoice
                        .seller.name
                    }
                  </p>
                )}

                {invoice.seller.address && (
                  <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                    {
                      invoice
                        .seller.address
                    }
                  </p>
                )}

                {invoice.seller.gstin && (
                  <p className="mt-2 text-sm font-semibold">
                    GSTIN:{" "}
                    {
                      invoice
                        .seller.gstin
                    }
                  </p>
                )}
              </div>

              <div className="sm:text-right">
                <h1 className="text-2xl font-black">
                  {invoice.seller
                    .gstin
                    ? "TAX INVOICE"
                    : "ORDER RECEIPT"}
                </h1>

                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="text-slate-500">
                      Invoice No:
                    </span>{" "}
                    <strong>
                      {
                        invoice
                          .invoiceNumber
                      }
                    </strong>
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Order No:
                    </span>{" "}
                    <strong>
                      {
                        invoice
                          .orderNumber
                      }
                    </strong>
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Date:
                    </span>{" "}
                    <strong>
                      {date}
                    </strong>
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Payment:
                    </span>{" "}
                    <strong>
                      {
                        invoice
                          .paymentLabel
                      }
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 border-b border-slate-200 p-7 sm:grid-cols-2 sm:p-10">
            <section>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#922424]">
                Bill To
              </p>

              <h2 className="mt-3 text-lg font-black">
                {
                  invoice
                    .customer
                    .fullName
                }
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  invoice
                    .customer
                    .addressLine1
                }

                {invoice.customer
                  .addressLine2 &&
                  `, ${invoice.customer.addressLine2}`}

                <br />

                {invoice.customer
                  .city}
                ,{" "}
                {
                  invoice
                    .customer
                    .state
                }{" "}
                -{" "}
                {
                  invoice
                    .customer
                    .pinCode
                }

                <br />

                {
                  invoice
                    .customer
                    .country
                }
              </p>
            </section>

            <section className="sm:text-right">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#922424]">
                Contact
              </p>

              <p className="mt-3 text-sm font-semibold">
                +91{" "}
                {
                  invoice
                    .customer
                    .phone
                }
              </p>

              {invoice.customer
                .email && (
                <p className="mt-1 text-sm text-slate-600">
                  {
                    invoice
                      .customer
                      .email
                  }
                </p>
              )}

              {invoice
                .razorpayPaymentId && (
                <p className="mt-4 text-xs text-slate-500">
                  Payment ID:{" "}
                  {
                    invoice
                      .razorpayPaymentId
                  }
                </p>
              )}
            </section>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">
                    Item
                  </th>

                  <th className="px-4 py-4">
                    Size
                  </th>

                  <th className="px-4 py-4">
                    Colour
                  </th>

                  <th className="px-4 py-4 text-center">
                    Qty
                  </th>

                  <th className="px-4 py-4 text-right">
                    Rate
                  </th>

                  <th className="px-6 py-4 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoice.items.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold">
                          {
                            item.name
                          }
                        </p>

                        {item.description && (
                          <p className="mt-1 text-xs text-slate-500">
                            {
                              item.description
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-5 text-sm">
                        {item.size ||
                          "—"}
                      </td>

                      <td className="px-4 py-5 text-sm">
                        {item.color ||
                          "—"}
                      </td>

                      <td className="px-4 py-5 text-center text-sm">
                        {
                          item.quantity
                        }
                      </td>

                      <td className="px-4 py-5 text-right text-sm">
                        {money(
                          item.unitPrice,
                        )}
                      </td>

                      <td className="px-6 py-5 text-right font-bold">
                        {money(
                          item.total,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-8 border-t border-slate-200 p-7 sm:grid-cols-2 sm:p-10">
            <div>
              {invoice.seller.hsn && (
                <p className="text-sm text-slate-500">
                  HSN:{" "}
                  <strong className="text-slate-900">
                    {
                      invoice
                        .seller.hsn
                    }
                  </strong>
                </p>
              )}

              <p className="mt-4 max-w-sm text-xs leading-6 text-slate-500">
                Prices shown are
                inclusive of applicable
                GST. This invoice is
                computer generated.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-5">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <strong>
                  {money(
                    invoice
                      .pricing
                      .subtotal,
                  )}
                </strong>
              </div>

              {invoice.pricing
                .discount >
                0 && (
                <div className="flex justify-between gap-5 text-emerald-700">
                  <span>
                    Discount
                  </span>

                  <strong>
                    -
                    {money(
                      invoice
                        .pricing
                        .discount,
                    )}
                  </strong>
                </div>
              )}

              <div className="flex justify-between gap-5">
                <span className="text-slate-500">
                  Taxable Value
                </span>

                <strong>
                  {money(
                    invoice
                      .pricing
                      .taxableValue,
                  )}
                </strong>
              </div>

              {invoice.pricing
                .cgst >
                0 && (
                <>
                  <div className="flex justify-between gap-5">
                    <span className="text-slate-500">
                      CGST @ 2.5%
                    </span>

                    <strong>
                      {money(
                        invoice
                          .pricing
                          .cgst,
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-5">
                    <span className="text-slate-500">
                      SGST @ 2.5%
                    </span>

                    <strong>
                      {money(
                        invoice
                          .pricing
                          .sgst,
                      )}
                    </strong>
                  </div>
                </>
              )}

              {invoice.pricing
                .igst >
                0 && (
                <div className="flex justify-between gap-5">
                  <span className="text-slate-500">
                    IGST @ 5%
                  </span>

                  <strong>
                    {money(
                      invoice
                        .pricing
                        .igst,
                    )}
                  </strong>
                </div>
              )}

              <div className="flex justify-between gap-5">
                <span className="text-slate-500">
                  Included GST
                  (5%)
                </span>

                <strong>
                  {money(
                    invoice
                      .pricing
                      .gstIncluded,
                  )}
                </strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-slate-500">
                  Shipping
                </span>

                <strong>
                  {invoice.pricing
                    .shippingCharge ===
                  0
                    ? "FREE"
                    : money(
                        invoice
                          .pricing
                          .shippingCharge,
                      )}
                </strong>
              </div>

              <div className="mt-4 flex justify-between gap-5 border-t border-slate-300 pt-4 text-xl">
                <span className="font-black">
                  Total
                </span>

                <span className="font-black text-[#922424]">
                  {money(
                    invoice
                      .pricing
                      .total,
                  )}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <style jsx global>{`
        @media print {
          header,
          footer,
          nav {
            display: none !important;
          }

          body {
            background: white !important;
          }

          @page {
            margin: 12mm;
            size: A4;
          }
        }
      `}</style>
    </main>
  );
}