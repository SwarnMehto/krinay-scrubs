import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  sendOtp,
} from "@/lib/auth/otp";

export const runtime = "nodejs";
export const dynamic =
  "force-dynamic";

type RequestBody = {
  identifier?: string;
};

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as RequestBody;

    const identifier =
      body.identifier?.trim() ??
      "";

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email ya mobile number required hai.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await sendOtp(
        identifier,
      );

    return NextResponse.json(
      {
        success: true,

        message:
          result.type ===
          "email"
            ? `OTP ${result.maskedIdentity} par email kar diya gaya hai.`
            : `OTP ${result.maskedIdentity} par SMS kar diya gaya hai.`,

        type: result.type,

        maskedIdentity:
          result.maskedIdentity,

        /*
         * Email OTP verification ke liye signed token.
         *
         * Isme plain OTP nahi hota.
         */
        otpToken:
          result.otpToken,
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