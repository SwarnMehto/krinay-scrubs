import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { normalizeIdentity } from "@/lib/auth/identity";
import { verifyOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      identifier?: string;
      otp?: string;
      newPassword?: string;
    };

    const identity = normalizeIdentity(body.identifier ?? "");
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

    await verifyOtp({
      identifier: identity.identifier,
      purpose: "reset",
      otp,
    });

    user.passwordHash = await hashPassword(body.newPassword ?? "");
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset ho gaya. Ab login karo.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Password reset nahi ho paaya.",
      },
      { status: 500 },
    );
  }
}
