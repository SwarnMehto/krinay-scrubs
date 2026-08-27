import crypto from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyOtp,
} from "@/lib/auth/otp";

export const runtime = "nodejs";
export const dynamic =
  "force-dynamic";

type RequestBody = {
  identifier?: string;
  otp?: string;
  otpToken?: string;
};

function createVerificationProof({
  identity,
  type,
}: {
  identity: string;
  type: "email" | "phone";
}) {
  const secret =
    process.env.AUTH_OTP_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "AUTH_OTP_SECRET missing hai.",
    );
  }

  const expiresAt =
    Date.now() +
    10 * 60 * 1000;

  const payload =
    Buffer.from(
      JSON.stringify({
        identity,
        type,
        expiresAt,
      }),
    ).toString(
      "base64url",
    );

  const signature =
    crypto
      .createHmac(
        "sha256",
        secret,
      )
      .update(payload)
      .digest(
        "base64url",
      );

  return `${payload}.${signature}`;
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as RequestBody;

    const identifier =
      body.identifier?.trim() ??
      "";

    const otp =
      body.otp?.trim() ??
      "";

    if (
      !identifier ||
      !otp
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Identifier aur OTP required hai.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await verifyOtp({
        rawIdentity:
          identifier,

        code: otp,

        otpToken:
          body.otpToken ??
          "",
      });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP invalid ya expire ho gaya hai.",
        },
        {
          status: 400,
        },
      );
    }

    const verificationProof =
      createVerificationProof({
        identity:
          result.identity.value,

        type:
          result.identity.type,
      });

    return NextResponse.json({
      success: true,

      message:
        "OTP verified successfully.",

      identity:
        result.identity.value,

      identityType:
        result.identity.type,

      verificationProof,
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "OTP verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}