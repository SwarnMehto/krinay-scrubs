import "server-only";

import Order from "@/models/Order";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type TwilioMessageInput = {
  to: string;
  from: string;
  body?: string;
  contentSid?: string;
  contentVariables?: Record<string, string>;
};

type NotificationResult = {
  sent: boolean;
  alreadySent?: boolean;
  skipped?: string;
  sid?: string;
  id?: string;
  error?: string;
};

/*
 * =========================================================
 * PHONE HELPERS
 * =========================================================
 */

function normalizeE164(
  value: string,
): string {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith("+")
  ) {
    return trimmed;
  }

  const digits =
    trimmed.replace(
      /\D/g,
      "",
    );

  if (!digits) {
    return "";
  }

  if (
    digits.length === 10
  ) {
    return `+91${digits}`;
  }

  return `+${digits}`;
}

function normalizeWhatsapp(
  value: string,
): string {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith(
      "whatsapp:",
    )
  ) {
    return trimmed;
  }

  return `whatsapp:${normalizeE164(
    trimmed,
  )}`;
}

/*
 * =========================================================
 * HTML SAFETY
 * =========================================================
 */

function escapeHtml(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /"/g,
      "&quot;",
    )
    .replace(
      /'/g,
      "&#039;",
    );
}

/*
 * =========================================================
 * TWILIO MESSAGE
 * =========================================================
 */

