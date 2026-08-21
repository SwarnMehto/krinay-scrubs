import { NextResponse } from "next/server";
import {
  resend,
  resendConfig,
} from "@/lib/resend";

export const runtime = "nodejs";

type ContactRequestBody = {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^[6-9]\d{9}$/;

const MAX_NAME_LENGTH = 80;
const MAX_SUBJECT_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 3000;

function sanitizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\u0000/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMessage(value: string) {
  return escapeHtml(value).replace(
    /\n/g,
    "<br />",
  );
}

function buildAdminEmail({
  name,
  phone,
  email,
  subject,
  message,
}: {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}) {
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = formatMessage(message);

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>New Krinay Contact Enquiry</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f8f3f3;
          color: #171717;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="background: #f8f3f3; padding: 32px 12px;"
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 640px;
                  overflow: hidden;
                  border: 1px solid #eadada;
                  border-radius: 20px;
                  background: #ffffff;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 30px;
                      background: #922424;
                      color: #ffffff;
                    "
                  >
                    <div
                      style="
                        margin-bottom: 8px;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        color: rgba(255, 255, 255, 0.72);
                      "
                    >
                      Krinay Website
                    </div>

                    <h1
                      style="
                        margin: 0;
                        font-size: 28px;
                        line-height: 1.25;
                      "
                    >
                      New contact enquiry
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 30px;">
                    <p
                      style="
                        margin: 0 0 24px;
                        color: #555555;
                        font-size: 15px;
                        line-height: 1.7;
                      "
                    >
                      A visitor submitted the contact form on
                      <strong>krinay.in</strong>.
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="
                        border-collapse: separate;
                        border-spacing: 0 12px;
                      "
                    >
                      <tr>
                        <td
                          style="
                            width: 130px;
                            padding: 12px 14px;
                            border-radius: 10px 0 0 10px;
                            background: #fff5f5;
                            color: #922424;
                            font-size: 13px;
                            font-weight: 700;
                          "
                        >
                          Name
                        </td>

                        <td
                          style="
                            padding: 12px 14px;
                            border-radius: 0 10px 10px 0;
                            background: #fff5f5;
                            color: #222222;
                            font-size: 14px;
                          "
                        >
                          ${safeName}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            width: 130px;
                            padding: 12px 14px;
                            border-radius: 10px 0 0 10px;
                            background: #fff5f5;
                            color: #922424;
                            font-size: 13px;
                            font-weight: 700;
                          "
                        >
                          Phone
                        </td>

                        <td
                          style="
                            padding: 12px 14px;
                            border-radius: 0 10px 10px 0;
                            background: #fff5f5;
                            color: #222222;
                            font-size: 14px;
                          "
                        >
                          <a
                            href="tel:+91${safePhone}"
                            style="
                              color: #922424;
                              font-weight: 700;
                              text-decoration: none;
                            "
                          >
                            +91 ${safePhone}
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            width: 130px;
                            padding: 12px 14px;
                            border-radius: 10px 0 0 10px;
                            background: #fff5f5;
                            color: #922424;
                            font-size: 13px;
                            font-weight: 700;
                          "
                        >
                          Email
                        </td>

                        <td
                          style="
                            padding: 12px 14px;
                            border-radius: 0 10px 10px 0;
                            background: #fff5f5;
                            color: #222222;
                            font-size: 14px;
                          "
                        >
                          ${
                            safeEmail
                              ? `
                                <a
                                  href="mailto:${safeEmail}"
                                  style="
                                    color: #922424;
                                    font-weight: 700;
                                    text-decoration: none;
                                  "
                                >
                                  ${safeEmail}
                                </a>
                              `
                              : "Not provided"
                          }
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            width: 130px;
                            padding: 12px 14px;
                            border-radius: 10px 0 0 10px;
                            background: #fff5f5;
                            color: #922424;
                            font-size: 13px;
                            font-weight: 700;
                          "
                        >
                          Subject
                        </td>

                        <td
                          style="
                            padding: 12px 14px;
                            border-radius: 0 10px 10px 0;
                            background: #fff5f5;
                            color: #222222;
                            font-size: 14px;
                          "
                        >
                          ${safeSubject}
                        </td>
                      </tr>
                    </table>

                    <div
                      style="
                        margin-top: 24px;
                        padding: 20px;
                        border: 1px solid #eadada;
                        border-radius: 14px;
                        background: #ffffff;
                      "
                    >
                      <p
                        style="
                          margin: 0 0 10px;
                          color: #922424;
                          font-size: 13px;
                          font-weight: 700;
                          letter-spacing: 1px;
                          text-transform: uppercase;
                        "
                      >
                        Customer message
                      </p>

                      <div
                        style="
                          color: #333333;
                          font-size: 15px;
                          line-height: 1.75;
                          word-break: break-word;
                        "
                      >
                        ${safeMessage}
                      </div>
                    </div>

                    <div
                      style="
                        margin-top: 26px;
                        text-align: center;
                      "
                    >
                      <a
                        href="https://wa.me/91${safePhone}?text=${encodeURIComponent(
                          `Hello ${name}, thank you for contacting Krinay regarding ${subject}.`,
                        )}"
                        style="
                          display: inline-block;
                          padding: 13px 22px;
                          border-radius: 999px;
                          background: #922424;
                          color: #ffffff;
                          font-size: 14px;
                          font-weight: 700;
                          text-decoration: none;
                        "
                      >
                        Reply on WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 20px 30px;
                      border-top: 1px solid #eadada;
                      background: #fffafa;
                      color: #777777;
                      font-size: 12px;
                      line-height: 1.6;
                      text-align: center;
                    "
                  >
                    This email was generated from the Krinay
                    website contact form.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildCustomerEmail({
  name,
  subject,
}: {
  name: string;
  subject: string;
}) {
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Thank You for Contacting Krinay</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f8f3f3;
          color: #171717;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="background: #f8f3f3; padding: 32px 12px;"
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 620px;
                  overflow: hidden;
                  border: 1px solid #eadada;
                  border-radius: 20px;
                  background: #ffffff;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 34px 28px;
                      background: #922424;
                      color: #ffffff;
                      text-align: center;
                    "
                  >
                    <div
                      style="
                        margin-bottom: 10px;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 3px;
                        text-transform: uppercase;
                        color: rgba(255, 255, 255, 0.74);
                      "
                    >
                      Krinay Scrubs
                    </div>

                    <h1
                      style="
                        margin: 0;
                        font-size: 28px;
                        line-height: 1.3;
                      "
                    >
                      Thank you for contacting us
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 32px 28px;">
                    <p
                      style="
                        margin: 0 0 18px;
                        color: #222222;
                        font-size: 16px;
                        line-height: 1.75;
                      "
                    >
                      Hello <strong>${safeName}</strong>,
                    </p>

                    <p
                      style="
                        margin: 0 0 18px;
                        color: #555555;
                        font-size: 15px;
                        line-height: 1.75;
                      "
                    >
                      We have received your enquiry regarding
                      <strong>${safeSubject}</strong>.
                      The Krinay team will review your message
                      and respond as soon as possible.
                    </p>

                    <div
                      style="
                        margin: 24px 0;
                        padding: 18px;
                        border-left: 4px solid #922424;
                        border-radius: 8px;
                        background: #fff5f5;
                        color: #444444;
                        font-size: 14px;
                        line-height: 1.7;
                      "
                    >
                      For urgent product, size, order or
                      bulk-purchase assistance, you may also
                      connect with us directly on WhatsApp.
                    </div>

                    <div style="text-align: center;">
                      <a
                        href="https://wa.me/918586083877?text=${encodeURIComponent(
                          `Hello Krinay, I submitted a website enquiry regarding ${subject}. My name is ${name}.`,
                        )}"
                        style="
                          display: inline-block;
                          padding: 13px 22px;
                          border-radius: 999px;
                          background: #922424;
                          color: #ffffff;
                          font-size: 14px;
                          font-weight: 700;
                          text-decoration: none;
                        "
                      >
                        Chat with Krinay
                      </a>
                    </div>

                    <p
                      style="
                        margin: 28px 0 0;
                        color: #555555;
                        font-size: 15px;
                        line-height: 1.75;
                      "
                    >
                      Regards,<br />
                      <strong>Krinay Team</strong><br />
                      Built for those who heal.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 20px 28px;
                      border-top: 1px solid #eadada;
                      background: #fffafa;
                      color: #777777;
                      font-size: 12px;
                      line-height: 1.6;
                      text-align: center;
                    "
                  >
                    Contact: +91 85860 83877 ·
                    contact@krinay.in
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function POST(
  request: Request,
) {
  try {
    let body: ContactRequestBody;

    try {
      body =
        (await request.json()) as ContactRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request data received.",
        },
        {
          status: 400,
        },
      );
    }

    const name = sanitizeText(body.name);
    const phone = sanitizeText(
      body.phone,
    ).replace(/\D/g, "");
    const email = sanitizeText(
      body.email,
    ).toLowerCase();
    const subject = sanitizeText(
      body.subject,
    );
    const message = sanitizeText(
      body.message,
    );
    const website = sanitizeText(
      body.website,
    );

    // Honeypot: bots normally fill hidden fields.
    if (website) {
      return NextResponse.json({
        success: true,
        message:
          "Message received successfully.",
      });
    }

    if (
      !name ||
      !phone ||
      !subject ||
      !message
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, phone, subject aur message required hain.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      name.length >
      MAX_NAME_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name bahut lamba hai.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !PHONE_PATTERN.test(phone)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 10-digit Indian mobile number enter karein.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      email &&
      !EMAIL_PATTERN.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid email address enter karein.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      subject.length >
      MAX_SUBJECT_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject bahut lamba hai.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      message.length <
      10
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message kam se kam 10 characters ka hona chahiye.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      message.length >
      MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message maximum 3000 characters ka ho sakta hai.",
        },
        {
          status: 400,
        },
      );
    }

    const adminEmailResult =
      await resend.emails.send({
        from: resendConfig.fromEmail,
        to: [
          resendConfig.receiverEmail,
        ],
        subject: `New Krinay enquiry: ${subject}`,
        replyTo:
          email ||
          resendConfig.receiverEmail,
        html: buildAdminEmail({
          name,
          phone,
          email,
          subject,
          message,
        }),
        text: [
          "New Krinay contact enquiry",
          "",
          `Name: ${name}`,
          `Phone: +91 ${phone}`,
          `Email: ${email || "Not provided"}`,
          `Subject: ${subject}`,
          "",
          "Message:",
          message,
        ].join("\n"),
      });

    if (adminEmailResult.error) {
      console.error(
        "Resend admin email error:",
        adminEmailResult.error,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Message submit nahi ho paya. Please WhatsApp ya call karein.",
        },
        {
          status: 502,
        },
      );
    }

    // Auto-reply only when customer entered email.
    if (email) {
      const customerEmailResult =
        await resend.emails.send({
          from:
            resendConfig.fromEmail,
          to: [email],
          subject:
            "We received your Krinay enquiry",
          replyTo:
            resendConfig.receiverEmail,
          html: buildCustomerEmail({
            name,
            subject,
          }),
          text: [
            `Hello ${name},`,
            "",
            `We received your enquiry regarding "${subject}".`,
            "The Krinay team will respond as soon as possible.",
            "",
            "For urgent assistance:",
            "WhatsApp/Call: +91 85860 83877",
            "Email: contact@krinay.in",
            "",
            "Regards,",
            "Krinay Team",
          ].join("\n"),
        });

      if (
        customerEmailResult.error
      ) {
        console.error(
          "Resend customer auto-reply error:",
          customerEmailResult.error,
        );

        // Admin email has already been sent, so
        // do not fail the entire form submission.
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Message received successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Contact API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error aaya. Please thodi der baad try karein ya WhatsApp par contact karein.",
      },
      {
        status: 500,
      },
    );
  }
}