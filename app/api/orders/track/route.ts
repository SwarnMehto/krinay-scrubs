import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import {
  getShiprocketShipmentDetails,
  getShiprocketTrackingByAwb,
  getShiprocketTrackingByShipmentId,
} from "@/lib/shiprocket";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

type TrackingActivity = {
  date: string;
  status: string;
  activity: string;
  location: string;
};

type TrackingProgressStep = {
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

function asObject(value: unknown): JsonObject {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as JsonObject;
  }

  return {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return "";
}

function cleanTrackingInput(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 100);
}

function safeDateValue(value: string): number {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  return parsed.getTime();
}

function normalizeStatus(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function statusLabel(status: string): string {
  const normalized = normalizeStatus(status);

  const labels: Record<string, string> = {
    pending: "Order Pending",
    confirmed: "Order Confirmed",
    processing: "Processing",
    shipped: "In Transit",
    "out for delivery": "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  };

  return (
    labels[normalized] ||
    status ||
    "Order Confirmed"
  );
}

function customerFriendlyShiprocketStatus(
  value: string,
): string {
  const status = normalizeStatus(value);

  if (!status) {
    return "";
  }

  if (
    status.includes("delivered")
  ) {
    return "Delivered";
  }

  if (
    status.includes("out for delivery") ||
    status.includes("ofd")
  ) {
    return "Out for Delivery";
  }

  if (
    status.includes("destination hub") ||
    status.includes("destination center") ||
    status.includes("destination facility")
  ) {
    return "Reached Destination Hub";
  }

  if (
    status.includes("in transit") ||
    status.includes("transit") ||
    status.includes("shipped") ||
    status.includes("departed") ||
    status.includes("arrived at hub")
  ) {
    return "In Transit";
  }

  if (
    status.includes("picked up") ||
    status.includes("pickup done") ||
    status.includes("pickup completed")
  ) {
    return "Picked Up";
  }

  if (
    status.includes("pickup scheduled") ||
    status.includes("pickup generated") ||
    status.includes("pickup requested")
  ) {
    return "Pickup Scheduled";
  }

  if (
    status.includes("awb") ||
    status.includes("courier assigned") ||
    status.includes("ready to ship") ||
    status.includes("manifest")
  ) {
    return "Courier Assigned";
  }

  if (
    status.includes("rto") ||
    status.includes("return")
  ) {
    return "Return in Progress";
  }

  if (
    status.includes("cancel")
  ) {
    return "Cancelled";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function mapShiprocketStatusToOrderStatus(
  currentStatus: string,
):
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | null {
  const status = normalizeStatus(
    currentStatus,
  );

  if (!status) {
    return null;
  }

  if (status.includes("delivered")) {
    return "delivered";
  }

  if (
    status.includes("out for delivery") ||
    status.includes("ofd")
  ) {
    return "out_for_delivery";
  }

  if (
    status.includes("rto") ||
    status.includes("return")
  ) {
    return "returned";
  }

  if (status.includes("cancel")) {
    return "cancelled";
  }

  if (
    status.includes("in transit") ||
    status.includes("transit") ||
    status.includes("shipped") ||
    status.includes("picked up") ||
    status.includes("pickup done") ||
    status.includes("destination hub") ||
    status.includes("departed") ||
    status.includes("arrived")
  ) {
    return "shipped";
  }

  if (
    status.includes("awb") ||
    status.includes("courier assigned") ||
    status.includes("ready") ||
    status.includes("pickup") ||
    status.includes("manifest")
  ) {
    return "processing";
  }

  return "confirmed";
}

function extractShipmentDetails(
  payload: unknown,
) {
  const root = asObject(payload);

  const data = asObject(
    root.data ??
      root.shipment ??
      root,
  );

  const shipment = asObject(
    data.shipment ??
      data,
  );

  return {
    awbCode:
      asString(
        shipment.awb ??
          shipment.awb_code ??
          shipment.awbCode ??
          data.awb ??
          data.awb_code,
      ),

    courierName:
      asString(
        shipment.courier_name ??
          shipment.courier_company_name ??
          shipment.courier ??
          data.courier_name ??
          data.courier_company_name,
      ),

    status:
      asString(
        shipment.status ??
          shipment.current_status ??
          data.status ??
          data.current_status,
      ),

    estimatedDelivery:
      asString(
        shipment.edd ??
          shipment.etd ??
          shipment.estimated_delivery_date ??
          data.edd ??
          data.etd,
      ),

    trackingUrl:
      asString(
        shipment.tracking_url ??
          shipment.track_url ??
          data.tracking_url ??
          data.track_url,
      ),
  };
}

function extractShiprocketTracking(
  payload: unknown,
) {
  const root = asObject(payload);

  const trackingData = asObject(
    root.tracking_data ??
      root.data ??
      root,
  );

  const shipmentTracks = asArray(
    trackingData.shipment_track,
  );

  const mainTrack = asObject(
    shipmentTracks[0],
  );

  const activities: TrackingActivity[] =
    asArray(
      trackingData
        .shipment_track_activities,
    )
      .map((activity) => {
        const object = asObject(activity);

        return {
          date: asString(
            object.date ??
              object.updated_at ??
              object.created_at,
          ),

          status: asString(
            object["sr-status-label"] ??
              object.status,
          ),

          activity: asString(
            object.activity ??
              object.status,
          ),

          location: asString(
            object.location,
          ),
        };
      })
      .filter(
        (activity) =>
          activity.date ||
          activity.status ||
          activity.activity ||
          activity.location,
      )
      .sort(
        (a, b) =>
          safeDateValue(b.date) -
          safeDateValue(a.date),
      );

  const latestActivity =
    activities[0] ?? null;

  const currentStatus = asString(
    mainTrack.current_status ??
      trackingData.current_status ??
      latestActivity?.status ??
      latestActivity?.activity,
  );

  return {
    trackStatus: asString(
      trackingData.track_status,
    ),

    currentStatus,

    awbCode: asString(
      mainTrack.awb_code ??
        trackingData.awb_code,
    ),

    courierName: asString(
      mainTrack.courier_name ??
        mainTrack
          .courier_company_name ??
        trackingData.courier_name ??
        trackingData
          .courier_company_name,
    ),

    estimatedDelivery: asString(
      trackingData.etd ??
        mainTrack.edd ??
        mainTrack.etd,
    ),

    trackingUrl: asString(
      trackingData.track_url ??
        mainTrack.track_url,
    ),

    error: asString(
      trackingData.error ??
        root.error,
    ),

    activities,
    latestActivity,
  };
}

function hasStatus(
  values: string[],
  patterns: string[],
) {
  const combined = normalizeStatus(
    values.join(" "),
  );

  return patterns.some((pattern) =>
    combined.includes(pattern),
  );
}

function buildProgress(
  input: {
    orderStatus: string;
    currentStatus: string;
    awbCode: string;
    activities: TrackingActivity[];
  },
): TrackingProgressStep[] {
  const activityTexts =
    input.activities.flatMap(
      (activity) => [
        activity.status,
        activity.activity,
      ],
    );

  const values = [
    input.orderStatus,
    input.currentStatus,
    ...activityTexts,
  ];

  const delivered =
    input.orderStatus === "delivered" ||
    hasStatus(values, ["delivered"]);

  const outForDelivery =
    delivered ||
    input.orderStatus ===
      "out_for_delivery" ||
    hasStatus(values, [
      "out for delivery",
      "ofd",
    ]);

  const inTransit =
    outForDelivery ||
    input.orderStatus === "shipped" ||
    hasStatus(values, [
      "in transit",
      "transit",
      "shipped",
      "destination hub",
      "departed",
      "arrived at hub",
    ]);

  const pickedUp =
    inTransit ||
    hasStatus(values, [
      "picked up",
      "pickup done",
      "pickup completed",
    ]);

  const pickupScheduled =
    pickedUp ||
    hasStatus(values, [
      "pickup scheduled",
      "pickup generated",
      "pickup requested",
    ]);

  const courierAssigned =
    pickupScheduled ||
    Boolean(input.awbCode) ||
    hasStatus(values, [
      "awb",
      "courier assigned",
      "ready to ship",
      "manifest",
    ]);

  const doneMap = {
    confirmed: true,
    courier_assigned:
      courierAssigned,
    pickup_scheduled:
      pickupScheduled,
    picked_up:
      pickedUp,
    in_transit:
      inTransit,
    out_for_delivery:
      outForDelivery,
    delivered,
  } as const;

  const orderedKeys: Array<
    TrackingProgressStep["key"]
  > = [
    "confirmed",
    "courier_assigned",
    "pickup_scheduled",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
  ];

  const labels: Record<
    TrackingProgressStep["key"],
    string
  > = {
    confirmed: "Order Confirmed",
    courier_assigned:
      "Courier Assigned",
    pickup_scheduled:
      "Pickup Scheduled",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    out_for_delivery:
      "Out for Delivery",
    delivered: "Delivered",
  };

  let currentKey:
    | TrackingProgressStep["key"]
    | null = null;

  for (const key of orderedKeys) {
    if (!doneMap[key]) {
      currentKey = key;
      break;
    }
  }

  if (!currentKey) {
    currentKey = "delivered";
  }

  if (
    doneMap.delivered
  ) {
    currentKey = "delivered";
  } else {
    const completedKeys =
      orderedKeys.filter(
        (key) => doneMap[key],
      );

    if (
      completedKeys.length > 0
    ) {
      currentKey =
        completedKeys[
          completedKeys.length - 1
        ];
    }
  }

  return orderedKeys.map((key) => ({
    key,
    label: labels[key],
    done: doneMap[key],
    current: key === currentKey,
  }));
}

async function tryLiveTracking(input: {
  shipmentId: string;
  awbCode: string;
}) {
  let tracking:
    | ReturnType<
        typeof extractShiprocketTracking
      >
    | null = null;

  const warnings: string[] = [];

  /*
   * AWB is the most precise public courier
   * identifier once it exists.
   */
  if (input.awbCode) {
    try {
      const payload =
        await getShiprocketTrackingByAwb(
          input.awbCode,
        );

      tracking =
        extractShiprocketTracking(
          payload,
        );
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? error.message
          : "AWB tracking unavailable.",
      );
    }
  }

  /*
   * Fallback to shipment tracking if AWB
   * tracking is unavailable or AWB is not
   * assigned yet.
   */
  if (
    !tracking &&
    input.shipmentId
  ) {
    try {
      const payload =
        await getShiprocketTrackingByShipmentId(
          input.shipmentId,
        );

      tracking =
        extractShiprocketTracking(
          payload,
        );
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? error.message
          : "Shipment tracking unavailable.",
      );
    }
  }

  return {
    tracking,
    warning:
      warnings.filter(Boolean).join(
        " | ",
      ),
  };
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as {
        trackingId?: unknown;
      };

    const trackingId =
      cleanTrackingInput(
        body.trackingId,
      );

    if (!trackingId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Order ID / Tracking ID enter karo.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    /*
     * Customer Krinay Order ID (KRN...)
     * ya AWB dono use kar sakta hai.
     *
     * Sensitive address/email/phone public
     * tracking response me expose nahi hote.
     */
    const order =
      await Order.findOne({
        $or: [
          {
            orderNumber:
              trackingId.toUpperCase(),
          },
          {
            awbCode: trackingId,
          },
        ],
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Tracking ID se order nahi mila. ID dobara check karo.",
        },
        {
          status: 404,
        },
      );
    }

    let shipmentMeta = {
      awbCode: "",
      courierName: "",
      status: "",
      estimatedDelivery: "",
      trackingUrl: "",
    };

    let detailsWarning = "";

    /*
     * This call is important after you manually
     * assign courier/AWB inside Shiprocket.
     * It lets the website discover the new AWB
     * even when MongoDB still has old blank fields.
     */
    if (
      order.shiprocketShipmentId
    ) {
      try {
        const detailsPayload =
          await getShiprocketShipmentDetails(
            order.shiprocketShipmentId,
          );

        shipmentMeta =
          extractShipmentDetails(
            detailsPayload,
          );
      } catch (error) {
        detailsWarning =
          error instanceof Error
            ? error.message
            : "Shipment details temporarily unavailable.";
      }
    }

    const effectiveAwb =
      shipmentMeta.awbCode ||
      order.awbCode ||
      "";

    const live =
      await tryLiveTracking({
        shipmentId:
          order.shiprocketShipmentId ||
          "",
        awbCode: effectiveAwb,
      });

    const shiprocket =
      live.tracking;

    let changed = false;

    const latestAwb =
      shiprocket?.awbCode ||
      shipmentMeta.awbCode ||
      order.awbCode ||
      "";

    const latestCourier =
      shiprocket?.courierName ||
      shipmentMeta.courierName ||
      order.courierName ||
      "";

    const latestTrackingUrl =
      shiprocket?.trackingUrl ||
      shipmentMeta.trackingUrl ||
      order.trackingUrl ||
      "";

    const rawCurrentStatus =
      shiprocket?.currentStatus ||
      shipmentMeta.status ||
      statusLabel(
        order.orderStatus,
      );

    if (
      latestAwb &&
      latestAwb !== order.awbCode
    ) {
      order.awbCode = latestAwb;
      changed = true;
    }

    if (
      latestCourier &&
      latestCourier !==
        order.courierName
    ) {
      order.courierName =
        latestCourier;
      changed = true;
    }

    if (
      latestTrackingUrl &&
      latestTrackingUrl !==
        order.trackingUrl
    ) {
      order.trackingUrl =
        latestTrackingUrl;
      changed = true;
    }

    const mappedStatus =
      mapShiprocketStatusToOrderStatus(
        rawCurrentStatus,
      );

    if (
      mappedStatus &&
      mappedStatus !==
        order.orderStatus
    ) {
      order.orderStatus =
        mappedStatus;

      changed = true;
    }

    /*
     * AWB means courier assignment has actually
     * happened, so shipment can be treated as
     * approved for tracking display.
     */
    if (
      latestAwb &&
      order.shipmentApprovalStatus ===
        "pending"
    ) {
      order.shipmentApprovalStatus =
        "approved";

      changed = true;
    }

    if (
      order.shiprocketShipmentId
    ) {
      order.shiprocketTrackingUpdatedAt =
        new Date();

      changed = true;
    }

    if (changed) {
      await order.save();
    }

    const activities =
      shiprocket?.activities ||
      [];

    const friendlyStatus =
      customerFriendlyShiprocketStatus(
        rawCurrentStatus,
      ) ||
      statusLabel(
        order.orderStatus,
      );

    const awaitingCourier =
      Boolean(
        order.shiprocketShipmentId,
      ) &&
      !latestAwb;

    const progress =
      buildProgress({
        orderStatus:
          order.orderStatus,

        currentStatus:
          rawCurrentStatus,

        awbCode:
          latestAwb,

        activities,
      });

    const latestActivity =
      shiprocket?.latestActivity ||
      activities[0] ||
      null;

    const warningText = [
      shiprocket?.error || "",
      live.warning,
      detailsWarning,
    ]
      .filter(Boolean)
      .join(" | ");

    return NextResponse.json({
      success: true,

      tracking: {
        trackingId:
          order.orderNumber,

        orderNumber:
          order.orderNumber,

        orderStatus:
          order.orderStatus,

        statusLabel:
          friendlyStatus,

        rawCourierStatus:
          rawCurrentStatus,

        paymentStatus:
          order.paymentStatus,

        courierName:
          latestCourier,

        awbCode:
          latestAwb,

        trackingUrl:
          latestTrackingUrl,

        estimatedDelivery:
          shiprocket
            ?.estimatedDelivery ||
          shipmentMeta
            .estimatedDelivery ||
          "",

        activities,

        latestActivity,

        progress,

        shipmentCreated:
          Boolean(
            order.shiprocketShipmentId,
          ),

        awaitingCourierAssignment:
          awaitingCourier,

        shiprocketSynced:
          Boolean(
            order.shiprocketShipmentId,
          ),

        liveTrackingAvailable:
          Boolean(
            shiprocket &&
              !shiprocket.error,
          ),

        lastSyncedAt:
          order
            .shiprocketTrackingUpdatedAt
            ?.toISOString?.() ||
          "",

        liveTrackingMessage:
          warningText,
      },
    });
  } catch (error) {
    console.error(
      "[ORDER_TRACK_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Order tracking temporarily unavailable hai.",
      },
      {
        status: 500,
      },
    );
  }
}
