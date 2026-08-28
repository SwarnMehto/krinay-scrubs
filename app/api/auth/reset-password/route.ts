import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { normalizeIdentity } from "@/lib/auth/identity";
import { verifyOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResetPasswordRequestBody = {
  identifier?: string;
  otp?: string;
  otpToken?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  try {
    /*
     * ==========================================
     * READ REQUEST
     * ==========================================
     */

    const body =
      (await request.json()) as ResetPasswordRequestBody;

    /*
     * ==========================================
     * IDENTIFIER
     * ==========================================
     */

    const identifier =
      typeof body.identifier === "string"
        ? body.identifier.trim()
        : "";

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

    const identity =
      normalizeIdentity(identifier);

    /*
     * Current NormalizedIdentity:
     *
     * identity.type  -> "email" | "phone"
     * identity.value -> normalized email/mobile
     */

    /*
     * ==========================================
     * OTP
     * ==========================================
     */

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 6-digit OTP enter karo.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * OTP TOKEN
     * ==========================================
     *
     * Email OTP ke case me request-otp API
     * signed otpToken return karti hai.
     *
     * Phone/Twilio ke liye token required nahi hai.
     */

    const otpToken =
      typeof body.otpToken === "string"
        ? body.otpToken.trim()
        : "";

    if (
      identity.type === "email" &&
      !otpToken
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP verification token missing hai. Please OTP dubara send karo.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * NEW PASSWORD
     * ==========================================
     */

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password minimum 8 characters ka hona chahiye.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * At least:
     * - 1 letter
     * - 1 number
     */

    if (
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password me kam se kam 1 letter aur 1 number hona chahiye.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * DATABASE
     * ==========================================
     */

    await connectDatabase();

    /*
     * ==========================================
     * FIND USER
     * ==========================================
     */

    const user =
      await User.findOne(
        identity.type === "email"
          ? {
              email: identity.value,
              isActive: true,
            }
          : {
              phone: identity.value,
              isActive: true,
            }
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Account nahi mila.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ==========================================
     * VERIFY OTP
     * ==========================================
     */

    const verification =
      await verifyOtp({
        rawIdentity:
          identity.value,

        code:
          otp,

        otpToken:
          identity.type === "email"
            ? otpToken
            : "",
      });

    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP invalid ya expire ho chuka hai. Please naya OTP request karo.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * HASH NEW PASSWORD
     * ==========================================
     */

    const passwordHash =
      await hashPassword(
        newPassword
      );

    /*
     * ==========================================
     * UPDATE PASSWORD
     * ==========================================
     */

    user.passwordHash =
      passwordHash;

    await user.save();

    /*
     * ==========================================
     * SUCCESS
     * ==========================================
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Password reset ho gaya. Ab login karo.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[RESET_PASSWORD_ERROR]",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Password reset nahi ho paaya.";

    const lowerMessage =
      message.toLowerCase();

    const isClientError =
      lowerMessage.includes("otp") ||
      lowerMessage.includes("password") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("mobile") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("identifier");

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          isClientError
            ? 400
            : 500,
      }
    );
  }
}