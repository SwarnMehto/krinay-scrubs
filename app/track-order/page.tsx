"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type TrackingActivity = {
  date: string;
  status: string;
  activity: string;
  location: string;
};

type ProgressStep = {
  key:
    | "confirmed"
    | "courier_assigned"
    | "pickup_scheduled"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered";

  label: string;
  done: boolean;
  current: boolean;
};

type TrackingResult = {
  trackingId: string;
  orderNumber: string;

  orderStatus: string;
  statusLabel: string;
  rawCourierStatus: string;

  paymentStatus: string;

  courierName: string;
  awbCode: string;
  trackingUrl: string;

  estimatedDelivery: string;

  activities: TrackingActivity[];

  latestActivity:
    | TrackingActivity
    | null;

  progress: ProgressStep[];

  shipmentCreated: boolean;
  awaitingCourierAssignment: boolean;

  shiprocketSynced: boolean;
  liveTrackingAvailable: boolean;

  lastSyncedAt: string;

  liveTrackingMessage: string;
};

type TrackApiResponse = {
  success: boolean;
  message?: string;
  tracking?: TrackingResult;
};

function formatDate(
  value: string,
) {
  if (!value) {
    return "";
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(parsed);
}

function humanizeStatus(
  value: string,
) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function paymentLabel(
  value: string,
) {
  const normalized =
    value
      .trim()
      .toLowerCase();

  const labels: Record<
    string,
    string
  > = {
    pending: "Payment Pending",
    paid: "Paid",
    failed: "Payment Failed",
    cod_pending:
      "Cash on Delivery",
    refunded: "Refunded",
  };

  return (
    labels[normalized] ||
    humanizeStatus(value)
  );
}

export default function TrackOrderPage() {
  const [
    trackingId,
    setTrackingId,
  ] = useState("");

  const [
    result,
    setResult,
  ] =
    useState<TrackingResult | null>(
      null,
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const loadTracking =
    async (
      cleanId: string,
    ) => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/orders/track",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  trackingId:
                    cleanId,
                }),

              cache: "no-store",
            },
          );

        const data =
          (await response.json()) as TrackApiResponse;

        if (
          !response.ok ||
          !data.success ||
          !data.tracking
        ) {
          throw new Error(
            data.message ||
              "Tracking details nahi mil paayi.",
          );
        }

        setResult(
          data.tracking,
        );
      } catch (trackError) {
        setError(
          trackError instanceof Error
            ? trackError.message
            : "Tracking details nahi mil paayi.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const cleanId =
        trackingId.trim();

      if (!cleanId) {
        setError(
          "Order ID / Tracking ID enter karo.",
        );

        return;
      }

      setResult(null);

      await loadTracking(
        cleanId,
      );
    };

  const refreshTracking =
    async () => {
      if (!result) {
        return;
      }

      await loadTracking(
        result.orderNumber,
      );
    };

  return (
    <>
      <section className="border-b border-[#eadada] bg-[#fffafa] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
            KRINAY DELIVERY
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Track your order
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Checkout ke baad mila
            <strong className="text-slate-900">
              {" "}
              Krinay Order ID
            </strong>{" "}
            ya courier AWB enter karo.
            Courier assign hone ke baad
            latest Shiprocket movement
            yahin update hogi.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
          >
            <div className="flex min-w-0 flex-1 items-center rounded-2xl bg-slate-50 px-4">
              <Search
                size={19}
                className="shrink-0 text-slate-400"
              />

              <input
                value={
                  trackingId
                }
                onChange={(
                  event,
                ) =>
                  setTrackingId(
                    event.target
                      .value,
                  )
                }
                placeholder="Example: KRN260821938133"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-[#922424] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Tracking..."
                : "Track Order"}
            </button>
          </form>

          {error && (
            <div className="mx-auto mt-4 flex max-w-2xl items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              {error}
            </div>
          )}
        </div>
      </section>

      {result && (
        <section className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Latest status
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {result.statusLabel ||
                    humanizeStatus(
                      result.orderStatus,
                    )}
                </h2>

                {result.latestActivity && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {result.latestActivity
                      .activity ||
                      result.latestActivity
                        .status}

                    {result.latestActivity
                      .location
                      ? ` • ${result.latestActivity.location}`
                      : ""}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  void refreshTracking()
                }
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#922424] px-5 py-2.5 text-sm font-black text-[#922424] transition hover:bg-[#fff4f4] disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatusCard
                label="Order ID"
                value={
                  result.orderNumber
                }
                icon={
                  <PackageCheck
                    size={20}
                  />
                }
              />

              <StatusCard
                label="Current Status"
                value={
                  result.statusLabel ||
                  humanizeStatus(
                    result.orderStatus,
                  )
                }
                icon={
                  <Truck
                    size={20}
                  />
                }
              />

              <StatusCard
                label="Courier"
                value={
                  result.courierName ||
                  "Not assigned yet"
                }
                icon={
                  <MapPin
                    size={20}
                  />
                }
              />

              <StatusCard
                label="AWB"
                value={
                  result.awbCode ||
                  "Pending"
                }
                icon={
                  <Clock3
                    size={20}
                  />
                }
              />
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#922424]">
                  Delivery Progress
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Where is my order?
                </h2>
              </div>

              <div className="mt-7 space-y-0">
                {result.progress.map(
                  (
                    step,
                    index,
                  ) => (
                    <div
                      key={step.key}
                      className="relative flex gap-4 pb-7 last:pb-0"
                    >
                      {index <
                        result.progress
                          .length -
                          1 && (
                        <div
                          className={`absolute left-[15px] top-8 h-[calc(100%-24px)] w-px ${
                            step.done
                              ? "bg-[#922424]"
                              : "bg-slate-200"
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                          step.done
                            ? "border-[#922424] bg-[#922424] text-white"
                            : step.current
                              ? "border-[#922424] bg-white text-[#922424]"
                              : "border-slate-300 bg-white text-slate-300"
                        }`}
                      >
                        {step.done ? (
                          <CheckCircle2
                            size={16}
                          />
                        ) : (
                          <Clock3
                            size={14}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <p
                          className={`font-black ${
                            step.done ||
                            step.current
                              ? "text-slate-950"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>

                        {step.current &&
                          !step.done && (
                            <p className="mt-1 text-xs font-semibold text-[#922424]">
                              Waiting for this
                              update
                            </p>
                          )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {result.awaitingCourierAssignment && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <Clock3
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <div>
                    <h2 className="font-black text-amber-950">
                      Order confirmed —
                      courier assignment
                      pending
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Shiprocket order
                      create ho chuka hai.
                      Krinay team courier,
                      AWB aur pickup manually
                      schedule karegi.
                      Courier assign hone ke
                      baad website latest
                      tracking automatically
                      fetch karegi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!result.shipmentCreated && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="font-black text-slate-900">
                  Shipping preparation
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Order received hai,
                  lekin Shiprocket shipment
                  abhi create/sync nahi hua.
                  Krinay team shipment
                  process karegi.
                </p>
              </div>
            )}

            {result.estimatedDelivery && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                  Estimated delivery
                </p>

                <p className="mt-2 text-lg font-black text-emerald-950">
                  {
                    result.estimatedDelivery
                  }
                </p>
              </div>
            )}

            {result.trackingUrl && (
              <a
                href={
                  result.trackingUrl
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-[#922424]"
              >
                <div>
                  <p className="font-black text-slate-950">
                    Open courier tracking
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Courier / Shiprocket
                    tracking page open
                    karein.
                  </p>
                </div>

                <ExternalLink
                  size={20}
                  className="shrink-0 text-[#922424]"
                />
              </a>
            )}

            {result.liveTrackingMessage &&
              !result.liveTrackingAvailable &&
              result.shipmentCreated && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="font-black text-slate-900">
                    Live tracking update
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {
                      result.liveTrackingMessage
                    }
                  </p>
                </div>
              )}

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                  <Truck
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Shipment timeline
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest courier scans
                    received from
                    Shiprocket.
                  </p>
                </div>
              </div>

              {result.activities.length >
              0 ? (
                <div className="mt-7 space-y-0">
                  {result.activities.map(
                    (
                      activity,
                      index,
                    ) => (
                      <div
                        key={`${activity.date}-${activity.activity}-${index}`}
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {index <
                          result
                            .activities
                            .length -
                            1 && (
                          <div className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-slate-200" />
                        )}

                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            index === 0
                              ? "bg-[#922424] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <CheckCircle2
                            size={16}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-black text-slate-900">
                            {activity.activity ||
                              activity.status ||
                              "Shipment update"}
                          </p>

                          {activity.status &&
                            activity.status !==
                              activity.activity && (
                              <p className="mt-1 text-sm font-semibold text-[#922424]">
                                {
                                  activity.status
                                }
                              </p>
                            )}

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            {activity.date && (
                              <span>
                                {formatDate(
                                  activity.date,
                                )}
                              </span>
                            )}

                            {activity.location && (
                              <span>
                                {
                                  activity.location
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  {result.awaitingCourierAssignment
                    ? "Courier activity abhi available nahi hai because AWB/courier assignment pending hai."
                    : "Courier activity abhi available nahi hai. Shipment scan hone ke baad updates yahan dikhengi."}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">
                  Payment status:
                </strong>{" "}
                {paymentLabel(
                  result.paymentStatus,
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">
                  Last checked:
                </strong>{" "}
                {result.lastSyncedAt
                  ? formatDate(
                      result.lastSyncedAt,
                    )
                  : "Just now"}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function StatusCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
        {icon}
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}
