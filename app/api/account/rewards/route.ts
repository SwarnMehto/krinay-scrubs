import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/account";
import {
  FREE_SCRUB_POINTS,
  ORDER_REWARD_MINIMUM,
  ORDER_REWARD_POINTS,
  SIGNUP_BONUS_POINTS,
  getRewardSummary,
} from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const summary = await getRewardSummary(user._id.toString());

    return NextResponse.json({
      success: true,
      ...summary,
      rules: {
        signupBonus: SIGNUP_BONUS_POINTS,
        orderMinimum: ORDER_REWARD_MINIMUM,
        orderPoints: ORDER_REWARD_POINTS,
        freeScrubPoints: FREE_SCRUB_POINTS,
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

    console.error("Rewards load error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Rewards wallet load nahi ho paaya.",
      },
      { status: 500 },
    );
  }
}
