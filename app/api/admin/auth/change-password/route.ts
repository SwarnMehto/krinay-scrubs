import crypto from "crypto";
import { NextResponse } from "next/server";

import {
  clearAdminSession,
  hashAdminPassword,
} from "@/lib/admin-auth";

import { requireAdmin } from "@/lib/require-admin";

import AdminPasswordOtp from "@/models/AdminPasswordOtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  otp?: string;
  newPassword?: string;
};

export async function POST(
  request: Request,
) {
  try {
    const auth = await requireAdmin();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const body =
      (await request.json()) as RequestBody;

    const otp =
      body.otp?.trim() ?? "";

    const newPassword =
      body.newPassword ?? "";

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter the valid 6-digit OTP.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must contain at least 10 characters.",
        },
        { status: 400 },
      );
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must include uppercase, lowercase, number and special character.",
        },
        { status: 400 },
      );
    }

    const otpRecord =
      await AdminPasswordOtp.findOne({
        adminId: auth.admin._id,
      });

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No active OTP found. Please request a new OTP.",
        },
        { status: 400 },
      );
    }

    if (
      otpRecord.expiresAt.getTime() <
      Date.now()
    ) {
      await AdminPasswordOtp.deleteOne({
        _id: otpRecord._id,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        },
        { status: 400 },
      );
    }

    if (otpRecord.attempts >= 5) {
      await AdminPasswordOtp.deleteOne({
        _id: otpRecord._id,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Please request a new OTP.",
        },
        { status: 429 },
      );
    }

    const receivedHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expectedBuffer =
      Buffer.from(
        otpRecord.otpHash,
        "hex",
      );

    const receivedBuffer =
      Buffer.from(
        receivedHash,
        "hex",
      );

    const validOtp =
      expectedBuffer.length ===
        receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer,
      );

    if (!validOtp) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "Incorrect OTP.",
        },
        { status: 400 },
      );
    }

    auth.admin.passwordHash =
      await hashAdminPassword(
        newPassword,
      );

    auth.admin.passwordChangedAt =
      new Date();

    await auth.admin.save();

    await AdminPasswordOtp.deleteOne({
      _id: otpRecord._id,
    });

    /*
     * Security:
     * force fresh login after password change.
     */
    await clearAdminSession();

    return NextResponse.json({
      success: true,

      message:
        "Password changed successfully. Please sign in again.",

      requireLogin: true,
    });
  } catch (error) {
    console.error(
      "[ADMIN_PASSWORD_CHANGE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to change password.",
      },
      { status: 500 },
    );
  }
}