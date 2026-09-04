import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDatabase } from "@/lib/mongodb";
import { syncOrderToShiprocket } from "@/lib/shiprocket";
import { safelyNotifyConfirmedOrder } from "@/lib/order-notifications";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RetryOrderRequest = {
  orderId?: string;
  orderNumber?: string;
};

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==========================================
     * SECURITY
     * ==========================================
     *
     * Public user ko arbitrary orders retry
     * karne nahi dena.
     */
    const expectedSecret =
      process.env.ORDER_RETRY_SECRET?.trim();

    const receivedSecret =
      request.headers
        .get("x-retry-secret")
        ?.trim();

    if (!expectedSecret) {
      throw new Error(
        "ORDER_RETRY_SECRET missing hai.",
      );
    }

    if (
      !receivedSecret ||
      receivedSecret !== expectedSecret
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ==========================================
     * REQUEST
     * ==========================================
     */
    const body =
      (await request.json()) as RetryOrderRequest;

    const orderId =
      body.orderId?.trim() ?? "";

    const orderNumber =
      body.orderNumber?.trim() ?? "";

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "orderId ya orderNumber required hai.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    /*
     * ==========================================
     * FIND ORDER
     * ==========================================
     */
    let order = null;

    if (
      orderId &&
      mongoose.Types.ObjectId.isValid(
        orderId,
      )
    ) {
      order =
        await Order.findById(orderId);
    }

    if (!order && orderNumber) {
      order =
        await Order.findOne({
          orderNumber,
        });
    }

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
     * ==========================================
     * ONLY PAID / CONFIRMED ORDERS
     * ==========================================
     */
    if (
      order.paymentStatus !== "paid"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order paid nahi hai. Shiprocket retry allowed nahi hai.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==========================================
     * SHIPROCKET RETRY
     * ==========================================
     */
    let shiprocketSynced = false;
    let shiprocketError = "";

    try {
      if (
        !order.shiprocketOrderId ||
        !order.shiprocketShipmentId
      ) {
        await syncOrderToShiprocket(
          order,
        );
      }

      shiprocketSynced =
        Boolean(
          order.shiprocketOrderId &&
            order.shiprocketShipmentId,
        );

      if (!shiprocketSynced) {
        shiprocketError =
          "Shiprocket API completed but IDs were not saved.";
      }
    } catch (error) {
      shiprocketError =
        error instanceof Error
          ? error.message
          : "Shiprocket sync failed.";

      console.error(
        "[ORDER_RETRY] Shiprocket error:",
        error,
      );
    }

    /*
     * ==========================================
     * WHATSAPP / NOTIFICATIONS RETRY
     * ==========================================
     */
    let notification;

    try {
      notification =
        await safelyNotifyConfirmedOrder(
          order,
        );
    } catch (error) {
      notification = {
        sent: false,
        error:
          error instanceof Error
            ? error.message
            : "Notification failed.",
      };

      console.error(
        "[ORDER_RETRY] Notification error:",
        error,
      );
    }

    /*
     * Fresh data
     */
    const freshOrder =
      (await Order.findById(
        order._id,
      )) ?? order;

    /*
     * ==========================================
     * RESULT
     * ==========================================
     */
    return NextResponse.json(
      {
        success: true,

        message:
          shiprocketSynced
            ? "Order Shiprocket par successfully synced hai."
            : "Order paid hai lekin Shiprocket sync fail hua. shiprocketError check karo.",

        order: {
          id:
            freshOrder._id.toString(),

          orderNumber:
            freshOrder.orderNumber,

          paymentStatus:
            freshOrder.paymentStatus,

          orderStatus:
            freshOrder.orderStatus,

          razorpayPaymentId:
            freshOrder.razorpayPaymentId,

          shiprocketSynced,

          shiprocketError,

          shiprocketOrderId:
            freshOrder.shiprocketOrderId ??
            "",

          shiprocketShipmentId:
            freshOrder
              .shiprocketShipmentId ??
            "",

          adminOrderNotifiedAt:
            freshOrder
              .adminOrderNotifiedAt ??
            null,

          notification,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[ORDER_RETRY_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Order retry failed.",
      },
      {
        status: 500,
      },
    );
  }
}