import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import {
  attachExistingOrdersToUser,
  serializeUser,
} from "@/lib/auth/account";

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

      /*
       * Email OTP verification ke liye required.
       * Mobile/Twilio OTP me empty ho sakta hai.
       */
      otpToken?: string;

      mode?: "password" | "otp";
    };

    const identifier =
      body.identifier?.trim() ?? "";

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email ya mobile number enter karo.",
        },
        {
          status: 400,
        },
      );
    }

    const identity =
      normalizeIdentity(identifier);

    const mode =
      body.mode === "otp"
        ? "otp"
        : "password";

    await connectDatabase();

    const user = await User.findOne(
      identity.type === "email"
        ? {
            email: identity.value,
            isActive: true,
          }
        : {
            phone: identity.value,
            isActive: true,
          },
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Account nahi mila.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =====================================================
     * OTP LOGIN
     * =====================================================
     */

    if (mode === "otp") {
      const otp =
        body.otp?.trim() ?? "";

      if (!/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "6-digit OTP enter karo.",
          },
          {
            status: 400,
          },
        );
      }

      const verification =
        await verifyOtp({
          rawIdentity:
            identity.value,

          code:
            otp,

          otpToken:
            body.otpToken ?? "",
        });

      if (!verification.success) {
        return NextResponse.json(
          {
            success: false,
            message:
              "OTP invalid ya expire ho gaya hai.",
          },
          {
            status: 401,
          },
        );
      }
    }

    /*
     * =====================================================
     * PASSWORD LOGIN
     * =====================================================
     */

    else {
      const password =
        body.password ?? "";

      if (!password) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password enter karo.",
          },
          {
            status: 400,
          },
        );
      }

      const valid =
        await verifyPassword(
          password,
          user.passwordHash,
        );

      if (!valid) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password incorrect hai.",
          },
          {
            status: 401,
          },
        );
      }
    }

    /*
     * =====================================================
     * ACCOUNT / REWARDS
     * =====================================================
     */

    await attachExistingOrdersToUser(
      user,
    );

    const rewards =
      await getRewardSummary(
        user._id.toString(),
      );

    user.points =
      rewards.points;

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    const response =
      NextResponse.json({
        success: true,

        message:
          "Login successful.",

        user:
          serializeUser(user),
      });

    return attachSessionCookie(
      response,
      user._id.toString(),
    );
  } catch (error) {
    console.error(
      "[AUTH] Login error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Login nahi ho paaya.",
      },
      {
        status: 500,
      },
    );
  }
}