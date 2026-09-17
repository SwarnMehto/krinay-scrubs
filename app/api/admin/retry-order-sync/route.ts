import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import {
  deductInventoryForOrder,
} from "@/lib/inventory";
import { syncOrderToShiprocket } from "@/lib/shiprocket";
import { safelyNotifyConfirmedOrder } from "@/lib/order-notifications";
import { awardOrderRewardIfEligible } from "@/lib/rewards";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type RazorpayPayment = {
  id: string;
  entity?: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  captured?: boolean;
  email?: string | null;
  contact?: string | null;
};

/*
 * =========================================================
 * RAZORPAY AUTH
 * =========================================================
 */

function getRazorpayAuthHeader() {
  const keyId =
    process.env.RAZORPAY_KEY_ID?.trim();

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing hai.",
    );
  }

  return `Basic ${Buffer.from(
    `${keyId}:${keySecret}`,
  ).toString("base64")}`;
}

/*
 * =========================================================
 * FETCH PAYMENT FROM RAZORPAY
 * =========================================================
 */

async function fetchRazorpayPayment(
  paymentId: string,
): Promise<RazorpayPayment> {
  const response =
    await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(
        paymentId,
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            getRazorpayAuthHeader(),

          Accept:
            "application/json",
        },

        cache: "no-store",
      },
    );

  const data =
    (await response.json()) as
      | RazorpayPayment
      | {
          error?: {
            description?: string;
          };
        };

  if (!response.ok) {
    const message =
      "error" in data
        ? data.error?.description
        : "";

    throw new Error(
      message ||
        `Razorpay payment fetch failed (${response.status}).`,
    );
  }

  return data as RazorpayPayment;
}

/*
 * =========================================================
 * AMOUNT HELPER
 * =========================================================
 */

function getOrderAmountPaise(
  order: InstanceType<typeof Order>,
) {
  /*
   * Different Order schemas may use different total fields.
   * Try known pricing fields safely.
   */

  const pricing =
    order.get("pricing") as
      | Record<string, unknown>
      | undefined;

  const possibleValues = [
    pricing?.grandTotal,
    pricing?.total,
    pricing?.finalTotal,
    pricing?.payableAmount,
    pricing?.totalAmount,

    order.get("grandTotal"),
    order.get("total"),
    order.get("totalAmount"),
  ];

  for (const value of possibleValues) {
    const number =
      Number(value);

    if (
      Number.isFinite(number) &&
      number > 0
    ) {
      return Math.round(
        number * 100,
      );
    }
  }

  return null;
}

/*
 * =========================================================
 * RECOVER PAYMENT
 * =========================================================
 */

async function recoverPaymentIfNeeded(
  order: InstanceType<typeof Order>,
) {
  if (
    order.paymentStatus === "paid"
  ) {
    return {
      recovered: false,
      alreadyPaid: true,
    };
  }

  const paymentId =
    String(
      order.get(
        "razorpayPaymentId",
      ) ?? "",
    ).trim();

  /*
   * If payment ID never reached MongoDB,
   * automatic recovery cannot safely guess it.
   */
  if (!paymentId) {
    return {
      recovered: false,
      alreadyPaid: false,
      skipped: true,
      reason:
        "razorpayPaymentId MongoDB me missing hai.",
    };
  }

  const payment =
    await fetchRazorpayPayment(
      paymentId,
    );

  /*
   * Razorpay must explicitly report captured.
   */
  if (
    payment.status !== "captured"
  ) {
    return {
      recovered: false,
      alreadyPaid: false,
      skipped: true,
      reason:
        `Razorpay payment status ${payment.status} hai, captured nahi.`,
    };
  }

  /*
   * Check Razorpay Order ID when both sides have one.
   */
  const mongoRazorpayOrderId =
    String(
      order.get(
        "razorpayOrderId",
      ) ?? "",
    ).trim();

  if (
    mongoRazorpayOrderId &&
    payment.order_id &&
    mongoRazorpayOrderId !==
      payment.order_id
  ) {
    throw new Error(
      `Razorpay order mismatch for ${order.orderNumber}.`,
    );
  }

  /*
   * Verify amount when we can resolve order total.
   */
  const expectedAmount =
    getOrderAmountPaise(
      order,
    );

  if (
    expectedAmount !== null &&
    payment.amount !==
      expectedAmount
  ) {
    throw new Error(
      `Payment amount mismatch for ${order.orderNumber}. Expected ${expectedAmount} paise, Razorpay returned ${payment.amount} paise.`,
    );
  }

  /*
   * Razorpay independently confirms captured payment.
   * Now it is safe to repair local payment state.
   */

  order.paymentStatus =
    "paid";

  if (
    order.orderStatus ===
      "pending" ||
    !order.orderStatus
  ) {
    order.orderStatus =
      "processing";
  }

  order.shipmentApprovalStatus =
    "pending";

  await order.save();

  console.log(
    "[ORDER_RECOVERY] Captured Razorpay payment recovered:",
    {
      orderNumber:
        order.orderNumber,

      paymentId:
        payment.id,

      amount:
        payment.amount,
    },
  );

  return {
    recovered: true,
    alreadyPaid: false,
    paymentId:
      payment.id,
  };
}

