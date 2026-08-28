import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { normalizeIdentity } from "@/lib/auth/identity";
import { sendOtp } from "@/lib/auth/otp";
import User from "@/models/User";

export const runtime = "nodejs";

type OtpPurpose = "register" | "login" | "reset";

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

    const identifier = body.identifier?.trim() ?? "";
    const purpose = body.purpose;

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or mobile number required.",
        },
        { status: 400 },
      );
    }

    if (!purpose || !allowedPurposes.has(purpose)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP purpose.",
        },
        { status: 400 },
      );
    }

    const identity = normalizeIdentity(identifier);

    await connectDatabase();

    const user = await User.findOne(
      identity.type === "email"
        ? {
            email: identity.value,
          }
        : {
            phone: identity.value,
          },
    ).lean();

    if (purpose === "register" && user) {
      return NextResponse.json(
        {
          success: false,
          message:
            identity.type === "email"
              ? "Account already exists."
              : "Account already exists.",
        },
        { status: 409 },
      );
    }

    if (
      (purpose === "login" || purpose === "reset") &&
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            identity.type === "email"
              ? "Is email se account nahi mila."
              : "Is mobile number se account nahi mila.",
        },
        { status: 404 },
      );
    }

    const delivery = await sendOtp(identity.value);

    return NextResponse.json({
      success: true,

      message:
        identity.type === "email"
          ? "OTP email par send kar diya gaya hai."
          : "OTP mobile number par send kar diya gaya hai.",

      type: delivery.type,

      maskedIdentity:
        delivery.maskedIdentity,

      provider:
        delivery.provider,

      /*
       * Email OTP ke verification ke liye
       * signed token frontend ko preserve karna hoga.
       *
       * Mobile OTP (Twilio) me ye empty hoga.
       */
      otpToken:
        delivery.otpToken ?? "",
    });
  } catch (error) {
    console.error(
      "[AUTH] Request OTP error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "OTP send nahi ho paaya.",
      },
      {
        status: 500,
      },
    );
  }
}