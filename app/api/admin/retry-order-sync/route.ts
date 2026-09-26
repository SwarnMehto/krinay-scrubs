import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { deductInventoryForOrder } from "@/lib/inventory";
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

type RazorpayPaymentsResponse = {
  entity?: string;
  count?: number;
  items?: RazorpayPayment[];
};

type RazorpayErrorResponse = {
  error?: {
    description?: string;
  };
};

/*
 * =========================================================
 * RAZORPAY AUTH
 * =========================================================
 */

function getRazorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();

  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

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
 * FETCH SINGLE PAYMENT
 * =========================================================
 */

async function fetchRazorpayPayment(
  paymentId: string,
): Promise<RazorpayPayment> {
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(
      paymentId,
    )}`,
    {
      method: "GET",

      headers: {
        Authorization: getRazorpayAuthHeader(),
        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  const data = (await response.json()) as
    | RazorpayPayment
    | RazorpayErrorResponse;

  if (!response.ok) {
    const message =
      "error" in data ? data.error?.description : "";

    throw new Error(
      message ||
        `Razorpay payment fetch failed (${response.status}).`,
    );
  }

  return data as RazorpayPayment;
}

/*
 * =========================================================
 * FETCH PAYMENTS USING RAZORPAY ORDER ID
 *
 * IMPORTANT:
 * This fixes old orders where:
 *
 * MongoDB:
 * razorpayOrderId = order_xxxxx
 * razorpayPaymentId = ""
 *
 * but Razorpay actually has a captured payment.
 * =========================================================
 */

async function fetchRazorpayPaymentsForOrder(
  razorpayOrderId: string,
): Promise<RazorpayPayment[]> {
  const response = await fetch(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(
      razorpayOrderId,
    )}/payments`,
    {
      method: "GET",

      headers: {
        Authorization: getRazorpayAuthHeader(),
        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  const data = (await response.json()) as
    | RazorpayPaymentsResponse
    | RazorpayErrorResponse;

  if (!response.ok) {
    const message =
      "error" in data ? data.error?.description : "";

    throw new Error(
      message ||
        `Razorpay order payments fetch failed (${response.status}).`,
    );
  }

  return Array.isArray((data as RazorpayPaymentsResponse).items)
    ? (data as RazorpayPaymentsResponse).items!
    : [];
}

/*
 * =========================================================
 * AMOUNT HELPER
 * =========================================================
 */

function getOrderAmountPaise(
  order: InstanceType<typeof Order>,
) {
  const pricing = order.get("pricing") as
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
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return Math.round(number * 100);
    }
  }

  return null;
}

/*
 * =========================================================
 * FIND VALID CAPTURED PAYMENT
 * =========================================================
 */