async function sendTwilioMessage(
  input: TwilioMessageInput,
): Promise<NotificationResult> {
  const accountSid =
    process.env
      .TWILIO_ACCOUNT_SID
      ?.trim();

  const authToken =
    process.env
      .TWILIO_AUTH_TOKEN
      ?.trim();

  if (
    !accountSid ||
    !authToken
  ) {
    return {
      sent: false,

      skipped:
        "twilio_not_configured",
    };
  }

  const form =
    new URLSearchParams();

  form.set(
    "To",
    input.to,
  );

  form.set(
    "From",
    input.from,
  );

  if (input.contentSid) {
    form.set(
      "ContentSid",
      input.contentSid,
    );

    form.set(
      "ContentVariables",
      JSON.stringify(
        input.contentVariables ??
          {},
      ),
    );
  } else if (input.body) {
    form.set(
      "Body",
      input.body,
    );
  } else {
    throw new Error(
      "Twilio message body/content template missing hai.",
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
            ).toString(
              "base64",
            )}`,

          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: form,

        cache: "no-store",
      },
    );

  const text =
    await response.text();

  let payload:
    | Record<
        string,
        unknown
      >
    | null = null;

  try {
    payload =
      JSON.parse(
        text,
      ) as Record<
        string,
        unknown
      >;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload?.message ===
      "string"
        ? payload.message
        : text ||
          `Twilio error ${response.status}`;

    throw new Error(
      message,
    );
  }

  return {
    sent: true,

    sid:
      typeof payload?.sid ===
      "string"
        ? payload.sid
        : "",
  };
}

/*
 * =========================================================
 * ADMIN WHATSAPP MESSAGE
 * =========================================================
 */

function getAdminOrderMessage(
  order: InstanceType<
    typeof Order
  >,
): string {
  const itemSummary =
    order.items
      .map(
        (item) =>
          `${item.name} x${item.quantity} (${item.size}, ${item.color})`,
      )
      .join("\n");

  return [
    "🩺 NEW KRINAY ORDER",

    "",

    `Order: ${order.orderNumber}`,

    `Customer: ${order.customer.fullName}`,

    `Phone: ${order.customer.phone}`,

    `Payment: ${order.paymentMethod.toUpperCase()} / ${order.paymentStatus}`,

    `Total: ₹${order.pricing.total.toLocaleString(
      "en-IN",
    )}`,

    "",

    "Items:",

    itemSummary,

    "",

    order
      .shiprocketShipmentId
      ? `Shiprocket Shipment: ${order.shiprocketShipmentId}`
      : "Shiprocket: sync pending",

    "",

    "Courier / AWB / pickup is NOT auto-scheduled.",

    "Open Shiprocket panel and schedule manually when ready.",
  ].join("\n");
}

/*
 * =========================================================
 * ADMIN WHATSAPP
 * =========================================================
 */

export async function notifyAdminNewOrder(
  order: InstanceType<
    typeof Order
  >,
): Promise<NotificationResult> {
  if (
    order.adminOrderNotifiedAt
  ) {
    return {
      sent: true,

      alreadySent: true,
    };
  }

  const adminNumber =
    process.env
      .KRINAY_ADMIN_WHATSAPP
      ?.trim();

  const whatsappFrom =
    process.env
      .TWILIO_WHATSAPP_FROM
      ?.trim();

  if (
    !adminNumber ||
    !whatsappFrom
  ) {
    console.warn(
      "[ORDER_NOTIFICATION] Admin WhatsApp env missing. Order notification skipped.",
    );

    return {
      sent: false,

      skipped:
        "whatsapp_env_missing",
    };
  }

  const contentSid =
    process.env
      .TWILIO_WHATSAPP_CONTENT_SID
      ?.trim();

  try {
    const result =
      await sendTwilioMessage({
        to:
          normalizeWhatsapp(
            adminNumber,
          ),

        from:
          normalizeWhatsapp(
            whatsappFrom,
          ),

        body:
          contentSid
            ? undefined
            : getAdminOrderMessage(
                order,
              ),

        contentSid:
          contentSid ||
          undefined,

        contentVariables:
          contentSid
            ? {
                "1":
                  order.orderNumber,

                "2":
                  order.customer
                    .fullName,

                "3":
                  `₹${order.pricing.total.toLocaleString(
                    "en-IN",
                  )}`,

                "4":
                  order.paymentMethod.toUpperCase(),

                "5":
                  order.customer
                    .phone,
              }
            : undefined,
      });

    if (result.sent) {
      order.adminOrderNotifiedAt =
        new Date();

      await order.save();
    }

    return result;
  } catch (error) {
    console.error(
      "[ORDER_NOTIFICATION] Admin WhatsApp failed:",
      error,
    );

    return {
      sent: false,

      error:
        error instanceof Error
          ? error.message
          : "Admin WhatsApp notification failed.",
    };
  }
}

/*
 * =========================================================
 * CUSTOMER SMS
 * =========================================================
 */

export async function notifyCustomerOrderConfirmed(
  order: InstanceType<
    typeof Order
  >,
): Promise<NotificationResult> {
  if (
    order.customerOrderNotifiedAt
  ) {
    return {
      sent: true,

      alreadySent: true,
    };
  }

  const smsFrom =
    process.env
      .TWILIO_FROM_NUMBER
      ?.trim();

  if (!smsFrom) {
    return {
      sent: false,

      skipped:
        "sms_from_missing",
    };
  }

  const siteUrl =
    (
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "https://krinay.in"
    ).replace(
      /\/$/,
      "",
    );

  const message = [
    `Krinay order ${order.orderNumber} confirmed.`,

    `Track it at ${siteUrl}/track-order using Order ID ${order.orderNumber}.`,

    "Courier/AWB details will appear after dispatch is scheduled.",
  ].join(" ");

  try {
    const result =
      await sendTwilioMessage({
        to:
          normalizeE164(
            order.customer.phone,
          ),

        from:
          normalizeE164(
            smsFrom,
          ),

        body: message,
      });

    if (result.sent) {
      order.customerOrderNotifiedAt =
        new Date();

      await order.save();
    }

    return result;
  } catch (error) {
    console.error(
      "[ORDER_NOTIFICATION] Customer SMS failed:",
      error,
    );

    return {
      sent: false,

      error:
        error instanceof Error
          ? error.message
          : "Customer SMS failed.",
    };
  }
}

/*
 * =========================================================
 * RESEND EMAIL API
 * =========================================================
 */

async function sendResendEmail(
  input: {
    to: string;
    subject: string;
    html: string;
  },
): Promise<NotificationResult> {
  const apiKey =
    process.env
      .RESEND_API_KEY
      ?.trim();

  const from =
    process.env
      .RESEND_FROM_EMAIL
      ?.trim();

  if (
    !apiKey ||
    !from
  ) {
    console.warn(
      "[ORDER_EMAIL] Resend environment variables missing.",
    );

    return {
      sent: false,

      skipped:
        "resend_not_configured",
    };
  }

  try {
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
          },

          body:
            JSON.stringify({
              from,

              to: [
                input.to,
              ],

              subject:
                input.subject,

              html:
                input.html,
            }),

          cache: "no-store",
        },
      );

    const text =
      await response.text();

    let payload:
      | Record<
          string,
          unknown
        >
      | null = null;

    try {
      payload =
        text
          ? (JSON.parse(
              text,
            ) as Record<
              string,
              unknown
            >)
          : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        typeof payload?.message ===
        "string"
          ? payload.message
          : text ||
            `Resend error ${response.status}`;

      throw new Error(
        message,
      );
    }

    return {
      sent: true,

      id:
        typeof payload?.id ===
        "string"
          ? payload.id
          : "",
    };
  } catch (error) {
    return {
      sent: false,

      error:
        error instanceof Error
          ? error.message
          : "Email notification failed.",
    };
  }
}

/*
 * =========================================================
 * ORDER ITEMS EMAIL HTML
 * =========================================================
 */

function getOrderItemsHtml(
  order: InstanceType<
    typeof Order
  >,
): string {
  return order.items
    .map((item) => {
      return `
        <tr>
          <td
            style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
            "
          >
            <strong>
              ${escapeHtml(
                item.name,
              )}
            </strong>

            <br />

            <span
              style="
                color:#666666;
                font-size:13px;
              "
            >
              ${escapeHtml(
                item.size,
              )}

              •

              ${escapeHtml(
                item.color,
              )}
            </span>
          </td>

          <td
            align="center"
            style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
            "
          >
            ${escapeHtml(
              item.quantity,
            )}
          </td>

          <td
            align="right"
            style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
            "
          >
            ₹${Number(
              item.price,
            ).toLocaleString(
              "en-IN",
            )}
          </td>
        </tr>
      `;
    })
    .join("");
}

/*
 * =========================================================
 * ADMIN ORDER EMAIL
 * =========================================================
 */

export async function notifyAdminByEmail(
  order: InstanceType<
    typeof Order
  >,
): Promise<NotificationResult> {
  const adminEmail =
    process.env
      .KRINAY_ADMIN_EMAIL
      ?.trim() ||
    process.env
      .CONTACT_RECEIVER_EMAIL
      ?.trim();

  if (!adminEmail) {
    console.warn(
      "[ORDER_EMAIL] KRINAY_ADMIN_EMAIL missing.",
    );

    return {
      sent: false,

      skipped:
        "admin_email_missing",
    };
  }

  const address = [
    order.customer
      .addressLine1,

    order.customer
      .addressLine2,

    order.customer
      .landmark,

    order.customer.city,

    order.customer.state,

    order.customer
      .pinCode,
  ]
    .filter(Boolean)
    .join(", ");

  const shiprocketStatus =
    order
      .shiprocketShipmentId
      ? `Synced - Shipment ${order.shiprocketShipmentId}`
      : "Sync pending";

  const result =
    await sendResendEmail({
      to: adminEmail,

      subject:
        `New Krinay Order - ${order.orderNumber}`,

      html: `
        <!DOCTYPE html>

        <html>
          <body
            style="
              margin:0;
              background:#f6f6f6;
              font-family:Arial,Helvetica,sans-serif;
            "
          >
            <div
              style="
                max-width:680px;
                margin:30px auto;
                background:#ffffff;
                border-radius:18px;
                overflow:hidden;
                border:1px solid #eeeeee;
              "
            >
              <div
                style="
                  background:#922424;
                  color:#ffffff;
                  padding:28px;
                "
              >
                <div
                  style="
                    font-size:13px;
                    font-weight:700;
                    letter-spacing:2px;
                  "
                >
                  KRINAY
                </div>

                <h1
                  style="
                    margin:8px 0 0;
                    font-size:26px;
                  "
                >
                  New Order Received
                </h1>
              </div>

              <div
                style="
                  padding:28px;
                  color:#222222;
                "
              >
                <p>
                  A new Krinay order has been confirmed.
                </p>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Order
                    </td>

                    <td
                      align="right"
                      style="
                        padding:8px 0;
                        font-weight:700;
                        color:#922424;
                      "
                    >
                      ${escapeHtml(
                        order.orderNumber,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Customer
                    </td>

                    <td
                      align="right"
                      style="
                        padding:8px 0;
                      "
                    >
                      ${escapeHtml(
                        order.customer
                          .fullName,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Phone
                    </td>

                    <td
                      align="right"
                      style="
                        padding:8px 0;
                      "
                    >
                      ${escapeHtml(
                        order.customer
                          .phone,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Email
                    </td>

                    <td
                      align="right"
                      style="
                        padding:8px 0;
                      "
                    >
                      ${escapeHtml(
                        order.customer
                          .email ||
                          "Not provided",
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Payment
                    </td>

                    <td
                      align="right"
                      style="
                        padding:8px 0;
                      "
                    >
                      ${escapeHtml(
                        order.paymentMethod.toUpperCase(),
                      )}
                      /
                      ${escapeHtml(
                        order.paymentStatus,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Shiprocket
                    </td>

                    <td
                      align="right"
                      style="
                        padding:8px 0;
                      "
                    >
                      ${escapeHtml(
                        shiprocketStatus,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Total
                    </td>

                    <td
                      align="right"
                      style="
                        padding:8px 0;
                        font-size:20px;
                        font-weight:800;
                      "
                    >
                      ₹${Number(
                        order.pricing
                          .total,
                      ).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                  </tr>
                </table>

                <h3
                  style="
                    margin-top:30px;
                  "
                >
                  Items
                </h3>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    border:1px solid #eeeeee;
                    border-collapse:collapse;
                  "
                >
                  ${getOrderItemsHtml(
                    order,
                  )}
                </table>

                <h3
                  style="
                    margin-top:30px;
                  "
                >
                  Shipping Address
                </h3>

                <p
                  style="
                    line-height:1.7;
                    color:#555555;
                  "
                >
                  ${escapeHtml(
                    address,
                  )}
                </p>

                <div
                  style="
                    margin-top:25px;
                    padding:18px;
                    background:#fff4f4;
                    color:#922424;
                    border-radius:12px;
                    font-weight:700;
                  "
                >
                  Open Shiprocket when you are ready to ship this order.
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

  if (result.sent) {
    console.log(
      "[ORDER_EMAIL] Admin email sent:",
      order.orderNumber,
    );
  } else {
    console.error(
      "[ORDER_EMAIL] Admin email failed:",
      result,
    );
  }

  return result;
}

/*
 * =========================================================
 * CUSTOMER CONFIRMATION EMAIL
 * =========================================================
 */

export async function notifyCustomerByEmail(
  order: InstanceType<
    typeof Order
  >,
): Promise<NotificationResult> {
  const customerEmail =
    order.customer
      .email
      ?.trim();

  if (!customerEmail) {
    return {
      sent: false,

      skipped:
        "customer_email_missing",
    };
  }

  const siteUrl =
    (
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "https://krinay.in"
    ).replace(
      /\/$/,
      "",
    );

  const trackingUrl =
    `${siteUrl}/track-order?orderNumber=${encodeURIComponent(
      order.orderNumber,
    )}`;

  const result =
    await sendResendEmail({
      to:
        customerEmail,

      subject:
        `Krinay Order Confirmed - ${order.orderNumber}`,

      html: `
        <!DOCTYPE html>

        <html>
          <body
            style="
              margin:0;
              background:#f6f6f6;
              font-family:Arial,Helvetica,sans-serif;
            "
          >
            <div
              style="
                max-width:680px;
                margin:30px auto;
                background:#ffffff;
                border-radius:18px;
                overflow:hidden;
                border:1px solid #eeeeee;
              "
            >
              <div
                style="
                  background:#922424;
                  color:#ffffff;
                  padding:30px;
                  text-align:center;
                "
              >
                <div
                  style="
                    letter-spacing:2px;
                    font-size:13px;
                    font-weight:700;
                  "
                >
                  KRINAY
                </div>

                <h1
                  style="
                    margin:10px 0 0;
                  "
                >
                  Order Confirmed
                </h1>
              </div>

              <div
                style="
                  padding:30px;
                "
              >
                <p
                  style="
                    font-size:17px;
                  "
                >
                  Hi
                  <strong>
                    ${escapeHtml(
                      order.customer
                        .fullName,
                    )}
                  </strong>,
                </p>

                <p
                  style="
                    color:#555555;
                    line-height:1.7;
                  "
                >
                  Thank you for shopping with Krinay.
                  Your order has been received successfully.
                </p>

                <div
                  style="
                    background:#f7f7f7;
                    padding:20px;
                    border-radius:12px;
                    text-align:center;
                    margin:25px 0;
                  "
                >
                  <div
                    style="
                      color:#777777;
                      font-size:12px;
                      letter-spacing:1px;
                    "
                  >
                    ORDER NUMBER
                  </div>

                  <div
                    style="
                      color:#922424;
                      font-weight:800;
                      font-size:22px;
                      margin-top:8px;
                    "
                  >
                    ${escapeHtml(
                      order.orderNumber,
                    )}
                  </div>
                </div>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Payment
                    </td>

                    <td
                      align="right"
                      style="
                        font-weight:700;
                      "
                    >
                      ${escapeHtml(
                        order.paymentMethod.toUpperCase(),
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:8px 0;
                        color:#777777;
                      "
                    >
                      Total
                    </td>

                    <td
                      align="right"
                      style="
                        font-weight:800;
                        font-size:19px;
                      "
                    >
                      ₹${Number(
                        order.pricing
                          .total,
                      ).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                  </tr>
                </table>

                <h3
                  style="
                    margin-top:28px;
                  "
                >
                  Your Items
                </h3>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    border:1px solid #eeeeee;
                    border-collapse:collapse;
                  "
                >
                  ${getOrderItemsHtml(
                    order,
                  )}
                </table>

                <div
                  style="
                    text-align:center;
                    margin-top:32px;
                  "
                >
                  <a
                    href="${trackingUrl}"
                    style="
                      display:inline-block;
                      background:#922424;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 28px;
                      border-radius:30px;
                      font-weight:700;
                    "
                  >
                    Track Your Order
                  </a>
                </div>

                <p
                  style="
                    margin-top:30px;
                    color:#666666;
                    line-height:1.7;
                  "
                >
                  Courier and tracking information will appear after your shipment is processed.
                </p>

                <p
                  style="
                    margin-top:25px;
                  "
                >
                  Regards,
                  <br />

                  <strong>
                    Team Krinay
                  </strong>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

  if (result.sent) {
    console.log(
      "[ORDER_EMAIL] Customer email sent:",
      order.orderNumber,
    );
  } else {
    console.error(
      "[ORDER_EMAIL] Customer email failed:",
      result,
    );
  }

  return result;
}

/*
 * =========================================================
 * FINAL ORDER NOTIFICATION
 * =========================================================
 *
 * COD confirmed order:
 *
 * Admin WhatsApp
 * Customer SMS
 * Admin Email
 * Customer Email
 *
 * One integration fail hone par
 * remaining integrations still run.
 * =========================================================
 */

export async function safelyNotifyConfirmedOrder(
  order: InstanceType<
    typeof Order
  >,
) {
  const results =
    await Promise.allSettled([
      notifyAdminNewOrder(
        order,
      ),

      notifyCustomerOrderConfirmed(
        order,
      ),

      notifyAdminByEmail(
        order,
      ),

      notifyCustomerByEmail(
        order,
      ),
    ]);

  const [
    adminWhatsAppResult,
    customerSmsResult,
    adminEmailResult,
    customerEmailResult,
  ] = results;

  const normalizeResult = (
    result:
      PromiseSettledResult<
        NotificationResult
      >,
  ): NotificationResult => {
    if (
      result.status ===
      "fulfilled"
    ) {
      return result.value;
    }

    return {
      sent: false,

      error:
        result.reason instanceof
        Error
          ? result.reason
              .message
          : String(
              result.reason ??
                "Notification failed.",
            ),
    };
  };

  return {
    adminWhatsApp:
      normalizeResult(
        adminWhatsAppResult,
      ),

    customerSms:
      normalizeResult(
        customerSmsResult,
      ),

    adminEmail:
      normalizeResult(
        adminEmailResult,
      ),

    customerEmail:
      normalizeResult(
        customerEmailResult,
      ),
  };
}