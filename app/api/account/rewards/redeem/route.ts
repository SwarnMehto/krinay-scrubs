import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/account";
import { redeemFreeScrub } from "@/lib/rewards";

export async function POST() {
  try {
    const user = await requireAuthenticatedUser();
    const result = await redeemFreeScrub(user._id.toString());

    return NextResponse.json({
      success: true,
      message: "Free customized scrub reward unlocked!",
      balance: result.balance,
      redemption: {
        id: result.redemption._id.toString(),
        code: result.redemption.code,
        status: result.redemption.status,
        pointsSpent: result.redemption.pointsSpent,
        createdAt: result.redemption.createdAt,
      },
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

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Reward redeem nahi ho paaya.",
      },
      { status: 400 },
    );
  }
}