async function findCapturedPayment(
  order: InstanceType<typeof Order>,
) {
  const existingPaymentId = String(
    order.get("razorpayPaymentId") ?? "",
  ).trim();

  const razorpayOrderId = String(
    order.get("razorpayOrderId") ?? "",
  ).trim();

  const expectedAmount = getOrderAmountPaise(order);

  /*
   * -------------------------------------------------------
   * OPTION 1
   * Existing payment ID available
   * -------------------------------------------------------
   */

  if (existingPaymentId) {
    const payment =
      await fetchRazorpayPayment(existingPaymentId);

    if (payment.status !== "captured") {
      return {
        payment: null,
        reason: `Razorpay payment status ${payment.status} hai, captured nahi.`,
      };
    }

    /*
     * Verify Razorpay order ID when available.
     */

    if (
      razorpayOrderId &&
      payment.order_id &&
      payment.order_id !== razorpayOrderId
    ) {
      throw new Error(
        `Razorpay order mismatch for ${order.orderNumber}.`,
      );
    }

    /*
     * Verify amount.
     */

    if (
      expectedAmount !== null &&
      payment.amount !== expectedAmount
    ) {
      throw new Error(
        `Payment amount mismatch for ${order.orderNumber}. Expected ${expectedAmount} paise, Razorpay returned ${payment.amount} paise.`,
      );
    }

    return {
      payment,
      reason: "Existing razorpayPaymentId verified.",
    };
  }

  /*
   * -------------------------------------------------------
   * OPTION 2
   * Payment ID missing.
   *
   * Search Razorpay using razorpayOrderId.
   * -------------------------------------------------------
   */

  if (!razorpayOrderId) {
    return {
      payment: null,
      reason:
        "MongoDB me razorpayPaymentId aur razorpayOrderId dono missing hain.",
    };
  }

  const payments =
    await fetchRazorpayPaymentsForOrder(
      razorpayOrderId,
    );

  if (!payments.length) {
    return {
      payment: null,
      reason:
        "Razorpay Order ID ke against koi payment nahi mila.",
    };
  }

  /*
   * Only captured payments are eligible.
   */

  const capturedPayments = payments.filter(
    (payment) =>
      payment.status === "captured" ||
      payment.captured === true,
  );

  if (!capturedPayments.length) {
    return {
      payment: null,
      reason:
        "Razorpay order mila, lekin captured payment nahi mila.",
    };
  }

  /*
   * Prefer exact amount match.
   */

  let selectedPayment: RazorpayPayment | undefined;

  if (expectedAmount !== null) {
    selectedPayment = capturedPayments.find(
      (payment) =>
        payment.amount === expectedAmount,
    );
  }

  /*
   * If there is only one captured payment,
   * it is safe to use it.
   */

  if (!selectedPayment && capturedPayments.length === 1) {
    selectedPayment = capturedPayments[0];
  }

  /*
   * Multiple captured payments with no exact amount match
   * should NOT be guessed.
   */

  if (!selectedPayment) {
    throw new Error(
      `Razorpay order ${razorpayOrderId} me multiple captured payments mile, lekin exact amount match nahi mila. Automatic recovery stop ki gayi.`,
    );
  }

  /*
   * Final order ID verification.
   */

  if (
    selectedPayment.order_id &&
    selectedPayment.order_id !== razorpayOrderId
  ) {
    throw new Error(
      `Razorpay payment/order mismatch for ${order.orderNumber}.`,
    );
  }

  /*
   * Final amount verification.
   */

  if (
    expectedAmount !== null &&
    selectedPayment.amount !== expectedAmount
  ) {
    throw new Error(
      `Payment amount mismatch for ${order.orderNumber}. Expected ${expectedAmount} paise, Razorpay returned ${selectedPayment.amount} paise.`,
    );
  }

  return {
    payment: selectedPayment,
    reason:
      "Captured payment found using razorpayOrderId.",
  };
}

/*
 * =========================================================
 * RECOVER PAYMENT
 * =========================================================
 */

