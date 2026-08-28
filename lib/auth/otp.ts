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

/*
 * =========================================================
 * CONFIG
 * =========================================================
 */

const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;

type EmailOtpPayload = {
  otp: string;
  expiresAt: number;
};

/*
 * Future compatibility ke liye export.
 */
export type OtpPurpose =
  | "register"
  | "login"
  | "forgot-password"
  | "verify";

/*
 * =========================================================
 * ENV HELPERS
 * =========================================================
 */

function getOtpSecret() {
  const secret =
    process.env.AUTH_OTP_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "AUTH_OTP_SECRET missing hai."
    );
  }

  return secret;
}

function getResend() {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY missing hai."
    );
  }

  return new Resend(apiKey);
}

function getTwilioClient() {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID?.trim();

  const authToken =
    process.env.TWILIO_AUTH_TOKEN?.trim();

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio credentials missing hain."
    );
  }

  return twilio(
    accountSid,
    authToken
  );
}

function getTwilioVerifyServiceSid() {
  const serviceSid =
    process.env
      .TWILIO_VERIFY_SERVICE_SID
      ?.trim();

  if (!serviceSid) {
    throw new Error(
      "TWILIO_VERIFY_SERVICE_SID missing hai."
    );
  }

  return serviceSid;
}

/*
 * =========================================================
 * OTP GENERATION
 * =========================================================
 */

function generateOtp() {
  return crypto
    .randomInt(
      10 ** (OTP_LENGTH - 1),
      10 ** OTP_LENGTH
    )
    .toString();
}

function hashOtp(
  identity: string,
  otp: string
) {
  return crypto
    .createHmac(
      "sha256",
      getOtpSecret()
    )
    .update(`${identity}:${otp}`)
    .digest("hex");
}

/*
 * =========================================================
 * EMAIL OTP TOKEN
 * =========================================================
 *
 * Plain OTP browser ko return nahi hota.
 * Sirf signed token return hota hai.
 */

function createEmailOtpToken(
  identity: string,
  otp: string
): string {
  const payload: EmailOtpPayload = {
    otp: hashOtp(
      identity,
      otp
    ),

    expiresAt:
      Date.now() +
      EMAIL_OTP_TTL_MS,
  };

  const encoded =
    Buffer.from(
      JSON.stringify(payload)
    ).toString("base64url");

  const signature =
    crypto
      .createHmac(
        "sha256",
        getOtpSecret()
      )
      .update(
        `${identity}:${encoded}`
      )
      .digest("base64url");

  return `${encoded}.${signature}`;
}

