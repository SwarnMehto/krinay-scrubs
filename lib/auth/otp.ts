import "server-only";

import crypto from "crypto";
import { Resend } from "resend";
import twilio from "twilio";

import {
  maskIdentity,
  normalizeIdentity,
  toE164Phone,
  type NormalizedIdentity,
} from "@/lib/auth/identity";

const EMAIL_OTP_TTL_MS =
  10 * 60 * 1000;

const OTP_LENGTH = 6;

type EmailOtpPayload = {
  otp: string;
  expiresAt: number;
};

function getOtpSecret() {
  const secret =
    process.env.AUTH_OTP_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "AUTH_OTP_SECRET missing hai.",
    );
  }

  return secret;
}

function getResend() {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY missing hai.",
    );
  }

  return new Resend(apiKey);
}

function getTwilioClient() {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID?.trim();

  const authToken =
    process.env.TWILIO_AUTH_TOKEN?.trim();

  if (
    !accountSid ||
    !authToken
  ) {
    throw new Error(
      "Twilio credentials missing hain.",
    );
  }

  return twilio(
    accountSid,
    authToken,
  );
}

function getTwilioVerifyServiceSid() {
  const serviceSid =
    process.env
      .TWILIO_VERIFY_SERVICE_SID
      ?.trim();

  if (!serviceSid) {
    throw new Error(
      "TWILIO_VERIFY_SERVICE_SID missing hai.",
    );
  }

  return serviceSid;
}

function generateOtp() {
  return crypto
    .randomInt(
      10 ** (OTP_LENGTH - 1),
      10 ** OTP_LENGTH,
    )
    .toString();
}

function hashOtp(
  identity: string,
  otp: string,
) {
  return crypto
    .createHmac(
      "sha256",
      getOtpSecret(),
    )
    .update(`${identity}:${otp}`)
    .digest("hex");
}

/*
 * =========================================================
 * EMAIL OTP TOKEN
 * =========================================================
 *
 * Email OTP ko server-side signed token ke saath return
 * karte hain.
 *
 * Browser ko plain OTP kabhi nahi milta.
 */

function createEmailOtpToken(
  identity: string,
  otp: string,
): string {
  const payload: EmailOtpPayload = {
    otp: hashOtp(
      identity,
      otp,
    ),

    expiresAt:
      Date.now() +
      EMAIL_OTP_TTL_MS,
  };

  const encoded =
    Buffer.from(
      JSON.stringify(payload),
    ).toString("base64url");

  const signature =
    crypto
      .createHmac(
        "sha256",
        getOtpSecret(),
      )
      .update(
        `${identity}:${encoded}`,
      )
      .digest("base64url");

  return `${encoded}.${signature}`;
}

