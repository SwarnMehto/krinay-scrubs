import crypto from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { requireAdmin } from "@/lib/require-admin";
import AdminPasswordOtp from "@/models/AdminPasswordOtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
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

    const apiKey =
      process.env.RESEND_API_KEY?.trim();

    const fromEmail =
      process.env.RESEND_FROM_EMAIL?.trim();

    if (!apiKey || !fromEmail) {
      throw new Error(
        "Resend email configuration is missing.",
      );
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    await AdminPasswordOtp.findOneAndUpdate(
      {
        adminId: auth.admin._id,
      },
      {
        $set: {
          otpHash,
          expiresAt,
          attempts: 0,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: fromEmail,
      to: auth.admin.email,
      subject: "Krinay Admin Password Change OTP",

      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
          <h2 style="color:#922424;margin-bottom:12px">
            Krinay Admin
          </h2>

          <p>
            A request was made to change your Krinay admin password.
          </p>

          <p>Your verification code is:</p>

          <div style="
            font-size:32px;
            font-weight:700;
            letter-spacing:8px;
            color:#922424;
            margin:24px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP will expire in 10 minutes.
          </p>

          <p style="color:#666;font-size:13px">
            If you did not request this password change,
            do not share this code with anyone.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error(
        "[ADMIN_PASSWORD_OTP_EMAIL_ERROR]",
        result.error,
      );

      throw new Error(
        "Unable to send verification email.",
      );
    }

    const email = auth.admin.email;

    const [local, domain] =
      email.split("@");

    const maskedEmail =
      local && domain
        ? `${local.slice(0, 2)}***@${domain}`
        : "your admin email";

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${maskedEmail}.`,
      expiresIn: 600,
    });
  } catch (error) {
    console.error(
      "[ADMIN_PASSWORD_OTP_REQUEST_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send OTP.",
      },
      { status: 500 },
    );
  }
}