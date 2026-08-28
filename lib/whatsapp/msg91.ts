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
}: WhatsAppOrderPayload) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const adminNumber = process.env.KRINAY_ADMIN_WHATSAPP;

  if (!authKey) {
    console.error("MSG91_AUTH_KEY is missing");
    return;
  }

  if (!adminNumber) {
    console.error("KRINAY_ADMIN_WHATSAPP is missing");
    return;
  }

  try {
    const response = await fetch(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: authKey,
        },
        body: JSON.stringify({
          integrated_number: "919599443877",
          content_type: "template",

          payload: {
            messaging_product: "whatsapp",
            type: "template",

            template: {
              name: "krinay_new_order",

              language: {
                code: "en",
                policy: "deterministic",
              },

              namespace: null,

              to_and_components: [
                {
                  to: [adminNumber],

                  components: {
                    body_1: {
                      type: "text",
                      value: String(orderId),
                    },

                    body_2: {
                      type: "text",
                      value: String(customerName),
                    },

                    body_3: {
                      type: "text",
                      value: String(phone),
                    },

                    body_4: {
                      type: "text",
                      value: String(product),
                    },

                    body_5: {
                      type: "text",
                      value: String(size),
                    },

                    body_6: {
                      type: "text",
                      value: String(color),
                    },

                    body_7: {
                      type: "text",
                      value: embroidery ? "Yes" : "No",
                    },

                    body_8: {
                      type: "text",
                      value: String(amount),
                    },

                    body_9: {
                      type: "text",
                      value: String(paymentStatus),
                    },
                  },
                },
              ],
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("MSG91 WhatsApp API Error:", data);
      return;
    }

    console.log("WhatsApp order notification sent:", data);
  } catch (error) {
    console.error("WhatsApp notification failed:", error);
  }
}