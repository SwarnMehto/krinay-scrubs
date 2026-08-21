import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { getRazorpayClient } from "@/lib/razorpay";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * New frontend:
 * {
 *   krinayOrderId: "mongo_object_id"
 * }
 *
 * Old frontend compatibility:
 * {
 *   orderId: "mongo_object_id"
 * }
 */
type CreateRazorpayOrderRequest = {
  krinayOrderId?: string;
  orderId?: string;
};

export async function POST(
  request: Request,
) {
  try {
    /*
     * ==============================
     * 1. READ REQUEST BODY
     * ==============================
     */

    const body =
      (await request.json()) as CreateRazorpayOrderRequest;

    /*
     * New aur old dono field names accept karenge.
     */
    const krinayOrderId =
      body.krinayOrderId?.trim() ||
      body.orderId?.trim() ||
      "";

    /*
     * ==============================
     * 2. VALIDATE ORDER ID
     * ==============================
     */

    if (
      !krinayOrderId ||
      !mongoose.Types.ObjectId.isValid(
        krinayOrderId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Valid Krinay order ID required hai.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==============================
     * 3. CONNECT DATABASE
     * ==============================
     */

    await connectDatabase();

    /*
     * ==============================
     * 4. FIND KRINAY ORDER
     * ==============================
     */

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
     * ==============================
     * 5. ONLY PREPAID ORDER
     * ==============================
     */

    if (
      order.paymentMethod !==
      "prepaid"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Razorpay order sirf prepaid orders ke liye create ho sakta hai.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==============================
     * 6. ALREADY PAID CHECK
     * ==============================
     */

    if (
      order.paymentStatus ===
      "paid"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Is order ki payment already complete hai.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==============================
     * 7. VALIDATE ORDER TOTAL
     * ==============================
     */

    const totalAmount =
      Number(
        order.pricing?.total,
      );

    if (
      !Number.isFinite(
        totalAmount,
      ) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Order amount invalid hai.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Razorpay amount PAISA me hota hai.
     *
     * ₹100
     * =
     * 10000 paise
     */
    const amountInPaise =
      Math.round(
        totalAmount * 100,
      );

    /*
     * Extra safety.
     */
    if (
      !Number.isInteger(
        amountInPaise,
      ) ||
      amountInPaise <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Razorpay payment amount invalid hai.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ==============================
     * 8. REUSE EXISTING
     *    RAZORPAY ORDER
     * ==============================
     *
     * Customer double click kare,
     * page refresh kare ya API
     * dubara hit ho:
     *
     * duplicate Razorpay order
     * create nahi hoga.
     */

    if (
      order.razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: true,

          message:
            "Existing Razorpay order returned.",

          razorpayOrder: {
            id:
              order.razorpayOrderId,

            amount:
              amountInPaise,

            currency:
              "INR",
          },

          krinayOrder: {
            id:
              order._id.toString(),

            orderNumber:
              order.orderNumber,

            total:
              totalAmount,
          },
        },
        {
          status: 200,
        },
      );
    }

    /*
     * ==============================
     * 9. GET RAZORPAY CLIENT
     * ==============================
     */

    const razorpay =
      getRazorpayClient();

    /*
     * ==============================
     * 10. CREATE RAZORPAY ORDER
     * ==============================
     */

    const razorpayOrder =
      await razorpay.orders.create(
        {
          amount:
            amountInPaise,

          currency:
            "INR",

          /*
           * Razorpay receipt ki
           * length safe rakho.
           */
          receipt:
            String(
              order.orderNumber,
            ).slice(
              0,
              40,
            ),

          notes: {
            krinayOrderId:
              order._id.toString(),

            orderNumber:
              String(
                order.orderNumber,
              ),
          },
        },
      );

    /*
     * Razorpay order ID mandatory hai.
     */
    if (
      !razorpayOrder.id
    ) {
      throw new Error(
        "Razorpay se valid order ID nahi mili.",
      );
    }

    /*
     * ==============================
     * 11. SAVE RAZORPAY ORDER ID
     * ==============================
     */

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    /*
     * ==============================
     * 12. RESPONSE TO CHECKOUT
     * ==============================
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Razorpay order created successfully.",

        razorpayOrder: {
          id:
            razorpayOrder.id,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency ||
            "INR",
        },

        krinayOrder: {
          id:
            order._id.toString(),

          orderNumber:
            order.orderNumber,

          total:
            totalAmount,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "[CREATE_RAZORPAY_ORDER_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Razorpay order create nahi ho paya.",
      },
      {
        status: 500,
      },
    );
  }
}