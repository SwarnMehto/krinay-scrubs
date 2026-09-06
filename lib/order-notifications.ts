import {
  sendCustomerOrderConfirmedWhatsApp,
  sendNewOrderWhatsApp,
} from "@/lib/whatsapp/msg91";

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
  order: InstanceType<typeof Order>,
): Promise<NotificationResult> {
  if (order.adminOrderNotifiedAt) {
    return {
      sent: true,
      alreadySent: true,
    };
  }

  try {
    const productSummary =
      order.items
        .map(
          (item) =>
            `${item.name} x${item.quantity}`,
        )
        .join(" | ");

    const sizeSummary =
      order.items
        .map(
          (item) =>
            `${item.name}: ${item.size}`,
        )
        .join(" | ");

    const colorSummary =
      order.items
        .map(
          (item) =>
            `${item.name}: ${item.color}`,
        )
        .join(" | ");

    const hasEmbroidery =
      order.items.some(
        (item) =>
          Boolean(
            (item as any)
              .embroidery
              ?.enabled,
          ),
      );

    const result =
      await sendNewOrderWhatsApp({
        orderId:
          order.orderNumber,

        customerName:
          order.customer
            .fullName,

        phone:
          order.customer.phone,

        product:
          productSummary,

        size:
          sizeSummary,

        color:
          colorSummary,

        embroidery:
          hasEmbroidery,

        amount:
          order.pricing.total,

        paymentStatus:
          order.paymentStatus,
      });

    if (!result.sent) {
      return {
        sent: false,

        error:
          result.error ||
          "MSG91 WhatsApp notification failed.",
      };
    }

    order.adminOrderNotifiedAt =
      new Date();

    await order.save();

    console.log(
      "[ORDER_NOTIFICATION] Admin WhatsApp sent via MSG91:",
      order.orderNumber,
    );

    return {
      sent: true,
    };
  } catch (error) {
    console.error(
      "[ORDER_NOTIFICATION] MSG91 admin WhatsApp failed:",
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
 * CUSTOMER WHATSAPP
 * =========================================================
 *
 * Template:
 * krinay_order_confirmed
 *
 * Receiver:
 * Customer checkout phone number
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

  const customerPhone =
    order.customer.phone?.trim();

  if (!customerPhone) {
    return {
      sent: false,
      skipped:
        "customer_phone_missing",
    };
  }

  const productSummary =
    order.items
      .map(
        (item) =>
          `${item.name} x${item.quantity}`,
      )
      .join(" | ");

  const sizeSummary =
    order.items
      .map((item) => {
        const itemAny =
          item as any;

        if (
          itemAny.topSize ||
          itemAny.bottomSize
        ) {
          const parts: string[] =
            [];

          if (itemAny.topSize) {
            parts.push(
              `Top ${itemAny.topSize}`,
            );
          }

          if (itemAny.bottomSize) {
            parts.push(
              `Bottom ${itemAny.bottomSize}`,
            );
          }

          return parts.join(
            " / ",
          );
        }

        return String(
          item.size || "",
        );
      })
      .filter(Boolean)
      .join(" | ");

  try {
    const result =
      await sendCustomerOrderConfirmedWhatsApp(
        {
          orderId:
            order.orderNumber,

          customerName:
            order.customer.fullName,

          phone:
            customerPhone,

          product:
            productSummary,

          size:
            sizeSummary,

          amount:
            order.pricing.total,

          paymentStatus:
            order.paymentStatus,
        },
      );

    if (!result.sent) {
      console.error(
        "[ORDER_NOTIFICATION] Customer WhatsApp failed:",
        result,
      );

      return {
        sent: false,

        error:
          result.error ||
          "Customer WhatsApp notification failed.",
      };
    }

    order.customerOrderNotifiedAt =
      new Date();

    await order.save();

    console.log(
      "[ORDER_NOTIFICATION] Customer WhatsApp sent via MSG91:",
      {
        orderNumber:
          order.orderNumber,

        customerPhone,
      },
    );

    return {
      sent: true,
    };
  } catch (error) {
    console.error(
      "[ORDER_NOTIFICATION] Customer WhatsApp failed:",
      error,
    );

    return {
      sent: false,

      error:
        error instanceof Error
          ? error.message
          : "Customer WhatsApp notification failed.",
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
      /*
       * Order item ke price me embroidery addon already
       * included hai. Yahan embroidery ko separate detail
       * panel me show kar rahe hain so production team ko
       * exact customization same order number ke against
       * mil jaye.
       */
      const embroidery =
        (item as any)
          .embroidery;

      const embroideryHtml =
        embroidery?.enabled
          ? `
            <div
              style="
                margin-top:12px;
                padding:12px;
                background:#fff6f6;
                border:1px solid #efd0d0;
                border-radius:10px;
                font-size:13px;
                line-height:1.7;
              "
            >
              <div
                style="
                  color:#922424;
                  font-weight:800;
                  margin-bottom:6px;
                "
              >
                CUSTOM EMBROIDERY
              </div>

              <div>
                <strong>Type:</strong>
                ${escapeHtml(
                  embroidery.mode ||
                    "",
                )}
              </div>

              ${
                embroidery.line1
                  ? `
                    <div>
                      <strong>Line 1:</strong>
                      ${escapeHtml(
                        embroidery.line1,
                      )}
                    </div>
                  `
                  : ""
              }

              ${
                embroidery.line2
                  ? `
                    <div>
                      <strong>Line 2:</strong>
                      ${escapeHtml(
                        embroidery.line2,
                      )}
                    </div>
                  `
                  : ""
              }

              ${
                embroidery.font
                  ? `
                    <div>
                      <strong>Font:</strong>
                      ${escapeHtml(
                        embroidery.font,
                      )}
                    </div>
                  `
                  : ""
              }

              ${
                embroidery.textColor
                  ? `
                    <div>
                      <strong>Thread colour:</strong>
                      ${escapeHtml(
                        embroidery.textColor,
                      )}
                    </div>
                  `
                  : ""
              }

              <div>
                <strong>Bottom name:</strong>
                ${
                  embroidery
                    .addBottomName
                    ? "Yes"
                    : "No"
                }
              </div>

              ${
                embroidery
                  .selectedIconLabel
                  ? `
                    <div>
                      <strong>Selected icon:</strong>
                      ${escapeHtml(
                        embroidery
                          .selectedIconLabel,
                      )}
                    </div>
                  `
                  : ""
              }

              ${
                embroidery.fileUrl
                  ? `
                    <div>
                      <strong>Custom logo:</strong>
                      <a
                        href="${escapeHtml(
                          embroidery
                            .fileUrl,
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                          color:#922424;
                          font-weight:700;
                        "
                      >
                        Open ${escapeHtml(
                          embroidery
                            .fileName ||
                            "logo",
                        )}
                      </a>
                    </div>
                  `
                  : ""
              }

              ${
                embroidery.instructions
                  ? `
                    <div>
                      <strong>Instructions:</strong>
                      ${escapeHtml(
                        embroidery
                          .instructions,
                      )}
                    </div>
                  `
                  : ""
              }

              <div
                style="
                  margin-top:6px;
                  color:#922424;
                  font-weight:800;
                "
              >
                Embroidery price:
                ₹${Number(
                  embroidery.price ||
                    0,
                ).toLocaleString(
                  "en-IN",
                )}
              </div>
            </div>
          `
          : "";

      return `
        <tr>
          <td
            style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
              vertical-align:top;
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

            ${embroideryHtml}
          </td>

          <td
            align="center"
            style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
              vertical-align:top;
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
              vertical-align:top;
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

  const hasEmbroidery =
    order.items.some(
      (item) =>
        Boolean(
          (item as any)
            .embroidery
            ?.enabled,
        ),
    );

  const result =
    await sendResendEmail({
      to: adminEmail,

      subject:
        hasEmbroidery
          ? `New Krinay Order - ${order.orderNumber} - EMBROIDERY`
          : `New Krinay Order - ${order.orderNumber}`,

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
 * Customer WhatsApp
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
    customerWhatsAppResult,
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

    customerWhatsApp:
      normalizeResult(
        customerWhatsAppResult,
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
