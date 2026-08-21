import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { normalizeIdentity } from "@/lib/auth/identity";
import {
  createOtpRecord,
  deliverOtp,
  generateOtp,
  type OtpPurpose,
} from "@/lib/auth/otp";
import AuthOtp from "@/models/AuthOtp";
import User from "@/models/User";

export const runtime = "nodejs";

const allowedPurposes = new Set<OtpPurpose>([
  "register",
  "login",
  "reset",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      identifier?: string;
      purpose?: OtpPurpose;
    };

    const purpose = body.purpose;

    if (!purpose || !allowedPurposes.has(purpose)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP purpose.",
        },
        { status: 400 },
      );
    }

    const identity = normalizeIdentity(body.identifier ?? "");

    await connectDatabase();

    const user = await User.findOne(
      identity.channel === "email"
        ? { email: identity.identifier }
        : { phone: identity.identifier },
    ).lean();

    if (purpose === "register" && user) {
      return NextResponse.json(
        {
          success: false,
          message: "Is email/mobile se account already exist karta hai.",
        },
        { status: 409 },
      );
    }

    if ((purpose === "login" || purpose === "reset") && !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Is email/mobile se account nahi mila.",
        },
        { status: 404 },
      );
    }

    const recentOtp = await AuthOtp.findOne({
      identifier: identity.identifier,
      purpose,
      consumedAt: null,
      createdAt: {
        $gte: new Date(Date.now() - 60 * 1000),
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (recentOtp) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP already sent hai. 60 seconds baad resend karo.",
        },
        { status: 429 },
      );
    }

    const otp = generateOtp();

    const otpRecord = await createOtpRecord({
      identifier: identity.identifier,
      channel: identity.channel,
      purpose,
      otp,
    });

    let delivery;

    try {
      delivery = await deliverOtp({
        identifier: identity.identifier,
        channel: identity.channel,
        purpose,
        otp,
      });
    } catch (error) {
      otpRecord.consumedAt = new Date();
      await otpRecord.save();
      throw error;
    }

    return NextResponse.json({
      success: true,
      message:
        identity.channel === "email"
          ? "OTP email par send kar diya gaya hai."
          : "OTP mobile par send kar diya gaya hai.",
      channel: identity.channel,
      ...(delivery.devOtp
        ? {
            devOtp: delivery.devOtp,
            message:
              "Local development mode: OTP response aur terminal me available hai.",
          }
        : {}),
    });
  } catch (error) {
    console.error("Request OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "OTP send nahi ho paaya.",
      },
      { status: 500 },
    );
  }
}
