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
export const dynamic = "force-dynamic";

const allowedPurposes = new Set<OtpPurpose>([
  "register",
  "login",
  "reset",
]);

const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  try {
    /*
     * =====================================================
     * READ REQUEST
     * =====================================================
     */

    const body = (await request.json()) as {
      identifier?: string;
      purpose?: OtpPurpose;
    };

    const purpose = body.purpose;

    /*
     * =====================================================
     * VALIDATE PURPOSE
     * =====================================================
     */

    if (!purpose || !allowedPurposes.has(purpose)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP purpose.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * NORMALIZE EMAIL / PHONE
     * =====================================================
     *
     * Examples:
     *
     * abc@gmail.com
     *      ↓
     * channel = email
     *
     * 8700116436
     *      ↓
     * channel = phone
     */

    const identity = normalizeIdentity(
      body.identifier ?? "",
    );

    /*
     * =====================================================
     * DATABASE
     * =====================================================
     */

    await connectDatabase();

    /*
     * =====================================================
     * FIND EXISTING USER
     * =====================================================
     */

    const user = await User.findOne(
      identity.channel === "email"
        ? {
            email: identity.identifier,
          }
        : {
            phone: identity.identifier,
          },
    ).lean();

    /*
     * =====================================================
     * REGISTER
     * =====================================================
     *
     * Existing account ko dobara register nahi karna.
     */

    if (purpose === "register" && user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Is email/mobile se account already exist karta hai. Please login karo.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * =====================================================
     * LOGIN / PASSWORD RESET
     * =====================================================
     *
     * Login/reset OTP sirf existing account ke liye.
     */

    if (
      (purpose === "login" || purpose === "reset") &&
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Is email/mobile se account nahi mila. Pehle account create karo.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =====================================================
     * RESEND COOLDOWN
     * =====================================================
     *
     * Same identifier + same purpose ke liye
     * 60 seconds ke andar multiple OTP block karo.
     */

    const recentOtp = await AuthOtp.findOne({
      identifier: identity.identifier,
      purpose,
      consumedAt: null,

      createdAt: {
        $gte: new Date(
          Date.now() - RESEND_COOLDOWN_MS,
        ),
      },
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (recentOtp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP already sent hai. 60 seconds baad resend karo.",
        },
        {
          status: 429,
        },
      );
    }

    /*
     * =====================================================
     * INVALIDATE OLD OTPs
     * =====================================================
     *
     * New OTP generate hone ke baad purane unused OTP
     * valid nahi rehne chahiye.
     */

    await AuthOtp.updateMany(
      {
        identifier: identity.identifier,
        purpose,
        consumedAt: null,
      },
      {
        $set: {
          consumedAt: new Date(),
        },
      },
    );

    /*
     * =====================================================
     * GENERATE OTP
     * =====================================================
     */

    const otp = generateOtp();

    /*
     * =====================================================
     * SAVE OTP RECORD
     * =====================================================
     */

    const otpRecord = await createOtpRecord({
      identifier: identity.identifier,
      channel: identity.channel,
      purpose,
      otp,
    });

    /*
     * =====================================================
     * DELIVER OTP
     * =====================================================
     *
     * EMAIL
     *   → Resend
     *
     * PHONE
     *   → Twilio / configured SMS provider
     */

    let delivery;

    try {
      delivery = await deliverOtp({
        identifier: identity.identifier,
        channel: identity.channel,
        purpose,
        otp,
      });
    } catch (deliveryError) {
      /*
       * Delivery fail hua toh generated OTP ko immediately
       * unusable bana do.
       */

      otpRecord.consumedAt = new Date();

      await otpRecord.save();

      throw deliveryError;
    }

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    const normalMessage =
      identity.channel === "email"
        ? "OTP email par send kar diya gaya hai."
        : "OTP mobile par send kar diya gaya hai.";

    /*
     * Local development me deliverOtp devOtp return
     * kar sakta hai.
     *
     * Production me devOtp kabhi expose nahi karna.
     */

    if (
      process.env.NODE_ENV !== "production" &&
      delivery.devOtp
    ) {
      return NextResponse.json(
        {
          success: true,

          message:
            "Local development mode: OTP response aur terminal me available hai.",

          channel: identity.channel,

          devOtp: delivery.devOtp,
        },
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        message: normalMessage,

        channel: identity.channel,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Request OTP error:",
      error,
    );

    /*
     * normalizeIdentity() validation errors bhi
     * yahan aa sakte hain.
     */

    const message =
      error instanceof Error
        ? error.message
        : "OTP send nahi ho paaya.";

    const isValidationError =
      message.toLowerCase().includes("email") ||
      message.toLowerCase().includes("mobile") ||
      message.toLowerCase().includes("phone") ||
      message.toLowerCase().includes("identifier");

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: isValidationError ? 400 : 500,
      },
    );
  }
}