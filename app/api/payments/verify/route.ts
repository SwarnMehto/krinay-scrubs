import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { safelyNotifyConfirmedOrder } from "@/lib/order-notifications";
import { awardOrderRewardIfEligible } from "@/lib/rewards";
import { syncOrderToShiprocket } from "@/lib/shiprocket";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

/*
 * =========================================================
 * CHECK SHIPROCKET SYNC
 * =========================================================
 */
function isShiprocketOrderSynced(order: {
  get: (path: string) => unknown;
}) {
  return Boolean(
    order.get("shiprocketOrderId") &&
      order.get("shiprocketShipmentId"),
  );
}

/*
 * =========================================================
 * REWARD
 * =========================================================
 */
async function safelyAwardReward(
  order: InstanceType<typeof Order>,
) {
  try {
    return await awardOrderRewardIfEligible(order);
  } catch (error) {
    console.error(
      "[PAYMENT_VERIFY] Order reward sync error:",
      error,
    );

    return {
      awarded: false,
      points: 0,
      reason: "reward_sync_failed",
    };
  }
}

/*
 * =========================================================
 * SHIPROCKET
 * =========================================================
 *
 * Payment ko Shiprocket failure ki wajah se failed
 * nahi karna.
 *
 * Customer ne payment kar di hai.
 * Agar Shiprocket temporary fail ho jaye toh order
 * paid/confirmed hi rahega.
 */
async function safelySyncOrderToShiprocket(
  order: InstanceType<typeof Order>,
): Promise<ShiprocketSyncResult> {
  /*
   * Already synced hai toh duplicate Shiprocket
   * order create mat karo.
   */
  if (isShiprocketOrderSynced(order)) {
    return {
      shiprocketSynced: true,
      shiprocketError: "",
    };
  }

  try {
    await syncOrderToShiprocket(order);

    /*
     * syncOrderToShiprocket complete hone ke baad
     * actual IDs check karo.
     */
    const synced =
      isShiprocketOrderSynced(order);

    if (!synced) {
      return {
        shiprocketSynced: false,
        shiprocketError:
          "Shiprocket API response aaya lekin order/shipment ID save nahi hui.",
      };
    }

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
      "[PAYMENT_VERIFY] Shiprocket prepaid order sync error:",
      error,
    );

    return {
      shiprocketSynced: false,
      shiprocketError,
    };
  }
}

/*
 * =========================================================
 * ORDER NOTIFICATION
 * =========================================================
 */
async function safelySendNotification(
  order: InstanceType<typeof Order>,
) {
  try {
    return await safelyNotifyConfirmedOrder(
      order,
    );
  } catch (error) {
    console.error(
      "[PAYMENT_VERIFY] Order notification error:",
      error,
    );

    return {
      sent: false,
      error:
        error instanceof Error
          ? error.message
          : "Order notification failed.",
    };
  }
}

/*
 * =========================================================
 * PROCESS ALREADY PAID ORDER
 * =========================================================
 *
 * Agar browser request dubara aaye:
 *
 * - payment dobara process nahi hogi
 * - Shiprocket pending hai toh retry hoga
 * - reward retry hoga
 * - notification retry hoga
 */
async function processAlreadyPaidOrder(
  order: InstanceType<typeof Order>,
) {
  const {
    shiprocketSynced,
    shiprocketError,
  } = await safelySyncOrderToShiprocket(
    order,
  );

  const reward =
    await safelyAwardReward(order);

  const notification =
    await safelySendNotification(order);

  /*
   * Shiprocket function order document modify/save
   * kar sakta hai.
   *
   * Fresh document reload karna safest hai.
   */
  const freshOrder =
    (await Order.findById(
      order._id,
    )) ?? order;

  return {
    freshOrder,
    shiprocketSynced,
    shiprocketError,
    reward,
    notification,
  };
}

/*
 * =========================================================
 * POST
 * =========================================================
 */
