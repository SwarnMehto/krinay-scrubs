import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { syncOrderToShiprocket } from "@/lib/shiprocket";
import { safelyNotifyConfirmedOrder } from "@/lib/order-notifications";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==========================================
     * SECURITY
     * ==========================================
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

    await connectDatabase();

    /*
     * ==========================================
     * FIND ALL PAID BUT UNSYNCED ORDERS
     * ==========================================
     *
     * Sirf wo orders:
     *
     * paymentStatus = paid
     *
     * AND
     *
     * Shiprocket order/shipment ID missing hai.
     */
    const orders =
      await Order.find({
        paymentStatus: "paid",

        $or: [
          {
            shiprocketOrderId: {
              $exists: false,
            },
          },

          {
            shiprocketOrderId: null,
          },

          {
            shiprocketOrderId: "",
          },

          {
            shiprocketShipmentId: {
              $exists: false,
            },
          },

          {
            shiprocketShipmentId: null,
          },

          {
            shiprocketShipmentId: "",
          },
        ],
      }).sort({
        createdAt: 1,
      });

    if (!orders.length) {
      return NextResponse.json(
        {
          success: true,

          message:
            "Koi paid unsynced order nahi mila.",

          summary: {
            total: 0,
            synced: 0,
            failed: 0,
          },

          results: [],
        },
        {
          status: 200,
        },
      );
    }

    /*
     * ==========================================
     * RETRY ALL ORDERS
     * ==========================================
     */
    const results = [];

    let synced = 0;
    let failed = 0;

    for (const order of orders) {
      let shiprocketSynced = false;
      let shiprocketError = "";
      let notification:
        | unknown
        | null = null;

      /*
       * ==========================================
       * SHIPROCKET
       * ==========================================
       */
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
          `[ORDER_RETRY_UNSYNCED] Shiprocket error for ${order.orderNumber}:`,
          error,
        );
      }

      /*
       * ==========================================
       * NOTIFICATION RETRY
       * ==========================================
       *
       * Existing safe notification helper
       * duplicate notification prevent kare
       * to ye safe hai.
       */
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
          `[ORDER_RETRY_UNSYNCED] Notification error for ${order.orderNumber}:`,
          error,
        );
      }

      /*
       * ==========================================
       * FRESH ORDER DATA
       * ==========================================
       */
      const freshOrder =
        (await Order.findById(
          order._id,
        )) ?? order;

      /*
       * ==========================================
       * RESULT COUNTS
       * ==========================================
       */
      if (
        freshOrder.shiprocketOrderId &&
        freshOrder.shiprocketShipmentId
      ) {
        synced += 1;
        shiprocketSynced = true;
      } else {
        failed += 1;
      }

      results.push({
        id:
          freshOrder._id.toString(),

        orderNumber:
          freshOrder.orderNumber,

        paymentStatus:
          freshOrder.paymentStatus,

        orderStatus:
          freshOrder.orderStatus,

        razorpayPaymentId:
          freshOrder.razorpayPaymentId ??
          "",

        shiprocketSynced,

        shiprocketError,

        shiprocketOrderId:
          freshOrder.shiprocketOrderId ??
          "",

        shiprocketShipmentId:
          freshOrder.shiprocketShipmentId ??
          "",

        adminOrderNotifiedAt:
          freshOrder.adminOrderNotifiedAt ??
          null,

        notification,
      });
    }

    /*
     * ==========================================
     * FINAL RESPONSE
     * ==========================================
     */
    return NextResponse.json(
      {
        success: failed === 0,

        message:
          failed === 0
            ? `${synced} paid unsynced order(s) successfully Shiprocket par sync ho gaye.`
            : `${synced} order(s) synced, ${failed} order(s) fail hue.`,

        summary: {
          total: orders.length,
          synced,
          failed,
        },

        results,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[ORDER_RETRY_UNSYNCED_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unsynced orders retry failed.",
      },
      {
        status: 500,
      },
    );
  }
}