async function recoverPaymentIfNeeded(
  order: InstanceType<typeof Order>,
) {
  if (order.paymentStatus === "paid") {
    return {
      recovered: false,
      alreadyPaid: true,
      paymentId: String(
        order.get("razorpayPaymentId") ?? "",
      ).trim(),
    };
  }

  const result =
    await findCapturedPayment(order);

  if (!result.payment) {
    return {
      recovered: false,
      alreadyPaid: false,
      skipped: true,
      reason: result.reason,
    };
  }

  const payment = result.payment;

  /*
   * -------------------------------------------------------
   * SAVE PAYMENT ID
   * -------------------------------------------------------
   */

  order.razorpayPaymentId = payment.id;

  /*
   * -------------------------------------------------------
   * MARK PAID
   * -------------------------------------------------------
   */

  order.paymentStatus = "paid";

  if (
    order.orderStatus === "pending" ||
    !order.orderStatus
  ) {
    order.orderStatus = "processing";
  }

  order.shipmentApprovalStatus = "pending";

  await order.save();

  console.log(
    "[ORDER_RECOVERY] Captured Razorpay payment recovered:",
    {
      orderNumber: order.orderNumber,
      razorpayOrderId:
        order.get("razorpayOrderId"),
      paymentId: payment.id,
      amount: payment.amount,
      reason: result.reason,
    },
  );

  return {
    recovered: true,
    alreadyPaid: false,
    paymentId: payment.id,
    reason: result.reason,
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
  let inventoryHold = false;
  let inventoryError = "";

  /*
   * -------------------------------------------------------
   * INVENTORY
   * -------------------------------------------------------
   */

  if (!order.inventoryDeducted) {
    try {
      await deductInventoryForOrder(order);
    } catch (error) {
      inventoryHold = true;

      inventoryError =
        error instanceof Error
          ? error.message
          : "Inventory deduction failed.";

      order.orderStatus = "processing";

      order.shipmentApprovalStatus = "pending";

      order.adminNotes = [
        order.adminNotes,
        `INVENTORY HOLD: ${inventoryError}`,
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 1000);

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
    order.paymentStatus = "paid";

    order.orderStatus = "confirmed";

    order.shipmentApprovalStatus = "pending";

    await order.save();
  }

  /*
   * -------------------------------------------------------
   * SHIPROCKET
   * -------------------------------------------------------
   */

  let shiprocketSynced = false;
  let shiprocketError = "";

  if (!inventoryHold) {
    try {
      const existingOrderId = String(
        order.get("shiprocketOrderId") ?? "",
      ).trim();

      const existingShipmentId = String(
        order.get("shiprocketShipmentId") ?? "",
      ).trim();

      /*
       * Only sync when IDs are missing.
       */

      if (
        !existingOrderId ||
        !existingShipmentId
      ) {
        await syncOrderToShiprocket(order);
      }

      const freshAfterSync =
        (await Order.findById(order._id)) ??
        order;

      shiprocketSynced = Boolean(
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

  let reward: unknown = null;

  try {
    reward =
      await awardOrderRewardIfEligible(order);
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

  let notification: unknown = null;

  if (!inventoryHold) {
    try {
      notification =
        await safelyNotifyConfirmedOrder(order);
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
    (await Order.findById(order._id)) ??
    order;

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
     * =====================================================
     * OPTIONAL SINGLE ORDER
     * =====================================================
     *
     * Body:
     *
     * {
     *   "orderNumber": "KRN260915572682"
     * }
     *
     * Empty body => all eligible prepaid orders.
     */

    let requestedOrderNumber = "";

    try {
      const body =
        (await request.json()) as {
          orderNumber?: string;
        };

      requestedOrderNumber =
        body.orderNumber?.trim() ?? "";
    } catch {
      /*
       * Empty body is allowed.
       */
    }

    /*
     * =====================================================
     * FIND ORDERS
     * =====================================================
     *
     * IMPORTANT FIX:
     *
     * Single order request:
     * -> directly find that order.
     *
     * All orders:
     * -> include prepaid paid orders
     * -> include prepaid pending orders that have either
     *    razorpayPaymentId OR razorpayOrderId
     *
     * This allows old orders whose payment ID was not saved
     * but Razorpay Order ID was saved to be recovered.
     */

    const baseQuery: Record<string, unknown> =
      requestedOrderNumber
        ? {
            orderNumber:
              requestedOrderNumber,
          }
        : {
            paymentMethod: "prepaid",

            $or: [
              {
                paymentStatus: "paid",
              },

              {
                paymentStatus: "pending",

                $or: [
                  {
                    razorpayPaymentId: {
                      $exists: true,
                      $nin: [null, ""],
                    },
                  },

                  {
                    razorpayOrderId: {
                      $exists: true,
                      $nin: [null, ""],
                    },
                  },
                ],
              },
            ],
          };

    const orders =
      await Order.find(baseQuery).sort({
        createdAt: 1,
      });

    if (!orders.length) {
      return NextResponse.json(
        {
          success: true,

          message: requestedOrderNumber
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

    let recovered = 0;
    let synced = 0;
    let failed = 0;

    for (const originalOrder of orders) {
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

        if (recovery.recovered) {
          recovered += 1;
        }

        /*
         * -----------------------------------------------
         * RELOAD ORDER
         * -----------------------------------------------
         */

        const afterRecovery =
          (await Order.findById(
            originalOrder._id,
          )) ?? originalOrder;

        /*
         * -----------------------------------------------
         * PAYMENT NOT CAPTURED
         * -----------------------------------------------
         *
         * Do NOT send unpaid order to Shiprocket
         * in this old-order recovery route.
         */

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

            razorpayOrderId:
              afterRecovery.get(
                "razorpayOrderId",
              ) ?? "",

            razorpayPaymentId:
              afterRecovery.get(
                "razorpayPaymentId",
              ) ?? "",

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

          razorpayOrderId:
            processed.freshOrder.get(
              "razorpayOrderId",
            ) ?? "",

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
        success: failed === 0,

        message:
          `${orders.length} order(s) checked. ` +
          `${recovered} payment(s) recovered, ` +
          `${synced} Shiprocket sync(s), ` +
          `${failed} issue(s).`,

        summary: {
          total: orders.length,
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