function parseEmailOtpToken(
  identity: string,
  token: string
): EmailOtpPayload | null {
  const [
    encoded,
    signature,
  ] = token.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        getOtpSecret()
      )
      .update(
        `${identity}:${encoded}`
      )
      .digest("base64url");

  const receivedBuffer =
    Buffer.from(signature);

  const expectedBuffer =
    Buffer.from(
      expectedSignature
    );

  if (
    receivedBuffer.length !==
      expectedBuffer.length ||
    !crypto.timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    )
  ) {
    return null;
  }

  try {
    const payload =
      JSON.parse(
        Buffer.from(
          encoded,
          "base64url"
        ).toString("utf8")
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
 * SEND EMAIL OTP — RESEND
 * =========================================================
 */

async function sendEmailOtp(
  identity: NormalizedIdentity
) {
  const otp =
    generateOtp();

  const resend =
    getResend();

  /*
   * IMPORTANT:
   *
   * krinay.in verified Resend domain hai.
   * onboarding@resend.dev intentionally use nahi kar rahe.
   */
  const from =
    "Krinay <contact@krinay.in>";

  const {
    data,
    error,
  } =
    await resend.emails.send({
      from,

      to: [
        identity.value,
      ],

      subject:
        `${otp} is your Krinay verification code`,

      html: `
        <div
          style="
            font-family:Arial,sans-serif;
            max-width:520px;
            margin:auto;
            border:1px solid #eeeeee;
            border-radius:18px;
            overflow:hidden;
            background:#ffffff;
          "
        >

          <div
            style="
              background:#922424;
              color:white;
              padding:24px;
            "
          >

            <div
              style="
                font-size:12px;
                letter-spacing:2px;
                font-weight:700;
              "
            >
              KRINAY SCRUBS
            </div>

            <h1
              style="
                margin:10px 0 0;
                font-size:25px;
              "
            >
              Verify your account
            </h1>

          </div>

          <div
            style="
              padding:30px;
              color:#111827;
            "
          >

            <p
              style="
                margin:0;
                line-height:1.6;
              "
            >
              Use the verification code below:
            </p>

            <div
              style="
                font-size:36px;
                font-weight:800;
                letter-spacing:8px;
                color:#922424;
                margin:25px 0;
              "
            >
              ${otp}
            </div>

            <p
              style="
                color:#64748b;
                font-size:14px;
                line-height:1.6;
                margin:0;
              "
            >
              This code expires in 10 minutes.
              Never share this OTP with anyone.
            </p>

          </div>

        </div>
      `,

      text: [
        "KRINAY SCRUBS",
        "",
        `Your verification code is: ${otp}`,
        "",
        "This code expires in 10 minutes.",
        "Never share this OTP with anyone.",
      ].join("\n"),
    });

  if (error) {
    console.error(
      "[AUTH_RESEND_OTP_ERROR]",
      error
    );

    throw new Error(
      error.message ||
        "Email OTP send nahi ho paaya."
    );
  }

  if (!data?.id) {
    throw new Error(
      "Resend ne email ID return nahi ki."
    );
  }

  console.log(
    "[AUTH_EMAIL_OTP_SENT]",
    {
      emailId: data.id,
      recipient:
        maskIdentity(identity),
    }
  );

  return {
    provider:
      "resend" as const,

    providerId:
      data.id,

    otpToken:
      createEmailOtpToken(
        identity.value,
        otp
      ),
  };
}

/*
 * =========================================================
 * SEND PHONE OTP — TWILIO VERIFY
 * =========================================================
 *
 * NOTE:
 * Abhi mobile OTP Twilio use kar raha hai.
 * MSG91 integrate karne ke baad sirf is section ko replace
 * karna padega.
 */

async function sendPhoneOtp(
  identity: NormalizedIdentity
) {
  const client =
    getTwilioClient();

  const serviceSid =
    getTwilioVerifyServiceSid();

  const phone =
    toE164Phone(
      identity.value
    );

  const verification =
    await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

  console.log(
    "[AUTH_PHONE_OTP_SENT]",
    {
      provider:
        "twilio",
      verificationSid:
        verification.sid,
      recipient:
        maskIdentity(identity),
    }
  );

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
 * PUBLIC SEND OTP
 * =========================================================
 */

export async function sendOtp(
  rawIdentity: string
) {
  const identity =
    normalizeIdentity(
      rawIdentity
    );

  const delivery =
    identity.type === "email"
      ? await sendEmailOtp(
          identity
        )
      : await sendPhoneOtp(
          identity
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
      otpToken
    );

  if (!payload) {
    return false;
  }

  const submittedHash =
    hashOtp(
      identity.value,
      code
    );

  const submittedBuffer =
    Buffer.from(
      submittedHash
    );

  const expectedBuffer =
    Buffer.from(
      payload.otp
    );

  if (
    submittedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    submittedBuffer,
    expectedBuffer
  );
}

/*
 * =========================================================
 * VERIFY PHONE OTP — TWILIO VERIFY
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
          identity.value
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
 * PUBLIC VERIFY OTP
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
      rawIdentity
    );

  const cleanCode =
    code.trim();

  if (
    !/^\d{4,8}$/.test(
      cleanCode
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
          code: cleanCode,
          otpToken,
        })
      : await verifyPhoneOtp({
          identity,
          code: cleanCode,
        });

  return {
    success,
    identity,
  };
}