"use client";

import {
  Check,
  Package,
  Search,
  Truck,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";

type TrackingResult = {
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shipmentApprovalStatus: string;
  courierName: string;
  awbCode: string;
  trackingUrl: string;
  shiprocketReady: boolean;
};

const normalFlow = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [result, setResult] =
    useState<TrackingResult | null>(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/api/orders/track",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderNumber,
            phone,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Order nahi mila.",
        );
      }

      setResult(data.order);
    } catch (trackError) {
      setError(
        trackError instanceof Error
          ? trackError.message
          : "Unable to track order.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = result
    ? normalFlow.indexOf(result.orderStatus)
    : -1;

  return (
    <>
      <section className="bg-[#922424] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Package
            size={42}
            className="mx-auto"
          />

          <h1 className="mt-5 text-4xl font-black sm:text-5xl">
            Track your order
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Apna Krinay order number aur registered
            phone number enter karein.
          </p>
        </div>
      </section>

      <section className="bg-[#fffafa] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#eadada] bg-white p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Order number
                </label>

                <input
                  value={orderNumber}
                  onChange={(event) =>
                    setOrderNumber(
                      event.target.value,
                    )
                  }
                  required
                  placeholder="Example: KRN260717123456"
                  className="w-full rounded-xl border border-[#decaca] px-4 py-3 outline-none focus:border-[#922424]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Registered phone number
                </label>

                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-[#decaca] px-4 py-3 outline-none focus:border-[#922424]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 font-bold text-white hover:bg-[#701a1a] disabled:bg-black/40"
            >
              <Search size={18} />
              {loading
                ? "Checking..."
                : "Track Order"}
            </button>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}
          </form>

          {result && (
            <section className="mt-8 rounded-3xl border border-[#eadada] bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[#eadada] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-black/45">
                    Order number
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#922424]">
                    {result.orderNumber}
                  </h2>
                </div>

                <span className="w-fit rounded-full bg-[#fff0f0] px-4 py-2 text-sm font-bold text-[#922424]">
                  {formatStatus(
                    result.orderStatus,
                  )}
                </span>
              </div>

              {[
                "cancelled",
                "returned",
              ].includes(result.orderStatus) ? (
                <div className="mt-7 rounded-xl bg-red-50 p-5 font-semibold text-red-600">
                  Order status:{" "}
                  {formatStatus(
                    result.orderStatus,
                  )}
                </div>
              ) : (
                <div className="mt-8 space-y-5">
                  {normalFlow.map(
                    (status, index) => {
                      const completed =
                        index <= currentIndex;

                      return (
                        <div
                          key={status}
                          className="flex gap-4"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              completed
                                ? "bg-[#922424] text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {completed ? (
                              <Check size={17} />
                            ) : (
                              <Truck size={17} />
                            )}
                          </div>

                          <div>
                            <p
                              className={`font-bold ${
                                completed
                                  ? "text-black"
                                  : "text-black/35"
                              }`}
                            >
                              {formatStatus(status)}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              <div className="mt-8 grid gap-4 rounded-2xl bg-[#fffafa] p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-black/45">
                    Payment
                  </p>
                  <p className="mt-1 font-bold text-black">
                    {formatStatus(
                      result.paymentStatus,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black/45">
                    Courier
                  </p>
                  <p className="mt-1 font-bold text-black">
                    {result.courierName ||
                      "Not assigned yet"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black/45">
                    AWB number
                  </p>
                  <p className="mt-1 font-bold text-black">
                    {result.awbCode ||
                      "Pending"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black/45">
                    Shiprocket
                  </p>
                  <p className="mt-1 font-bold text-black">
                    {result.shiprocketReady
                      ? "Order created"
                      : "Sync pending"}
                  </p>
                </div>
              </div>

              {result.trackingUrl && (
                <a
                  href={result.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-[#922424] px-6 py-4 font-bold text-white"
                >
                  Open Courier Tracking
                </a>
              )}
            </section>
          )}
        </div>
      </section>
    </>
  );
}