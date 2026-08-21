import { NextResponse } from "next/server";

import {
  attachExistingOrdersToUser,
  getAuthenticatedUserOrNull,
  serializeUser,
} from "@/lib/auth/account";
import { getRewardSummary } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUserOrNull();

    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    await attachExistingOrdersToUser(user);
    const rewards = await getRewardSummary(user._id.toString());
    user.points = rewards.points;

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        user: null,
        message: "Account session load nahi ho paaya.",
      },
      { status: 500 },
    );
  }
}
