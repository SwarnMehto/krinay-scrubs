import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { getRazorpayClient } from "@/lib/razorpay";
import Order from "@/models/Order";

export const runtime = "nodejs";

type CreateRazorpayOrderRequest = {
  krinayOrderId?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CreateRazorpayOrderRequest;

    const krinayOrderId =
      body.krinayOrderId?.trim();

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

    if (order.paymentMethod !== "prepaid") {
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

    if (order.paymentStatus === "paid") {
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

    if (
      !order.pricing?.total ||
      order.pricing.total <= 0
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
     * Existing Razorpay order ko reuse karo.
     * Isse duplicate Razorpay orders create nahi honge.
     */
    if (order.razorpayOrderId) {
      return NextResponse.json({
        success: true,
        message:
          "Existing Razorpay order returned.",

        razorpayOrder: {
          id: order.razorpayOrderId,
          amount:
            Math.round(
              Number(order.pricing.total) *
                100,
            ),
          currency: "INR",
        },

        krinayOrder: {
          id: order._id.toString(),
          orderNumber:
            order.orderNumber,
          total:
            order.pricing.total,
        },
      });
    }

    const razorpay =
      getRazorpayClient();

    /*
     * Razorpay amount paise me leta hai.
     * ₹100 = 10000 paise.
     */
    const amountInPaise = Math.round(
      Number(order.pricing.total) * 100,
    );

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",

        receipt:
          order.orderNumber.slice(0, 40),

        notes: {
          krinayOrderId:
            order._id.toString(),

          orderNumber:
            order.orderNumber,
        },
      });

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "Razorpay order created successfully.",

        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency:
            razorpayOrder.currency,
        },

        krinayOrder: {
          id: order._id.toString(),
          orderNumber:
            order.orderNumber,
          total:
            order.pricing.total,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
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