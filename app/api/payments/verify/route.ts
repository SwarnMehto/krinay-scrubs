import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import {
  deductInventoryForOrder,
} from "@/lib/inventory";
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
    return await awardOrderRewardIfEligible(
      order,
    );
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
 * Shiprocket failure must never convert a successfully
 * paid customer order into a failed payment.
 */
async function safelySyncOrderToShiprocket(
  order: InstanceType<typeof Order>,
): Promise<ShiprocketSyncResult> {
  /*
   * Already synced:
   * do not create a duplicate Shiprocket order.
   */
  if (
    isShiprocketOrderSynced(
      order,
    )
  ) {
    return {
      shiprocketSynced: true,
      shiprocketError: "",
    };
  }

  try {
    await syncOrderToShiprocket(
      order,
    );

    const synced =
      isShiprocketOrderSynced(
        order,
      );

    if (!synced) {
      return {
        shiprocketSynced: false,

        shiprocketError:
          "Shiprocket returned a response but the order or shipment ID was not saved.",
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
 * Browser/payment verification request may arrive again.
 *
 * Inventory MUST NOT be deducted again.
 *
 * deductInventoryForOrder() itself also checks
 * inventoryDeducted, giving us another layer of protection.
 */
async function processAlreadyPaidOrder(
  order: InstanceType<typeof Order>,
) {
  /*
   * -------------------------------------------------------
   * INVENTORY
   * -------------------------------------------------------
   *
   * Older paid orders may exist from before inventory
   * management was introduced.
   *
   * Only attempt inventory deduction when this order has
   * not already deducted stock.
   */
  let inventoryHold = false;
  let inventoryError = "";

  if (
    !order.inventoryDeducted
  ) {
    try {
      await deductInventoryForOrder(
        order,
      );
    } catch (error) {
      inventoryHold = true;

      inventoryError =
        error instanceof Error
          ? error.message
          : "Inventory deduction failed.";

      console.error(
        "[PAYMENT_VERIFY] Already-paid order inventory error:",
        {
          orderNumber:
            order.orderNumber,

          error,
        },
      );
    }
  }

  /*
   * If stock could not be reserved, do NOT send the
   * order to Shiprocket automatically.
   */
  let shiprocketSynced =
    false;

  let shiprocketError =
    "";

  if (!inventoryHold) {
    const shiprocketResult =
      await safelySyncOrderToShiprocket(
        order,
      );

    shiprocketSynced =
      shiprocketResult.shiprocketSynced;

    shiprocketError =
      shiprocketResult.shiprocketError;
  } else {
    shiprocketError =
      "Shipment sync paused because inventory requires review.";
  }

  /*
   * Reward is safe to retry because reward helper
   * already handles eligibility/idempotency.
   */
  const reward =
    await safelyAwardReward(
      order,
    );

  /*
   * Only send normal confirmed-order notification when
   * inventory has successfully been reserved.
   */
  const notification =
    inventoryHold
      ? {
          sent: false,
          error:
            "Order notification paused pending inventory review.",
        }
      : await safelySendNotification(
          order,
        );

  const freshOrder =
    (await Order.findById(
      order._id,
    )) ?? order;

  return {
    freshOrder,

    inventoryHold,
    inventoryError,

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
     * BASIC VALIDATION
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
            "Payment verification information is incomplete.",
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
        "RAZORPAY_KEY_SECRET is missing from the server environment.",
      );
    }

    if (
      keySecret ===
      "your_test_key_secret"
    ) {
      throw new Error(
        "A placeholder Razorpay secret is configured instead of the actual secret.",
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
            "Order not found.",
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
     * IMPORTANT:
     *
     * Payment verification can be called again by the
     * browser.
     *
     * Never double-deduct inventory.
     *
     * Pending Shiprocket/reward/notification work can
     * still be retried.
     */
    if (
      order.paymentStatus ===
      "paid"
    ) {
      const {
        freshOrder,

        inventoryHold,
        inventoryError,

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

          inventoryHold,

          message:
            inventoryHold
              ? "Payment has already been verified. Your order is being reviewed for stock confirmation."
              : shiprocketSynced
                ? "Payment has already been verified and the shipment is synced."
                : "Payment has already been verified. Shipment sync is pending.",

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

            inventoryDeducted:
              freshOrder
                .inventoryDeducted,

            inventoryDeductedAt:
              freshOrder
                .inventoryDeductedAt,

            inventoryHold,

            inventoryError,

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
            "Razorpay order ID does not match this order.",
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
     *   Razorpay secret
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
        .digest(
          "hex",
        );

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
     * VALID PAYMENT RECEIVED
     * =====================================================
     *
     * Signature is valid.
     *
     * Customer payment must never be marked failed from
     * this point just because inventory or Shiprocket
     * has a problem.
     */
    order.razorpayPaymentId =
      razorpayPaymentId;

    /*
     * =====================================================
     * INVENTORY DEDUCTION
     * =====================================================
     *
     * Examples:
     *
     * Complete Set:
     * Top S + Bottom M
     * -> Top S - quantity
     * -> Bottom M - quantity
     *
     * Top Only:
     * -> selected Top - quantity
     *
     * Bottom Only:
     * -> selected Bottom - quantity
     */
    try {
      await deductInventoryForOrder(
        order,
      );
    } catch (inventoryError) {
      /*
       * Payment has already been authenticated.
       *
       * Therefore:
       *
       * paymentStatus = paid
       * orderStatus = processing
       *
       * Do NOT create shipment automatically.
       */
      const inventoryMessage =
        inventoryError instanceof Error
          ? inventoryError.message
          : "Insufficient inventory.";

      order.paymentStatus =
        "paid";

      order.orderStatus =
        "processing";

      order.shipmentApprovalStatus =
        "pending";

      order.adminNotes =
        [
          order.adminNotes,

          `INVENTORY HOLD: ${inventoryMessage}`,
        ]
          .filter(Boolean)
          .join("\n")
          .slice(
            0,
            1000,
          );

      await order.save();

      console.error(
        "[PAYMENT_VERIFY_INVENTORY_HOLD]",
        {
          orderNumber:
            order.orderNumber,

          razorpayPaymentId,

          error:
            inventoryMessage,
        },
      );

      return NextResponse.json(
        {
          success: true,

          inventoryHold: true,

          message:
            "Payment received successfully. Your order is being reviewed for stock confirmation.",

          order: {
            id:
              order._id.toString(),

            orderNumber:
              order.orderNumber,

            invoiceAccessToken:
              order
                .invoiceAccessToken,

            paymentStatus:
              order.paymentStatus,

            orderStatus:
              order.orderStatus,

            inventoryDeducted:
              order
                .inventoryDeducted,

            inventoryHold:
              true,

            shipmentApprovalStatus:
              order
                .shipmentApprovalStatus,
          },
        },
        {
          status: 200,
        },
      );
    }

    /*
     * =====================================================
     * PAYMENT CONFIRMED
     * =====================================================
     *
     * Exact inventory has now been successfully deducted.
     */
    order.paymentStatus =
      "paid";

    order.orderStatus =
      "confirmed";

    /*
     * Shiprocket order can now be created.
     *
     * Courier / AWB / pickup can remain manual.
     */
    order.shipmentApprovalStatus =
      "pending";

    await order.save();

    console.log(
      "[PAYMENT_VERIFY] Payment confirmed and inventory deducted:",
      {
        orderNumber:
          order.orderNumber,

        razorpayOrderId:
          order.razorpayOrderId,

        razorpayPaymentId,

        inventoryDeducted:
          order.inventoryDeducted,
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
     *
     * Shiprocket / reward / notification functions may
     * modify and save the document.
     */
    const freshOrder =
      (await Order.findById(
        order._id,
      )) ?? order;

    /*
     * =====================================================
     * SUCCESS RESPONSE
     * =====================================================
     *
     * Shiprocket failure does NOT mean payment failure.
     */
    return NextResponse.json(
      {
        success: true,

        inventoryHold: false,

        message:
          shiprocketSynced
            ? "Payment verified successfully. Your order has been confirmed."
            : "Payment verified successfully. Your order has been confirmed and shipment sync is pending.",

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

          inventoryDeducted:
            freshOrder
              .inventoryDeducted,

          inventoryDeductedAt:
            freshOrder
              .inventoryDeductedAt,

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