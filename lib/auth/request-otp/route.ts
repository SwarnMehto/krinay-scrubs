import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  sendOtp,
} from "@/lib/auth/otp";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type RequestBody = {
  identifier?: string;
};

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * -----------------------------------------
     * READ REQUEST BODY
     * -----------------------------------------
     */

    const body =
      (await request.json()) as RequestBody;

    const identifier =
      typeof body.identifier ===
      "string"
        ? body.identifier.trim()
        : "";

    /*
     * -----------------------------------------
     * VALIDATION
     * -----------------------------------------
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

    /*
     * -----------------------------------------
     * SEND OTP
     * -----------------------------------------
     */

    const result =
      await sendOtp(
        identifier
      );

    /*
     * -----------------------------------------
     * RESPONSE
     * -----------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        message:
          result.type ===
          "email"
            ? `OTP ${result.maskedIdentity} Sended.`
            : `OTP ${result.maskedIdentity} Sended.`,

        type:
          result.type,

        maskedIdentity:
          result.maskedIdentity,

        /*
         * Sirf EMAIL OTP ke liye signed token.
         *
         * Plain OTP is token me store nahi hota.
         *
         * Twilio phone OTP ke liye empty string rahega.
         */
        otpToken:
          result.otpToken,
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
      }
    );
  }
}