/*
 * =========================================================
 * PROCESS ONE PAID ORDER
 * =========================================================
 */

async function processPaidOrder(
  order: InstanceType<typeof Order>,
) {
  let inventoryHold =
    false;

  let inventoryError =
    "";

  /*
   * -------------------------------------------------------
   * INVENTORY
   * -------------------------------------------------------
   */

  if (
    !order.inventoryDeducted
  ) {
    try {
      await deductInventoryForOrder(
        order,
      );
    } catch (error) {
      inventoryHold =
        true;

      inventoryError =
        error instanceof Error
          ? error.message
          : "Inventory deduction failed.";

      order.orderStatus =
        "processing";

      order.shipmentApprovalStatus =
        "pending";

      order.adminNotes =
        [
          order.adminNotes,

          `INVENTORY HOLD: ${inventoryError}`,
        ]
          .filter(Boolean)
          .join("\n")
          .slice(
            0,
            1000,
          );

      await order.save();

      console.error(
        `[ORDER_RECOVERY] Inventory error for ${order.orderNumber}:`,
        error,
      );
    }
  }

  /*
   * -------------------------------------------------------
   * CONFIRM ORDER
   * -------------------------------------------------------
   */

  if (!inventoryHold) {
    order.paymentStatus =
      "paid";

    order.orderStatus =
      "confirmed";

    order.shipmentApprovalStatus =
      "pending";

    await order.save();
  }

  /*
   * -------------------------------------------------------
   * SHIPROCKET
   * -------------------------------------------------------
   */

  let shiprocketSynced =
    false;

  let shiprocketError =
    "";

  if (!inventoryHold) {
    try {
      const existingOrderId =
        String(
          order.get(
            "shiprocketOrderId",
          ) ?? "",
        ).trim();

      const existingShipmentId =
        String(
          order.get(
            "shiprocketShipmentId",
          ) ?? "",
        ).trim();

      /*
       * Only create when either ID is missing.
       *
       * syncOrderToShiprocket itself should also
       * be idempotent using orderNumber.
       */
      if (
        !existingOrderId ||
        !existingShipmentId
      ) {
        await syncOrderToShiprocket(
          order,
        );
      }

      const freshAfterSync =
        (await Order.findById(
          order._id,
        )) ?? order;

      shiprocketSynced =
        Boolean(
          freshAfterSync.get(
            "shiprocketOrderId",
          ) &&
            freshAfterSync.get(
              "shiprocketShipmentId",
            ),
        );

      if (!shiprocketSynced) {
        shiprocketError =
          "Shiprocket sync completed but order/shipment ID missing hai.";
      }
    } catch (error) {
      shiprocketError =
        error instanceof Error
          ? error.message
          : "Shiprocket sync failed.";

      console.error(
        `[ORDER_RECOVERY] Shiprocket error for ${order.orderNumber}:`,
        error,
      );
    }
  } else {
    shiprocketError =
      "Inventory hold ki wajah se Shiprocket sync pause hai.";
  }

  /*
   * -------------------------------------------------------
   * REWARD
   * -------------------------------------------------------
   */

  let reward: unknown =
    null;

  try {
    reward =
      await awardOrderRewardIfEligible(
        order,
      );
  } catch (error) {
    console.error(
      `[ORDER_RECOVERY] Reward error for ${order.orderNumber}:`,
      error,
    );
  }

  /*
   * -------------------------------------------------------
   * NOTIFICATION
   * -------------------------------------------------------
   */

  let notification: unknown =
    null;

  if (!inventoryHold) {
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
        `[ORDER_RECOVERY] Notification error for ${order.orderNumber}:`,
        error,
      );
    }
  }

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
     * SECURITY
     * =====================================================
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
      receivedSecret !==
        expectedSecret
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
     * =====================================================
     * OPTIONAL SINGLE ORDER
     * =====================================================
     *
     * Body:
     *
     * {
     *   "orderNumber": "KRN..."
     * }
     *
     * Empty body => all eligible orders.
     */

    let requestedOrderNumber =
      "";

    try {
      const body =
        (await request.json()) as {
          orderNumber?: string;
        };

      requestedOrderNumber =
        body.orderNumber?.trim() ??
        "";
    } catch {
      /*
       * Empty request body is allowed.
       */
    }

    /*
     * =====================================================
     * FIND ORDERS
     * =====================================================
     */

    const baseQuery: Record<
      string,
      unknown
    > = requestedOrderNumber
      ? {
          orderNumber:
            requestedOrderNumber,
        }
      : {
          paymentMethod:
            "prepaid",

          $or: [
            {
              paymentStatus:
                "paid",
            },

            /*
             * Pending orders can only be automatically
             * recovered if Razorpay payment ID was saved.
             */
            {
              paymentStatus:
                "pending",

              razorpayPaymentId: {
                $exists: true,
                $nin: [
                  null,
                  "",
                ],
              },
            },
          ],
        };

    const orders =
      await Order.find(
        baseQuery,
      ).sort({
        createdAt: 1,
      });

    if (!orders.length) {
      return NextResponse.json(
        {
          success: true,

          message:
            requestedOrderNumber
              ? "Order nahi mila."
              : "Koi eligible order nahi mila.",

          summary: {
            total: 0,
            recovered: 0,
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
     * =====================================================
     * PROCESS
     * =====================================================
     */

    const results = [];

    let recovered =
      0;

    let synced =
      0;

    let failed =
      0;

    for (
      const originalOrder of orders
    ) {
      try {
        /*
         * -----------------------------------------------
         * PAYMENT RECOVERY
         * -----------------------------------------------
         */

        const recovery =
          await recoverPaymentIfNeeded(
            originalOrder,
          );

        if (
          recovery.recovered
        ) {
          recovered += 1;
        }

        /*
         * Payment still isn't paid.
         *
         * Never ship it.
         */
        const afterRecovery =
          (await Order.findById(
            originalOrder._id,
          )) ?? originalOrder;

        if (
          afterRecovery.paymentStatus !==
          "paid"
        ) {
          failed += 1;

          results.push({
            orderNumber:
              afterRecovery.orderNumber,

            success: false,

            paymentStatus:
              afterRecovery.paymentStatus,

            reason:
              "Payment Razorpay se safely verify nahi ho paya.",

            recovery,
          });

          continue;
        }

        /*
         * -----------------------------------------------
         * INVENTORY + SHIPROCKET
         * -----------------------------------------------
         */

        const processed =
          await processPaidOrder(
            afterRecovery,
          );

        if (
          processed.shiprocketSynced
        ) {
          synced += 1;
        }

        if (
          processed.inventoryHold ||
          !processed.shiprocketSynced
        ) {
          failed += 1;
        }

        results.push({
          id:
            processed.freshOrder._id.toString(),

          orderNumber:
            processed.freshOrder.orderNumber,

          success:
            !processed.inventoryHold &&
            processed.shiprocketSynced,

          paymentStatus:
            processed.freshOrder.paymentStatus,

          orderStatus:
            processed.freshOrder.orderStatus,

          inventoryDeducted:
            processed.freshOrder.inventoryDeducted,

          inventoryHold:
            processed.inventoryHold,

          inventoryError:
            processed.inventoryError,

          razorpayPaymentId:
            processed.freshOrder.get(
              "razorpayPaymentId",
            ) ?? "",

          shiprocketSynced:
            processed.shiprocketSynced,

          shiprocketError:
            processed.shiprocketError,

          shiprocketOrderId:
            processed.freshOrder.get(
              "shiprocketOrderId",
            ) ?? "",

          shiprocketShipmentId:
            processed.freshOrder.get(
              "shiprocketShipmentId",
            ) ?? "",

          recovery,

          reward:
            processed.reward,

          notification:
            processed.notification,
        });
      } catch (error) {
        failed += 1;

        console.error(
          `[ORDER_RECOVERY_FATAL] ${originalOrder.orderNumber}:`,
          error,
        );

        results.push({
          orderNumber:
            originalOrder.orderNumber,

          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Recovery failed.",
        });
      }
    }

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return NextResponse.json(
      {
        success:
          failed === 0,

        message:
          `${orders.length} order(s) checked. ${recovered} payment(s) recovered, ${synced} Shiprocket sync(s), ${failed} issue(s).`,

        summary: {
          total:
            orders.length,

          recovered,

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
      "[ORDER_RECOVERY_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Order recovery failed.",
      },
      {
        status: 500,
      },
    );
  }
}