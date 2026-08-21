import "server-only";

import Order from "@/models/Order";

type TwilioMessageInput = {
  to: string;
  from: string;
  body?: string;
  contentSid?: string;
  contentVariables?: Record<string, string>;
};

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

async function sendTwilioMessage(
  input: TwilioMessageInput,
) {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID?.trim();

  const authToken =
    process.env.TWILIO_AUTH_TOKEN?.trim();

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
            ).toString("base64")}`,

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
    | Record<string, unknown>
    | null = null;

  try {
    payload =
      JSON.parse(text) as Record<
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

function getAdminOrderMessage(
  order: InstanceType<typeof Order>,
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
    order.shiprocketShipmentId
      ? `Shiprocket Shipment: ${order.shiprocketShipmentId}`
      : "Shiprocket: sync pending",
    "",
    "Courier / AWB / pickup is NOT auto-scheduled.",
    "Open Shiprocket panel and schedule manually when ready.",
  ].join("\n");
}

export async function notifyAdminNewOrder(
  order: InstanceType<typeof Order>,
) {
  if (
    order.adminOrderNotifiedAt
  ) {
    return {
      sent: true,
      alreadySent: true,
    };
  }

  const adminNumber =
    process.env.KRINAY_ADMIN_WHATSAPP?.trim();

  const whatsappFrom =
    process.env.TWILIO_WHATSAPP_FROM?.trim();

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
    process.env.TWILIO_WHATSAPP_CONTENT_SID?.trim();

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

export async function notifyCustomerOrderConfirmed(
  order: InstanceType<typeof Order>,
) {
  if (
    order.customerOrderNotifiedAt
  ) {
    return {
      sent: true,
      alreadySent: true,
    };
  }

  const smsFrom =
    process.env.TWILIO_FROM_NUMBER?.trim();

  if (!smsFrom) {
    return {
      sent: false,
      skipped:
        "sms_from_missing",
    };
  }

  const siteUrl =
    (
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://krinay.in"
    ).replace(/\/$/, "");

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

        body:
          message,
      });

    if (result.sent) {
      order.customerOrderNotifiedAt =
        new Date();

      await order.save();
    }

    return result;
  } catch (error) {
    /*
     * Customer SMS failure kabhi order/payment ko fail nahi karega.
     */
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

export async function safelyNotifyConfirmedOrder(
  order: InstanceType<typeof Order>,
) {
  const [
    admin,
    customer,
  ] = await Promise.all([
    notifyAdminNewOrder(
      order,
    ),
    notifyCustomerOrderConfirmed(
      order,
    ),
  ]);

  return {
    admin,
    customer,
  };
}
