import { NextResponse } from "next/server";

import { attachExistingOrdersToUser, requireAuthenticatedUser } from "@/lib/auth/account";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    await attachExistingOrdersToUser(user);

    const orders = await Order.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        id: String(order._id),
        orderNumber: order.orderNumber,
        items: order.items,
        pricing: order.pricing,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        trackingUrl: order.trackingUrl ?? "",
        awbCode: order.awbCode ?? "",
        courierName: order.courierName ?? "",
        rewardPointsAwarded: Number(order.rewardPointsAwarded ?? 0),
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json(
        {
          success: false,
          message: "Login required.",
        },
        { status: 401 },
      );
    }

    console.error("Account orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Order history load nahi ho paayi.",
      },
      { status: 500 },
    );
  }
}
