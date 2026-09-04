import "server-only";

type WhatsAppOrderPayload = {
  orderId: string;
  customerName: string;
  phone: string;
  product: string;
  size: string;
  color: string;
  embroidery: boolean;
  amount: number | string;
  paymentStatus: string;
};

type Msg91Result = {
  sent: boolean;
  data?: unknown;
  error?: string;
};

function normalizeIndianNumber(
  value: string,
) {
  const digits =
    value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return digits;
  }

  return digits;
}

export async function sendNewOrderWhatsApp({
  orderId,
  customerName,
  phone,
  product,
  size,
  color,
  embroidery,
  amount,
  paymentStatus,
}: WhatsAppOrderPayload): Promise<Msg91Result> {
  const authKey =
    process.env.MSG91_AUTH_KEY?.trim();

  const adminNumber =
    process.env
      .KRINAY_ADMIN_WHATSAPP
      ?.trim();

  const integratedNumber =
    process.env
      .MSG91_WHATSAPP_NUMBER
      ?.trim() ||
    "919599443877";

  if (!authKey) {
    console.error(
      "[MSG91] MSG91_AUTH_KEY missing",
    );

    return {
      sent: false,
      error: "MSG91_AUTH_KEY missing",
    };
  }

  if (!adminNumber) {
    console.error(
      "[MSG91] KRINAY_ADMIN_WHATSAPP missing",
    );

    return {
      sent: false,
      error:
        "KRINAY_ADMIN_WHATSAPP missing",
    };
  }

  const cleanAdminNumber =
    normalizeIndianNumber(
      adminNumber,
    );

  const cleanIntegratedNumber =
    normalizeIndianNumber(
      integratedNumber,
    );

  try {
    const response = await fetch(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          authkey: authKey,
        },

        body: JSON.stringify({
          integrated_number:
            cleanIntegratedNumber,

          content_type:
            "template",

          payload: {
            messaging_product:
              "whatsapp",

            type: "template",

            template: {
              name:
                "krinay_new_order",

              language: {
                code: "en",
                policy:
                  "deterministic",
              },

              namespace: null,

              to_and_components: [
                {
                  to: [
                    cleanAdminNumber,
                  ],

                  components: {
                    body_1: {
                      type: "text",
                      value:
                        String(
                          orderId,
                        ),
                    },

                    body_2: {
                      type: "text",
                      value:
                        String(
                          customerName,
                        ),
                    },

                    body_3: {
                      type: "text",
                      value:
                        String(
                          phone,
                        ),
                    },

                    body_4: {
                      type: "text",
                      value:
                        String(
                          product,
                        ),
                    },

                    body_5: {
                      type: "text",
                      value:
                        String(
                          size,
                        ),
                    },

                    body_6: {
                      type: "text",
                      value:
                        String(
                          color,
                        ),
                    },

                    body_7: {
                      type: "text",
                      value:
                        embroidery
                          ? "Yes"
                          : "No",
                    },

                    body_8: {
                      type: "text",
                      value:
                        String(
                          amount,
                        ),
                    },

                    body_9: {
                      type: "text",
                      value:
                        String(
                          paymentStatus,
                        ),
                    },
                  },
                },
              ],
            },
          },
        }),

        cache: "no-store",
      },
    );

    const text =
      await response.text();

    let data: unknown;

    try {
      data =
        text
          ? JSON.parse(text)
          : {};
    } catch {
      data = text;
    }

    if (!response.ok) {
      console.error(
        "[MSG91] WhatsApp API error:",
        response.status,
        data,
      );

      return {
        sent: false,

        error:
          `MSG91 API failed (${response.status}): ${text}`,
      };
    }

    console.log(
      "[MSG91] New order WhatsApp sent:",
      {
        orderId,
        adminNumber:
          cleanAdminNumber,
        data,
      },
    );

    return {
      sent: true,
      data,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "MSG91 WhatsApp failed";

    console.error(
      "[MSG91] WhatsApp notification failed:",
      error,
    );

    return {
      sent: false,
      error: message,
    };
  }
}