import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { attachExistingOrdersToUser, serializeUser } from "@/lib/auth/account";
import { normalizeIdentity } from "@/lib/auth/identity";
import { verifyOtp } from "@/lib/auth/otp";
import { verifyPassword } from "@/lib/auth/password";
import { attachSessionCookie } from "@/lib/auth/session";
import { getRewardSummary } from "@/lib/rewards";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      identifier?: string;
      password?: string;
      otp?: string;
      mode?: "password" | "otp";
    };

    const identity = normalizeIdentity(body.identifier ?? "");
    const mode = body.mode === "otp" ? "otp" : "password";

    await connectDatabase();

    const user = await User.findOne(
      identity.channel === "email"
        ? { email: identity.identifier, isActive: true }
        : { phone: identity.identifier, isActive: true },
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Account nahi mila.",
        },
        { status: 404 },
      );
    }

    if (mode === "otp") {
      const otp = body.otp?.trim() ?? "";

      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          {
            success: false,
            message: "6-digit OTP enter karo.",
          },
          { status: 400 },
        );
      }

      await verifyOtp({
        identifier: identity.identifier,
        purpose: "login",
        otp,
      });
    } else {
      const password = body.password ?? "";
      const valid = await verifyPassword(password, user.passwordHash);

      if (!valid) {
        return NextResponse.json(
          {
            success: false,
            message: "Password incorrect hai.",
          },
          { status: 401 },
        );
      }
    }

    await attachExistingOrdersToUser(user);
    const rewards = await getRewardSummary(user._id.toString());
    user.points = rewards.points;

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: serializeUser(user),
    });

    return attachSessionCookie(response, user._id.toString());
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Login nahi ho paaya.",
      },
      { status: 500 },
    );
  }
}
