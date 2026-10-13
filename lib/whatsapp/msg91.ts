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

type CustomerOrderWhatsAppPayload = {
  orderId: string;
  customerName: string;
  phone: string;
  product: string;
  size: string;
  amount: number | string;
  paymentStatus: string;
};

type Msg91Result = {
  sent: boolean;
  data?: unknown;
  error?: string;
};

const MSG91_TEMPLATE_NAMESPACE = "cb8d0aed_06fc_4666_a1da_8665eae9f946";

/*
 * ==========================================
 * NORMALIZE INDIAN WHATSAPP NUMBER
 * ==========================================
 *
 * 9820862320
 *      ↓
 * 919820862320
 *
 * +91 9820862320
 *      ↓
 * 919820862320
 */

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

/*
 * ==========================================
 * MSG91 RESPONSE READER
 * ==========================================
 */

async function readMsg91Response(
  response: Response,
) {
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

  return {
    text,
    data,
  };
}

/*
 * ==========================================
 * ADMIN NEW ORDER WHATSAPP
 * ==========================================
 *
 * Template:
 * krinay_new_order
 *
 * Receiver:
 * KRINAY_ADMIN_WHATSAPP
 */

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
    process.env
      .MSG91_AUTH_KEY
      ?.trim();

  const adminNumber =
    process.env
      .KRINAY_ADMIN_WHATSAPP
      ?.trim();

  const integratedNumber =
    process.env
      .MSG91_WHATSAPP_NUMBER
      ?.trim() ||
    "919599443877";

  /*
   * ENV CHECK
   */

  if (!authKey) {
    console.error(
      "[MSG91] MSG91_AUTH_KEY missing",
    );

    return {
      sent: false,
      error:
        "MSG91_AUTH_KEY missing",
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
    const response =
      await fetch(
        "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            authkey:
              authKey,
          },

          body: JSON.stringify({
            integrated_number:
              cleanIntegratedNumber,

            content_type:
              "template",

            payload: {
              messaging_product:
                "whatsapp",

              type:
                "template",

              template: {
                name:
                  "krinay_new_order",

                language: {
                  code: "en",

                  policy:
                    "deterministic",
                },

                namespace:
                  process.env.MSG91_NEW_ORDER_NAMESPACE?.trim() || MSG91_TEMPLATE_NAMESPACE,

                to_and_components: [
                  {
                    to: [
                      cleanAdminNumber,
                    ],

                    components: {
                      body_1: {
                        type:
                          "text",

                        value:
                          String(
                            orderId,
                          ),
                      },

                      body_2: {
                        type:
                          "text",

                        value:
                          String(
                            customerName,
                          ),
                      },

                      body_3: {
                        type:
                          "text",

                        value:
                          String(
                            phone,
                          ),
                      },

                      body_4: {
                        type:
                          "text",

                        value:
                          String(
                            product,
                          ),
                      },

                      body_5: {
                        type:
                          "text",

                        value:
                          String(
                            size,
                          ),
                      },

                      body_6: {
                        type:
                          "text",

                        value:
                          String(
                            color,
                          ),
                      },

                      body_7: {
                        type:
                          "text",

                        value:
                          embroidery
                            ? "Yes"
                            : "No",
                      },

                      body_8: {
                        type:
                          "text",

                        value:
                          String(
                            amount,
                          ),
                      },

                      body_9: {
                        type:
                          "text",

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

          cache:
            "no-store",
        },
      );

    const {
      text,
      data,
    } =
      await readMsg91Response(
        response,
      );

    if (!response.ok) {
      console.error(
        "[MSG91] Admin WhatsApp API error:",
        response.status,
        data,
      );

      return {
        sent: false,

        error:
          `MSG91 Admin API failed (${response.status}): ${text}`,
      };
    }

    console.log(
      "[MSG91] Admin new order WhatsApp sent:",
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
        : "MSG91 Admin WhatsApp failed";

    console.error(
      "[MSG91] Admin WhatsApp notification failed:",
      error,
    );

    return {
      sent: false,
      error:
        message,
    };
  }
}

/*
 * ==========================================
 * CUSTOMER ORDER CONFIRMED WHATSAPP
 * ==========================================
 *
 * Template:
 * krinay_order_confirmed
 *
 * IMPORTANT:
 * Receiver admin ENV se nahi aayega.
 *
 * Receiver = customer checkout phone
 */

export async function sendCustomerOrderConfirmedWhatsApp({
  orderId,
  customerName,
  phone,
  product,
  size,
  amount,
  paymentStatus,
}: CustomerOrderWhatsAppPayload): Promise<Msg91Result> {
  const authKey =
    process.env
      .MSG91_AUTH_KEY
      ?.trim();

  const integratedNumber =
    process.env
      .MSG91_WHATSAPP_NUMBER
      ?.trim() ||
    "919599443877";

  /*
   * ENV CHECK
   */

  if (!authKey) {
    console.error(
      "[MSG91] MSG91_AUTH_KEY missing for customer notification",
    );

    return {
      sent: false,
      error:
        "MSG91_AUTH_KEY missing",
    };
  }

  /*
   * CUSTOMER PHONE CHECK
   */

  if (!phone) {
    console.error(
      "[MSG91] Customer phone missing",
    );

    return {
      sent: false,
      error:
        "Customer phone missing",
    };
  }

  const cleanCustomerNumber =
    normalizeIndianNumber(
      phone,
    );

  const cleanIntegratedNumber =
    normalizeIndianNumber(
      integratedNumber,
    );

  /*
   * Basic protection against
   * invalid Indian phone number
   */

  if (
    cleanCustomerNumber.length !==
      12 ||
    !cleanCustomerNumber.startsWith(
      "91",
    )
  ) {
    console.error(
      "[MSG91] Invalid customer WhatsApp number:",
      {
        phone,
        cleanCustomerNumber,
      },
    );

    return {
      sent: false,

      error:
        "Invalid customer WhatsApp number",
    };
  }

  try {
    const response =
      await fetch(
        "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            authkey:
              authKey,
          },

          body: JSON.stringify({
            integrated_number:
              cleanIntegratedNumber,

            content_type:
              "template",

            payload: {
              messaging_product:
                "whatsapp",

              type:
                "template",

              template: {
                /*
                 * Customer template
                 */

                name:
                  "krinay_order_confirmed",

                language: {
                  code:
                    "en",

                  policy:
                    "deterministic",
                },

                namespace:
                  MSG91_TEMPLATE_NAMESPACE,

                /*
                 * Template mapping:
                 *
                 * {{1}} Customer Name
                 * {{2}} Order ID
                 * {{3}} Product
                 * {{4}} Size
                 * {{5}} Amount
                 * {{6}} Payment
                 */

                to_and_components: [
                  {
                    /*
                     * IMPORTANT:
                     *
                     * Customer number yahi
                     * dynamically ja raha hai.
                     */

                    to: [
                      cleanCustomerNumber,
                    ],

                    components: {
                      body_1: {
                        type:
                          "text",

                        value:
                          String(
                            customerName,
                          ),
                      },

                      body_2: {
                        type:
                          "text",

                        value:
                          String(
                            orderId,
                          ),
                      },

                      body_3: {
                        type:
                          "text",

                        value:
                          String(
                            product,
                          ),
                      },

                      body_4: {
                        type:
                          "text",

                        value:
                          String(
                            size,
                          ),
                      },

                      body_5: {
                        type:
                          "text",

                        value:
                          String(
                            amount,
                          ),
                      },

                      body_6: {
                        type:
                          "text",

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

          cache:
            "no-store",
        },
      );

    const {
      text,
      data,
    } =
      await readMsg91Response(
        response,
      );

    if (!response.ok) {
      console.error(
        "[MSG91] Customer WhatsApp API error:",
        response.status,
        data,
      );

      return {
        sent: false,

        error:
          `MSG91 Customer API failed (${response.status}): ${text}`,
      };
    }

    console.log(
      "[MSG91] Customer order confirmed WhatsApp sent:",
      {
        orderId,

        customerNumber:
          cleanCustomerNumber,

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
        : "MSG91 Customer WhatsApp failed";

    console.error(
      "[MSG91] Customer WhatsApp notification failed:",
      error,
    );

    return {
      sent: false,
      error:
        message,
    };
  }
}
