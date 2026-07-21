import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDatabase } from "@/lib/mongodb";
import razorpay from "@/lib/razorpay";
import Order from "@/models/Order";

export const runtime = "nodejs";

type CreateRazorpayOrderRequest = {
  orderId?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CreateRazorpayOrderRequest;

    if (
      !body.orderId ||
      !mongoose.Types.ObjectId.isValid(body.orderId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Krinay order ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    const order = await Order.findById(body.orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
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
          message: "This order is not a prepaid order.",
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
          message: "This order has already been paid.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Razorpay expects the amount in the smallest currency unit.
     * ₹1 = 100 paise.
     */
    const amountInPaise = Math.round(order.pricing.total * 100);

    if (amountInPaise < 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment amount.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Existing Razorpay order ko reuse karenge, taaki customer
     * retry kare to unnecessary duplicate order na bane.
     */
    if (order.razorpayOrderId) {
      return NextResponse.json({
        success: true,

        razorpayOrder: {
          id: order.razorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
        },

        krinayOrder: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customer: order.customer,
          total: order.pricing.total,
        },
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,

      notes: {
        krinayOrderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json(
      {
        success: true,

        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },

        krinayOrder: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customer: order.customer,
          total: order.pricing.total,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create Razorpay order.",
      },
      {
        status: 500,
      },
    );
  }
}