function parseEmailOtpToken(
  identity: string,
  token: string,
): EmailOtpPayload | null {
  const [
    encoded,
    signature,
  ] = token.split(".");

  if (
    !encoded ||
    !signature
  ) {
    return null;
  }

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        getOtpSecret(),
      )
      .update(
        `${identity}:${encoded}`,
      )
      .digest("base64url");

  const a = Buffer.from(
    signature,
  );

  const b = Buffer.from(
    expectedSignature,
  );

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(
      a,
      b,
    )
  ) {
    return null;
  }

  try {
    const payload =
      JSON.parse(
        Buffer.from(
          encoded,
          "base64url",
        ).toString("utf8"),
      ) as EmailOtpPayload;

    if (
      !payload.expiresAt ||
      payload.expiresAt <
        Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/*
 * =========================================================
 * SEND EMAIL OTP
 * =========================================================
 */

async function sendEmailOtp(
  identity: NormalizedIdentity,
) {
  const otp =
    generateOtp();

  const resend =
    getResend();

  const from =
    process.env
      .RESEND_FROM_EMAIL
      ?.trim() ||
    "Krinay <no-reply@krinay.in>";

  const {
    data,
    error,
  } =
    await resend.emails.send({
      from,

      to: identity.value,

      subject:
        `${otp} is your Krinay verification code`,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          max-width:520px;
          margin:auto;
          border:1px solid #eee;
          border-radius:18px;
          overflow:hidden;
        ">
          <div style="
            background:#922424;
            color:white;
            padding:24px;
          ">
            <div style="
              font-size:12px;
              letter-spacing:2px;
              font-weight:700;
            ">
              KRINAY SCRUBS
            </div>

            <h1 style="
              margin:10px 0 0;
              font-size:25px;
            ">
              Verify your account
            </h1>
          </div>

          <div style="
            padding:30px;
            color:#111827;
          ">
            <p>
              Use the verification code below:
            </p>

            <div style="
              font-size:36px;
              font-weight:800;
              letter-spacing:8px;
              color:#922424;
              margin:25px 0;
            ">
              ${otp}
            </div>

            <p style="
              color:#64748b;
              font-size:14px;
            ">
              This code expires in 10 minutes.
              Never share this OTP with anyone.
            </p>
          </div>
        </div>
      `,
    });

  if (error) {
    console.error(
      "[AUTH] Resend OTP failed:",
      error,
    );

    throw new Error(
      error.message ||
        "Email OTP send nahi ho paaya.",
    );
  }

  return {
    provider: "resend" as const,

    providerId:
      data?.id ?? "",

    otpToken:
      createEmailOtpToken(
        identity.value,
        otp,
      ),
  };
}

/*
 * =========================================================
 * SEND MOBILE OTP — TWILIO VERIFY
 * =========================================================
 */

async function sendPhoneOtp(
  identity: NormalizedIdentity,
) {
  const client =
    getTwilioClient();

  const serviceSid =
    getTwilioVerifyServiceSid();

  const verification =
    await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: toE164Phone(
          identity.value,
        ),

        channel: "sms",
      });

  return {
    provider:
      "twilio" as const,

    providerId:
      verification.sid,

    otpToken: "",
  };
}

/*
 * =========================================================
 * PUBLIC SEND FUNCTION
 * =========================================================
 */

export async function sendOtp(
  rawIdentity: string,
) {
  const identity =
    normalizeIdentity(
      rawIdentity,
    );

  const delivery =
    identity.type === "email"
      ? await sendEmailOtp(
          identity,
        )
      : await sendPhoneOtp(
          identity,
        );

  return {
    identity:
      identity.value,

    type:
      identity.type,

    maskedIdentity:
      maskIdentity(identity),

    ...delivery,
  };
}

/*
 * =========================================================
 * VERIFY EMAIL OTP
 * =========================================================
 */

function verifyEmailOtp({
  identity,
  code,
  otpToken,
}: {
  identity: NormalizedIdentity;
  code: string;
  otpToken: string;
}) {
  const payload =
    parseEmailOtpToken(
      identity.value,
      otpToken,
    );

  if (!payload) {
    return false;
  }

  const submittedHash =
    hashOtp(
      identity.value,
      code,
    );

  const a = Buffer.from(
    submittedHash,
  );

  const b = Buffer.from(
    payload.otp,
  );

  if (
    a.length !== b.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    a,
    b,
  );
}

/*
 * =========================================================
 * VERIFY PHONE OTP
 * =========================================================
 */

async function verifyPhoneOtp({
  identity,
  code,
}: {
  identity: NormalizedIdentity;
  code: string;
}) {
  const client =
    getTwilioClient();

  const serviceSid =
    getTwilioVerifyServiceSid();

  const result =
    await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: toE164Phone(
          identity.value,
        ),

        code,
      });

  return (
    result.status ===
    "approved"
  );
}

/*
 * =========================================================
 * VERIFY OTP
 * =========================================================
 */

export async function verifyOtp({
  rawIdentity,
  code,
  otpToken = "",
}: {
  rawIdentity: string;
  code: string;
  otpToken?: string;
}) {
  const identity =
    normalizeIdentity(
      rawIdentity,
    );

  if (
    !/^\d{4,8}$/.test(
      code.trim(),
    )
  ) {
    return {
      success: false,
      identity,
    };
  }

  const success =
    identity.type === "email"
      ? verifyEmailOtp({
          identity,

          code:
            code.trim(),

          otpToken,
        })
      : await verifyPhoneOtp({
          identity,

          code:
            code.trim(),
        });

  return {
    success,
    identity,
  };
}