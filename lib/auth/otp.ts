import "server-only";

import crypto from "crypto";

import AuthOtp from "@/models/AuthOtp";
import type { AuthChannel } from "@/lib/auth/identity";

export type OtpPurpose = "register" | "login" | "reset";

function getOtpSecret() {
  return (
    process.env.AUTH_OTP_SECRET?.trim() ||
    process.env.AUTH_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? "krinay-local-dev-otp-secret-change-before-production"
      : "")
  );
}

function hashOtp(
  identifier: string,
  purpose: OtpPurpose,
  otp: string,
) {
  const secret = getOtpSecret();

  if (!secret) {
    throw new Error("AUTH_OTP_SECRET missing hai.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${identifier}:${purpose}:${otp}`)
    .digest("hex");
}

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function createOtpRecord(input: {
  identifier: string;
  channel: AuthChannel;
  purpose: OtpPurpose;
  otp: string;
}) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await AuthOtp.updateMany(
    {
      identifier: input.identifier,
      purpose: input.purpose,
      consumedAt: null,
    },
    {
      $set: {
        consumedAt: new Date(),
      },
    },
  );

  return AuthOtp.create({
    identifier: input.identifier,
    channel: input.channel,
    purpose: input.purpose,
    otpHash: hashOtp(
      input.identifier,
      input.purpose,
      input.otp,
    ),
    expiresAt,
  });
}

export async function verifyOtp(input: {
  identifier: string;
  purpose: OtpPurpose;
  otp: string;
}) {
  const record = await AuthOtp.findOne({
    identifier: input.identifier,
    purpose: input.purpose,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error(
      "OTP request nahi mila. Naya OTP send karo.",
    );
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw new Error(
      "OTP expire ho gaya. Naya OTP send karo.",
    );
  }

  if (record.attempts >= 5) {
    throw new Error(
      "Too many OTP attempts. Naya OTP send karo.",
    );
  }

  const expected = record.otpHash;

  const received = hashOtp(
    input.identifier,
    input.purpose,
    input.otp.trim(),
  );

  const expectedBuffer =
    Buffer.from(expected);

  const receivedBuffer =
    Buffer.from(received);

  const matches =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer,
    );

  if (!matches) {
    record.attempts += 1;
    await record.save();

    throw new Error(
      "OTP incorrect hai.",
    );
  }

  record.consumedAt = new Date();
  await record.save();

  return true;
}

async function sendEmailOtp(
  to: string,
  otp: string,
  purpose: OtpPurpose,
) {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const from =
    process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return false;
  }

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",

          "User-Agent":
            "Krinay-Scrubs/1.0",
        },

        body: JSON.stringify({
          from,
          to: [to],

          subject:
            `Krinay verification code: ${otp}`,

          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111827">
              <h2 style="color:#922424">Krinay Scrubs</h2>
              <p>Your verification code for <strong>${purpose}</strong> is:</p>
              <div style="font-size:32px;font-weight:800;letter-spacing:8px;margin:24px 0">${otp}</div>
              <p>This OTP expires in 10 minutes. Do not share it with anyone.</p>
            </div>
          `,
        }),
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Resend OTP email failed:",
      errorText,
    );

    throw new Error(
      "Email OTP send nahi ho paaya.",
    );
  }

  return true;
}

async function sendPhoneOtp(
  phone: string,
  otp: string,
) {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID?.trim();

  const authToken =
    process.env.TWILIO_AUTH_TOKEN?.trim();

  const fromNumber =
    process.env.TWILIO_FROM_NUMBER?.trim();

  const messagingServiceSid =
    process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

  if (
    !accountSid ||
    !authToken ||
    (!fromNumber &&
      !messagingServiceSid)
  ) {
    return false;
  }

  const body =
    new URLSearchParams({
      To: `+91${phone}`,

      Body:
        `Your Krinay Scrubs OTP is ${otp}. ` +
        "It expires in 10 minutes. " +
        "Do not share this code.",
    });

  if (messagingServiceSid) {
    body.set(
      "MessagingServiceSid",
      messagingServiceSid,
    );
  } else if (fromNumber) {
    body.set(
      "From",
      fromNumber,
    );
  }

  const response =
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Basic ${Buffer.from(
              `${accountSid}:${authToken}`,
            ).toString("base64")}`,

          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body,
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Twilio OTP SMS failed:",
      errorText,
    );

    throw new Error(
      "Mobile OTP send nahi ho paaya.",
    );
  }

  return true;
}

export async function deliverOtp(input: {
  identifier: string;
  channel: AuthChannel;
  purpose: OtpPurpose;
  otp: string;
}) {
  const delivered =
    input.channel === "email"
      ? await sendEmailOtp(
          input.identifier,
          input.otp,
          input.purpose,
        )
      : await sendPhoneOtp(
          input.identifier,
          input.otp,
        );

  if (delivered) {
    return {
      delivered: true,
      devOtp: null,
    };
  }

  /*
   * LOCAL DEVELOPMENT:
   *
   * Provider configure na ho to localhost par
   * development rukega nahi.
   *
   * OTP terminal me print hoga aur API response me
   * devOtp milega, jise register/login page
   * automatically OTP field me fill kar deta hai.
   *
   * Production me ye fallback kabhi active nahi hoga.
   *
   * Agar local development me bhi dev OTP disable
   * karna ho:
   *
   * AUTH_ALLOW_DEV_OTP=false
   */
  const allowDevOtp =
    process.env.NODE_ENV !== "production" &&
    process.env.AUTH_ALLOW_DEV_OTP !== "false";

  if (allowDevOtp) {
    console.log(
      `[KRINAY DEV OTP] ${input.identifier} (${input.purpose}): ${input.otp}`,
    );

    return {
      delivered: false,
      devOtp: input.otp,
    };
  }

  throw new Error(
    input.channel === "email"
      ? "Email OTP provider configure nahi hai. RESEND_API_KEY aur RESEND_FROM_EMAIL add karo."
      : "SMS OTP provider configure nahi hai. Twilio environment variables add karo.",
  );
}
