import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHIPROCKET_LOGIN_URL =
  "https://apiv2.shiprocket.in/v1/external/auth/login";

export async function GET() {
  try {
    const email =
      process.env.SHIPROCKET_API_EMAIL?.trim() ?? "";

    const password =
      process.env.SHIPROCKET_API_PASSWORD?.trim() ?? "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          stage: "environment",
          message:
            "SHIPROCKET_API_EMAIL missing hai.",
        },
        {
          status: 500,
        },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          stage: "environment",
          message:
            "SHIPROCKET_API_PASSWORD missing hai.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * IMPORTANT:
     * Password kabhi response me expose nahi karenge.
     *
     * Sirf diagnostics:
     * - email
     * - password length
     */

    console.log(
      "[SHIPROCKET_TEST] Email:",
      email,
    );

    console.log(
      "[SHIPROCKET_TEST] Password length:",
      password.length,
    );

    const response =
      await fetch(
        SHIPROCKET_LOGIN_URL,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              email,
              password,
            }),

          cache: "no-store",
        },
      );

    const rawText =
      await response.text();

    let payload:
      | Record<string, unknown>
      | null = null;

    try {
      payload =
        rawText
          ? (JSON.parse(
              rawText,
            ) as Record<
              string,
              unknown
            >)
          : {};
    } catch {
      payload = null;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,

          stage:
            "shiprocket_auth",

          status:
            response.status,

          email,

          passwordDetected:
            true,

          passwordLength:
            password.length,

          shiprocketMessage:
            typeof payload?.message ===
            "string"
              ? payload.message
              : rawText ||
                "Shiprocket authentication failed.",

          fix:
            "Shiprocket API Users page par API-user password reset karo, .env.local me exact new password quotes ke andar paste karo, phir dev server restart karo.",
        },
        {
          status:
            response.status,
        },
      );
    }

    const token =
      typeof payload?.token ===
      "string"
        ? payload.token
        : "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,

          stage:
            "shiprocket_response",

          message:
            "Authentication response mila but token missing hai.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Shiprocket API authentication successful.",

      email,

      tokenReceived:
        true,

      /*
       * Security:
       * Actual token intentionally return nahi kar rahe.
       */
    });
  } catch (error) {
    console.error(
      "[SHIPROCKET_TEST_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        stage:
          "unexpected_error",

        message:
          error instanceof Error
            ? error.message
            : "Shiprocket authentication test failed.",
      },
      {
        status: 500,
      },
    );
  }
}