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
            "A valid Krinay order ID is required.",
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
     * 7. VALIDATE CURRENT ORDER TOTAL
     * ==============================
     *
     * IMPORTANT:
     *
     * Razorpay amount yahi current
     * MongoDB order total se niklega.
     *
     * Isliye agar Olive/Wine ka price
     * ₹1899 ho gaya hai, to naya
     * Razorpay order bhi updated total
     * ke according banega.
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
     * 8. GET RAZORPAY CLIENT
     * ==============================
     */

    const razorpay =
      getRazorpayClient();

    /*
     * ==============================
     * 9. CHECK EXISTING RAZORPAY ORDER
     * ==============================
     *
     * IMPORTANT FIX:
     *
     * Pehle code sirf MongoDB me saved
     * razorpayOrderId dekh kar return
     * kar raha tha.
     *
     * Problem:
     *
     * Agar old price ke time Razorpay
     * order bana tha, example:
     *
     * Old amount = ₹1699
     *
     * Aur ab product:
     *
     * New amount = ₹1899
     *
     * To old Razorpay order ID reuse
     * nahi honi chahiye.
     *
     * Ab hum Razorpay se actual order
     * fetch karke amount verify karenge.
     */

    if (
      order.razorpayOrderId
    ) {
      try {
        const existingRazorpayOrder =
          await razorpay.orders.fetch(
            order.razorpayOrderId,
          );

        const existingAmount =
          Number(
            existingRazorpayOrder.amount,
          );

        const existingCurrency =
          String(
            existingRazorpayOrder.currency ||
              "INR",
          ).toUpperCase();

        /*
         * ==============================
         * 9A. AMOUNT MATCH
         * ==============================
         *
         * Existing Razorpay order ka
         * amount current MongoDB order
         * amount ke same hai.
         *
         * To same Razorpay order safely
         * reuse kar sakte hain.
         */

        if (
          existingCurrency === "INR" &&
          existingAmount ===
            amountInPaise
        ) {
          /*
           * Agar already paid hai to
           * MongoDB payment status ko
           * blindly ignore nahi karna.
           */

          if (
            String(
              existingRazorpayOrder.status,
            ).toLowerCase() ===
            "paid"
          ) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Razorpay payment already complete hai. Order reconciliation required hai.",
              },
              {
                status: 409,
              },
            );
          }

          return NextResponse.json(
            {
              success: true,
              message:
                "Existing Razorpay order returned.",

              razorpayOrder: {
                id:
                  existingRazorpayOrder.id,

                amount:
                  existingAmount,

                currency:
                  existingCurrency,
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
         * 9B. AMOUNT MISMATCH
         * ==============================
         *
         * Example:
         *
         * Razorpay old order:
         * ₹1699
         *
         * Current MongoDB order:
         * ₹1899
         *
         * Old Razorpay order reuse nahi
         * karenge.
         *
         * Razorpay existing order amount
         * ko edit nahi kiya ja sakta.
         *
         * Isliye new Razorpay order
         * create hoga.
         */

        console.warn(
          "[RAZORPAY_AMOUNT_MISMATCH]",
          {
            krinayOrderId:
              order._id.toString(),

            razorpayOrderId:
              order.razorpayOrderId,

            existingAmount,
            currentAmount:
              amountInPaise,

            existingCurrency,
            expectedCurrency:
              "INR",
          },
        );

        /*
         * Purani ID clear kar rahe hain.
         *
         * Ab neeche new Razorpay order
         * create hoga.
         */

        order.razorpayOrderId = "";

        await order.save();
      } catch (error) {
        /*
         * Existing Razorpay order fetch
         * fail hua.
         *
         * Safety ke liye directly new
         * order create nahi karenge.
         *
         * Pehle error return karenge,
         * taki accidental duplicate
         * Razorpay orders na bane.
         */

        console.error(
          "[RAZORPAY_EXISTING_ORDER_FETCH_ERROR]",
          error,
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Existing Razorpay order verify nahi ho paya. Please retry.",
          },
          {
            status: 502,
          },
        );
      }
    }

    /*
     * ==============================
     * 10. CREATE NEW RAZORPAY ORDER
     * ==============================
     *
     * Yahan hamesha CURRENT
     * amountInPaise use hoga.
     *
     * Example:
     *
     * Current total = ₹1899
     *
     * Razorpay amount =
     * 189900 paise
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

            /*
             * Helpful debugging information.
             */
            orderTotal:
              String(
                totalAmount,
              ),
          },
        },
      );

    /*
     * ==============================
     * 11. VALIDATE RAZORPAY RESPONSE
     * ==============================
     */

    if (
      !razorpayOrder.id
    ) {
      throw new Error(
        "Razorpay se valid order ID nahi mili.",
      );
    }

    /*
     * Extra safety:
     *
     * Razorpay ne jo amount return kiya
     * hai, woh current order amount ke
     * exactly same hona chahiye.
     */

    if (
      Number(
        razorpayOrder.amount,
      ) !== amountInPaise
    ) {
      console.error(
        "[RAZORPAY_CREATED_AMOUNT_MISMATCH]",
        {
          razorpayOrderId:
            razorpayOrder.id,

          razorpayAmount:
            razorpayOrder.amount,

          expectedAmount:
            amountInPaise,
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay amount current order amount se match nahi kar raha.",
        },
        {
          status: 502,
        },
      );
    }

    /*
     * ==============================
     * 12. SAVE NEW RAZORPAY ORDER ID
     * ==============================
     */

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    /*
     * ==============================
     * 13. RESPONSE TO CHECKOUT
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