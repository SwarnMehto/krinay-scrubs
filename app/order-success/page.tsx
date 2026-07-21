import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import {
  syncOrderToShiprocket,
} from "@/lib/shiprocket";
import { connectDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export const runtime = "nodejs";

type VerifyPaymentRequest = {
  krinayOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as VerifyPaymentRequest;

    const {
      krinayOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

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

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET missing hai.",
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

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        message:
          "Payment already verified hai.",

        order: {
          orderNumber:
            order.orderNumber,
        },
      });
    }

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !==
        razorpayOrderId
    ) {
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

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        keySecret,
      )
      .update(
        `${order.razorpayOrderId}|${razorpayPaymentId}`,
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8",
    );

    const receivedBuffer = Buffer.from(
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
      order.paymentStatus = "failed";
      await order.save();

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

    order.razorpayPaymentId =
      razorpayPaymentId;

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    /*
     * Shiprocket manual approval pending hi rahega.
     */
    order.shipmentApprovalStatus =
      "pending";

    await order.save();

    return NextResponse.json({
      success: true,
      message:
        "Payment verified successfully.",

      order: {
        id: order._id.toString(),
        orderNumber:
          order.orderNumber,
        paymentStatus:
          order.paymentStatus,
        orderStatus:
          order.orderStatus,
      },
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
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