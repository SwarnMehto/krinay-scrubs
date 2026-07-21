import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderNumber =
      String(body.orderNumber ?? "")
        .trim()
        .toUpperCase();

    const phone =
      String(body.phone ?? "").trim();

    if (
      !orderNumber ||
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid order number aur phone required hain.",
        },
        { status: 400 },
      );
    }

    await connectDatabase();

    const order = await Order.findOne({
      orderNumber,
      "customer.phone": phone,
    })
      .select({
        orderNumber: 1,
        createdAt: 1,
        orderStatus: 1,
        paymentStatus: 1,
        paymentMethod: 1,
        shipmentApprovalStatus: 1,
        courierName: 1,
        awbCode: 1,
        trackingUrl: 1,
        shiprocketOrderId: 1,
        shiprocketShipmentId: 1,
      })
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order number aur phone match nahi hua.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,

      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,

        shipmentApprovalStatus:
          order.shipmentApprovalStatus,

        courierName:
          order.courierName ?? "",

        awbCode:
          order.awbCode ?? "",

        trackingUrl:
          order.trackingUrl ?? "",

        shiprocketReady: Boolean(
          order.shiprocketOrderId &&
            order.shiprocketShipmentId,
        ),
      },
    });
  } catch (error) {
    console.error(
      "Track order error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Order track nahi ho paya.",
      },
      { status: 500 },
    );
  }
}