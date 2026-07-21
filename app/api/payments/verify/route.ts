import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { syncOrderToShiprocket } from "@/lib/shiprocket";
import Order from "@/models/Order";

export const runtime = "nodejs";

type VerifyPaymentRequest = {
  krinayOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

type ShiprocketSyncResult = {
  shiprocketSynced: boolean;
  shiprocketError: string;
};

function isShiprocketOrderSynced(order: {
  get: (path: string) => unknown;
}) {
  return Boolean(
    order.get("shiprocketOrderId") &&
      order.get("shiprocketShipmentId"),
  );
}

async function safelySyncOrderToShiprocket(
  order: InstanceType<typeof Order>,
): Promise<ShiprocketSyncResult> {
  if (isShiprocketOrderSynced(order)) {
    return {
      shiprocketSynced: true,
      shiprocketError: "",
    };
  }

  try {
    await syncOrderToShiprocket(order);

    return {
      shiprocketSynced: true,
      shiprocketError: "",
    };
  } catch (error) {
    const shiprocketError =
      error instanceof Error
        ? error.message
        : "Shiprocket sync failed.";

    console.error(
      "Shiprocket prepaid order sync error:",
      error,
    );

    /*
     * Shiprocket fail hone par payment ko failed
     * mark nahi karenge. Paid order MongoDB me
     * confirmed rahega aur baad me retry ho sakta hai.
     */
    return {
      shiprocketSynced: false,
      shiprocketError,
    };
  }
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as VerifyPaymentRequest;

    const {
      krinayOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (
      !krinayOrderId ||
      !mongoose.Types.ObjectId.isValid(
        krinayOrderId,
      ) ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification data incomplete hai.",
        },
        {
          status: 400,
        },
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET missing hai. .env.local check karo.",
      );
    }

    if (
      keySecret === "your_test_key_secret"
    ) {
      throw new Error(
        "Placeholder Razorpay secret use ho raha hai. Razorpay Dashboard se actual Test Secret add karo.",
      );
    }

    await connectDatabase();

    const order = await Order.findById(
      krinayOrderId,
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order nahi mila.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Payment pehle verify ho chuki ho aur browser/API
     * request repeat ho jaye to duplicate processing
     * nahi hogi. Shiprocket pending ho to retry hoga.
     */
    if (order.paymentStatus === "paid") {
      const {
        shiprocketSynced,
        shiprocketError,
      } = await safelySyncOrderToShiprocket(
        order,
      );

      return NextResponse.json({
        success: true,
        message:
          "Payment already verified hai.",

        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,

          shipmentApprovalStatus:
            order.shipmentApprovalStatus,

          shiprocketSynced,
          shiprocketError,

          shiprocketOrderId:
            order.get("shiprocketOrderId") ??
            "",

          shiprocketShipmentId:
            order.get(
              "shiprocketShipmentId",
            ) ?? "",
        },
      });
    }

    /*
     * Razorpay response ka order ID usi Razorpay order
     * se match hona chahiye jo server ne save kiya tha.
     */
    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !==
        razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order ID match nahi hui.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Razorpay signature:
     * HMAC_SHA256(
     *   server_saved_order_id + "|" + payment_id,
     *   key_secret
     * )
     */
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        keySecret,
      )
      .update(
        `${order.razorpayOrderId}|${razorpayPaymentId}`,
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8",
    );

    const receivedBuffer = Buffer.from(
      razorpaySignature,
      "utf8",
    );

    const signatureMatches =
      expectedBuffer.length ===
        receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer,
      );

    if (!signatureMatches) {
      /*
       * Invalid request payment ko database me failed
       * mark nahi karegi. Koi third party bogus request
       * bhejkar valid pending order ko failed na kar sake.
       */
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment signature verification failed.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Payment confirmed.
     */
    order.razorpayPaymentId =
      razorpayPaymentId;

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    /*
     * Iska matlab courier/AWB/pickup abhi manually
     * process hona baaki hai.
     */
    order.shipmentApprovalStatus =
      "pending";

    await order.save();

    /*
     * Paid order ko Shiprocket panel me create karo.
     * AWB aur pickup generate nahi kiye ja rahe.
     */
    const {
      shiprocketSynced,
      shiprocketError,
    } = await safelySyncOrderToShiprocket(
      order,
    );

    return NextResponse.json({
      success: true,
      message:
        "Payment verified successfully.",

      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        shipmentApprovalStatus:
          order.shipmentApprovalStatus,

        shiprocketSynced,
        shiprocketError,

        shiprocketOrderId:
          order.get("shiprocketOrderId") ??
          "",

        shiprocketShipmentId:
          order.get(
            "shiprocketShipmentId",
          ) ?? "",
      },
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}