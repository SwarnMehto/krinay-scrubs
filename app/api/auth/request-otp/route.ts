import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { normalizeIdentity } from "@/lib/auth/identity";
import { sendOtp } from "@/lib/auth/otp";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OtpPurpose =
  | "register"
  | "login"
  | "reset";

type RequestBody = {
  identifier?: string;
  purpose?: OtpPurpose;
};

const allowedPurposes =
  new Set<OtpPurpose>([
    "register",
    "login",
    "reset",
  ]);

export async function POST(
  request: Request
) {
  try {
    /*
     * ==========================================
     * READ BODY
     * ==========================================
     */

    const body =
      (await request.json()) as RequestBody;

    const identifier =
      typeof body.identifier === "string"
        ? body.identifier.trim()
        : "";

    const purpose =
      body.purpose;

    /*
     * ==========================================
     * VALIDATION
     * ==========================================
     */

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email ya mobile number required hai.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !purpose ||
      !allowedPurposes.has(purpose)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid OTP purpose.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * NORMALIZE IDENTITY
     * ==========================================
     */

    const identity =
      normalizeIdentity(
        identifier
      );

    /*
     * Current identity structure:
     *
     * identity.type
     *   → "email" | "phone"
     *
     * identity.value
     *   → normalized email/mobile
     */

    /*
     * ==========================================
     * DATABASE
     * ==========================================
     */

    await connectDatabase();

    /*
     * ==========================================
     * FIND EXISTING USER
     * ==========================================
     */

    const user =
      await User.findOne(
        identity.type === "email"
          ? {
              email:
                identity.value,
            }
          : {
              phone:
                identity.value,
            }
      ).lean();

    /*
     * ==========================================
     * REGISTER CHECK
     * ==========================================
     */

    if (
      purpose === "register" &&
      user
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Is email/mobile se account already exist karta hai. Please login karo.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ==========================================
     * LOGIN / RESET CHECK
     * ==========================================
     */

    if (
      (
        purpose === "login" ||
        purpose === "reset"
      ) &&
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
        }
      );
    }

    /*
     * ==========================================
     * SEND OTP
     * ==========================================
     *
     * Email → Resend
     * Phone → Twilio Verify
     */

    const result =
      await sendOtp(
        identity.value
      );

    /*
     * ==========================================
     * SUCCESS
     * ==========================================
     */

    return NextResponse.json(
      {
        success: true,

        message:
          result.type === "email"
            ? `OTP ${result.maskedIdentity} par email kar diya gaya hai.`
            : `OTP ${result.maskedIdentity} par SMS kar diya gaya hai.`,

        channel:
          result.type,

        type:
          result.type,

        maskedIdentity:
          result.maskedIdentity,

        /*
         * Email OTP verification ke liye
         * signed token required hai.
         *
         * Phone/Twilio me empty string hoga.
         */
        otpToken:
          result.otpToken,

        purpose,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[REQUEST_OTP_ERROR]",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "OTP send nahi ho paaya.";

    const lowerMessage =
      message.toLowerCase();

    const isValidationError =
      lowerMessage.includes("email") ||
      lowerMessage.includes("mobile") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes(
        "identifier"
      );

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          isValidationError
            ? 400
            : 500,
      }
    );
  }
}