export async function POST(
  request: Request,
) {
  try {
    /*
     * =====================================================
     * REQUEST BODY
     * =====================================================
     */
    const body =
      (await request.json()) as VerifyPaymentRequest;

    const {
      krinayOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    /*
     * =====================================================
     * VALIDATION
     * =====================================================
     */
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

    /*
     * =====================================================
     * RAZORPAY SECRET
     * =====================================================
     */
    const keySecret =
      process.env
        .RAZORPAY_KEY_SECRET
        ?.trim();

    if (!keySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET missing hai. Vercel Environment Variables check karo.",
      );
    }

    if (
      keySecret ===
      "your_test_key_secret"
    ) {
      throw new Error(
        "Placeholder Razorpay secret use ho raha hai. Actual Razorpay secret add karo.",
      );
    }

    /*
     * =====================================================
     * DATABASE
     * =====================================================
     */
    await connectDatabase();

    const order =
      await Order.findById(
        krinayOrderId,
      );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order nahi mila.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =====================================================
     * ALREADY PAID
     * =====================================================
     *
     * Is block ka major benefit:
     *
     * Payment captured hai but Shiprocket previous
     * request me fail hua toh same verify endpoint
     * Shiprocket ko dobara retry kar sakta hai.
     */
    if (
      order.paymentStatus ===
      "paid"
    ) {
      const {
        freshOrder,
        shiprocketSynced,
        shiprocketError,
        reward,
        notification,
      } =
        await processAlreadyPaidOrder(
          order,
        );

      return NextResponse.json(
        {
          success: true,

          message:
            shiprocketSynced
              ? "Payment already verified hai. Shiprocket order synced hai."
              : "Payment already verified hai, lekin Shiprocket sync pending hai.",

          order: {
            id:
              freshOrder._id.toString(),

            orderNumber:
              freshOrder.orderNumber,

            invoiceAccessToken:
              freshOrder
                .invoiceAccessToken,

            paymentStatus:
              freshOrder
                .paymentStatus,

            orderStatus:
              freshOrder
                .orderStatus,

            shipmentApprovalStatus:
              freshOrder
                .shipmentApprovalStatus,

            shiprocketSynced,

            shiprocketError,

            reward,

            notification,

            shiprocketOrderId:
              freshOrder.get(
                "shiprocketOrderId",
              ) ?? "",

            shiprocketShipmentId:
              freshOrder.get(
                "shiprocketShipmentId",
              ) ?? "",
          },
        },
        {
          status: 200,
        },
      );
    }

    /*
     * =====================================================
     * CHECK RAZORPAY ORDER ID
     * =====================================================
     *
     * Razorpay checkout se returned order ID exactly
     * wahi honi chahiye jo MongoDB me server ne save ki.
     */
    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !==
        razorpayOrderId
    ) {
      console.error(
        "[PAYMENT_VERIFY] Razorpay order ID mismatch",
        {
          mongoOrderId:
            order.razorpayOrderId,

          receivedOrderId:
            razorpayOrderId,

          krinayOrderId,
        },
      );

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
     * =====================================================
     * VERIFY RAZORPAY SIGNATURE
     * =====================================================
     *
     * HMAC_SHA256(
     *   razorpay_order_id | razorpay_payment_id,
     *   Razorpay key secret
     * )
     */
    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          keySecret,
        )
        .update(
          `${order.razorpayOrderId}|${razorpayPaymentId}`,
        )
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8",
      );

    const receivedBuffer =
      Buffer.from(
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
      console.error(
        "[PAYMENT_VERIFY] Razorpay signature mismatch",
        {
          krinayOrderId,
          razorpayOrderId,
          razorpayPaymentId,
        },
      );

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
     * =====================================================
     * PAYMENT CONFIRMED
     * =====================================================
     */
    order.razorpayPaymentId =
      razorpayPaymentId;

    order.paymentStatus =
      "paid";

    order.orderStatus =
      "confirmed";

    /*
     * Shiprocket order create hone ke baad bhi
     * courier/AWB/pickup manual ho sakta hai.
     */
    order.shipmentApprovalStatus =
      "pending";

    await order.save();

    console.log(
      "[PAYMENT_VERIFY] Payment confirmed:",
      {
        orderNumber:
          order.orderNumber,

        razorpayOrderId:
          order.razorpayOrderId,

        razorpayPaymentId,
      },
    );

    /*
     * =====================================================
     * SHIPROCKET
     * =====================================================
     */
    const {
      shiprocketSynced,
      shiprocketError,
    } =
      await safelySyncOrderToShiprocket(
        order,
      );

    if (!shiprocketSynced) {
      console.error(
        "[PAYMENT_VERIFY] Paid order Shiprocket sync pending:",
        {
          orderNumber:
            order.orderNumber,

          error:
            shiprocketError,
        },
      );
    } else {
      console.log(
        "[PAYMENT_VERIFY] Shiprocket synced:",
        {
          orderNumber:
            order.orderNumber,

          shiprocketOrderId:
            order.get(
              "shiprocketOrderId",
            ),

          shiprocketShipmentId:
            order.get(
              "shiprocketShipmentId",
            ),
        },
      );
    }

    /*
     * =====================================================
     * REWARD
     * =====================================================
     */
    const reward =
      await safelyAwardReward(
        order,
      );

    /*
     * =====================================================
     * NOTIFICATION
     * =====================================================
     */
    const notification =
      await safelySendNotification(
        order,
      );

    /*
     * =====================================================
     * FRESH ORDER
     * =====================================================
     */
    const freshOrder =
      (await Order.findById(
        order._id,
      )) ?? order;

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     *
     * IMPORTANT:
     * Shiprocket fail hone par bhi success=true rahega
     * because actual customer payment successful hai.
     */
    return NextResponse.json(
      {
        success: true,

        message:
          shiprocketSynced
            ? "Payment verified successfully. Order Shiprocket par synced hai."
            : "Payment successful hai. Shiprocket sync pending hai.",

        order: {
          id:
            freshOrder._id.toString(),

          orderNumber:
            freshOrder.orderNumber,

          invoiceAccessToken:
            freshOrder
              .invoiceAccessToken,

          paymentStatus:
            freshOrder
              .paymentStatus,

          orderStatus:
            freshOrder
              .orderStatus,

          shipmentApprovalStatus:
            freshOrder
              .shipmentApprovalStatus,

          shiprocketSynced,

          shiprocketError,

          reward,

          notification,

          shiprocketOrderId:
            freshOrder.get(
              "shiprocketOrderId",
            ) ?? "",

          shiprocketShipmentId:
            freshOrder.get(
              "shiprocketShipmentId",
            ) ?? "",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[PAYMENT_VERIFY_FATAL_ERROR]",
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