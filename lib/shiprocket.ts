import "server-only";

import Order from "@/models/Order";

const SHIPROCKET_BASE_URL =
  "https://apiv2.shiprocket.in/v1/external";

type JsonObject =
  Record<string, unknown>;

type ShiprocketTokenCache = {
  token: string;
  refreshAfter: number;
};

let tokenCache:
  | ShiprocketTokenCache
  | null = null;

/*
 * =====================================
 * ENV HELPERS
 * =====================================
 */

function getRequiredEnv(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} missing hai. .env.local / Vercel Environment Variables check karo.`,
    );
  }

  return value;
}

function getFirstEnv(
  names: string[],
): string {
  for (const name of names) {
    const value =
      process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return "";
}

function getPositiveNumberEnv(
  names: string[],
  fallback: number,
): number {
  for (const name of names) {
    const value =
      Number(
        process.env[name],
      );

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  return fallback;
}

/*
 * =====================================
 * RESPONSE HELPERS
 * =====================================
 */

function asObject(
  value: unknown,
): JsonObject {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as JsonObject;
  }

  return {};
}

function asString(
  value: unknown,
): string {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return "";
}

async function readResponse(
  response: Response,
): Promise<unknown> {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function getApiErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  const object =
    asObject(payload);

  const message =
    object.message ??
    object.error ??
    object.errors;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  if (
    message &&
    typeof message === "object"
  ) {
    try {
      return JSON.stringify(
        message,
      );
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/*
 * =====================================
 * SHIPROCKET AUTH
 * =====================================
 */

export async function getShiprocketToken(
  forceRefresh = false,
): Promise<string> {
  /*
   * Cached token valid hai to
   * login API dobara hit nahi karenge.
   */
  if (
    !forceRefresh &&
    tokenCache &&
    tokenCache.refreshAfter >
      Date.now()
  ) {
    return tokenCache.token;
  }

  const email =
    getRequiredEnv(
      "SHIPROCKET_API_EMAIL",
    );

  const password =
    getRequiredEnv(
      "SHIPROCKET_API_PASSWORD",
    );

  const response =
    await fetch(
      `${SHIPROCKET_BASE_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body:
          JSON.stringify({
            email,
            password,
          }),

        cache: "no-store",
      },
    );

  const payload =
    await readResponse(
      response,
    );

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        `Shiprocket authentication failed (${response.status}).`,
      ),
    );
  }

  const token =
    asString(
      asObject(payload).token,
    );

  if (!token) {
    throw new Error(
      "Shiprocket auth successful hua lekin token response me nahi mila.",
    );
  }

  /*
   * Shiprocket token longer valid hota hai,
   * but app process memory me conservative
   * 6 hours cache use karega.
   *
   * 401 aaye to automatically new token lega.
   */
  tokenCache = {
    token,

    refreshAfter:
      Date.now() +
      6 * 60 * 60 * 1000,
  };

  return token;
}

/*
 * =====================================
 * GENERIC SHIPROCKET REQUEST
 * =====================================
 */

async function shiprocketRequest(
  path: string,
  init: RequestInit = {},
  retryAuth = true,
): Promise<unknown> {
  const token =
    await getShiprocketToken();

  const response =
    await fetch(
      `${SHIPROCKET_BASE_URL}${path}`,
      {
        ...init,

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

          ...(init.headers ?? {}),
        },

        cache: "no-store",
      },
    );

  /*
   * Token expire ho gaya ho to
   * fresh token lekar ek baar retry.
   */
  if (
    response.status === 401 &&
    retryAuth
  ) {
    tokenCache = null;

    await getShiprocketToken(
      true,
    );

    return shiprocketRequest(
      path,
      init,
      false,
    );
  }

  const payload =
    await readResponse(
      response,
    );

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        `Shiprocket API failed (${response.status}).`,
      ),
    );
  }

  return payload;
}

/*
 * =====================================
 * ORDER DATE
 * =====================================
 */

function formatOrderDate(
  dateValue:
    | Date
    | string
    | number,
): string {
  const date =
    new Date(dateValue);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  const hour =
    String(
      date.getHours(),
    ).padStart(
      2,
      "0",
    );

  const minute =
    String(
      date.getMinutes(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/*
 * =====================================
 * CUSTOMER ADDRESS
 * =====================================
 */

function buildFullAddress(
  order:
    InstanceType<typeof Order>,
): string {
  const address = [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.landmark,
  ]
    .filter(Boolean)
    .join(", ")
    .trim();

  return address.slice(
    0,
    250,
  );
}

/*
 * =====================================
 * SHIPROCKET ITEMS
 * =====================================
 */

function buildShiprocketItems(
  order:
    InstanceType<typeof Order>,
) {
  return order.items.map(
    (item) => {
      const sku = [
        item.productId,
        item.size,
        item.color,
      ]
        .join("-")
        .replace(
          /[^a-zA-Z0-9_-]/g,
          "-",
        )
        .slice(
          0,
          80,
        );

      return {
        name:
          item.name.slice(
            0,
            120,
          ),

        sku,

        units:
          Number(
            item.quantity,
          ),

        selling_price:
          Number(
            item.price,
          ),

        discount: 0,

        tax: 0,
      };
    },
  );
}

/*
 * =====================================
 * PACKAGE DETAILS
 * =====================================
 */

function getPackageDetails(
  order:
    InstanceType<typeof Order>,
) {
  /*
   * Tumhare NEW env names:
   *
   * SHIPROCKET_ITEM_WEIGHT_KG
   * SHIPROCKET_PACKAGE_LENGTH_CM
   * SHIPROCKET_PACKAGE_BREADTH_CM
   * SHIPROCKET_PACKAGE_HEIGHT_CM
   *
   * Old env names bhi compatibility ke
   * liye accept kiye gaye hain.
   */

  const itemWeight =
    getPositiveNumberEnv(
      [
        "SHIPROCKET_ITEM_WEIGHT_KG",
        "SHIPROCKET_DEFAULT_WEIGHT_KG",
      ],
      0.5,
    );

  const length =
    getPositiveNumberEnv(
      [
        "SHIPROCKET_PACKAGE_LENGTH_CM",
        "SHIPROCKET_DEFAULT_LENGTH_CM",
      ],
      30,
    );

  const breadth =
    getPositiveNumberEnv(
      [
        "SHIPROCKET_PACKAGE_BREADTH_CM",
        "SHIPROCKET_DEFAULT_BREADTH_CM",
      ],
      25,
    );

  const height =
    getPositiveNumberEnv(
      [
        "SHIPROCKET_PACKAGE_HEIGHT_CM",
        "SHIPROCKET_DEFAULT_HEIGHT_CM",
      ],
      8,
    );

  /*
   * Order me total kitne scrub units hain.
   */
  const totalUnits =
    order.items.reduce(
      (
        total,
        item,
      ) =>
        total +
        Number(
          item.quantity,
        ),
      0,
    );

  /*
   * Example:
   *
   * 1 scrub × 0.5kg = 0.5kg
   * 2 scrubs × 0.5kg = 1kg
   * 3 scrubs × 0.5kg = 1.5kg
   *
   * Minimum 0.5kg fallback.
   */
  const calculatedWeight =
    Math.max(
      0.5,
      itemWeight *
        Math.max(
          totalUnits,
          1,
        ),
    );

  const weight =
    Math.round(
      calculatedWeight *
        100,
    ) / 100;

  return {
    length,
    breadth,
    height,
    weight,
  };
}

/*
 * =====================================
 * CREATE ORDER IN SHIPROCKET
 * =====================================
 */

export async function syncOrderToShiprocket(
  order:
    InstanceType<typeof Order>,
) {
  /*
   * Already Shiprocket me create ho chuka
   * ho to duplicate order mat create karo.
   */
  if (
    order.shiprocketOrderId &&
    order.shiprocketShipmentId
  ) {
    return {
      orderId:
        order.shiprocketOrderId,

      shipmentId:
        order.shiprocketShipmentId,

      awbCode:
        order.awbCode ||
        "",

      courierName:
        order.courierName ||
        "",
    };
  }

  const pickupLocation =
    getRequiredEnv(
      "SHIPROCKET_PICKUP_LOCATION",
    );

  /*
   * NEW env first.
   *
   * Old env:
   * SHIPROCKET_FALLBACK_CUSTOMER_EMAIL
   *
   * bhi support hoga.
   */
  const fallbackEmail =
    getFirstEnv([
      "SHIPROCKET_FALLBACK_EMAIL",
      "SHIPROCKET_FALLBACK_CUSTOMER_EMAIL",
    ]) ||
    "contact@krinay.in";

  const {
    length,
    breadth,
    height,
    weight,
  } =
    getPackageDetails(
      order,
    );

  const customerEmail =
    order.customer.email?.trim() ||
    fallbackEmail;

  const payload =
    await shiprocketRequest(
      "/orders/create/adhoc",
      {
        method: "POST",

        body:
          JSON.stringify({
            /*
             * KRINAY order number
             */
            order_id:
              order.orderNumber,

            order_date:
              formatOrderDate(
                order.createdAt ??
                  new Date(),
              ),

            /*
             * Exact Shiprocket pickup
             * location name.
             */
            pickup_location:
              pickupLocation,

            /*
             * CUSTOMER
             */
            billing_customer_name:
              order.customer
                .fullName,

            billing_last_name:
              "",

            billing_address:
              buildFullAddress(
                order,
              ),

            billing_address_2:
              "",

            billing_city:
              order.customer
                .city,

            billing_pincode:
              Number(
                order.customer
                  .pinCode,
              ),

            billing_state:
              order.customer
                .state,

            billing_country:
              order.customer
                .country ||
              "India",

            billing_email:
              customerEmail,

            billing_phone:
              order.customer
                .phone,

            /*
             * Shipping address same as billing.
             */
            shipping_is_billing:
              true,

            /*
             * PRODUCTS
             */
            order_items:
              buildShiprocketItems(
                order,
              ),

            /*
             * PAYMENT
             */
            payment_method:
              order.paymentMethod ===
              "cod"
                ? "COD"
                : "Prepaid",

            shipping_charges:
              Number(
                order.pricing
                  .shippingCharge,
              ),

            giftwrap_charges:
              0,

            transaction_charges:
              0,

            total_discount:
              Number(
                order.pricing
                  .discount,
              ),

            /*
             * Shiprocket sub_total
             * server pricing se.
             */
            sub_total:
              Math.max(
                Number(
                  order.pricing
                    .subtotal,
                ) -
                  Number(
                    order.pricing
                      .discount,
                  ),
                0,
              ),

            /*
             * PACKED PARCEL
             */
            length,
            breadth,
            height,
            weight,
          }),
      },
    );

  const result =
    asObject(
      payload,
    );

  const shiprocketOrderId =
    asString(
      result.order_id,
    );

  const shiprocketShipmentId =
    asString(
      result.shipment_id,
    );

  if (
    !shiprocketOrderId ||
    !shiprocketShipmentId
  ) {
    throw new Error(
      "Shiprocket order create hua lekin order_id / shipment_id response me nahi mila.",
    );
  }

  /*
   * Save Shiprocket IDs in MongoDB.
   */
  order.shiprocketOrderId =
    shiprocketOrderId;

  order.shiprocketShipmentId =
    shiprocketShipmentId;

  /*
   * Usually AWB/courier abhi nahi milega
   * because hum AWB auto assign nahi kar rahe.
   */
  const awbCode =
    asString(
      result.awb_code,
    );

  const courierName =
    asString(
      result.courier_name ??
        result.courier_company_name,
    );

  if (awbCode) {
    order.awbCode =
      awbCode;
  }

  if (courierName) {
    order.courierName =
      courierName;
  }

  /*
   * =====================================
   * VERY IMPORTANT
   * =====================================
   *
   * Hum yahan:
   *
   * /courier/assign/awb
   *
   * call NAHI kar rahe.
   *
   * Aur:
   *
   * /courier/generate/pickup
   *
   * bhi call NAHI kar rahe.
   *
   * Therefore:
   *
   * Customer order
   * → Shiprocket panel me order create
   * → STOP
   *
   * Courier selection
   * → manual
   *
   * AWB
   * → manual
   *
   * Pickup scheduling
   * → manual
   */
  await order.save();

  return {
    orderId:
      shiprocketOrderId,

    shipmentId:
      shiprocketShipmentId,

    awbCode:
      order.awbCode ||
      "",

    courierName:
      order.courierName ||
      "",
  };
}

/*
 * =====================================
 * TRACKING BY SHIPMENT ID
 * =====================================
 */

export async function getShiprocketTrackingByShipmentId(
  shipmentId:
    | string
    | number,
) {
  const cleanId =
    String(
      shipmentId,
    ).trim();

  if (!cleanId) {
    throw new Error(
      "Shiprocket shipment id missing hai.",
    );
  }

  return shiprocketRequest(
    `/courier/track/shipment/${encodeURIComponent(
      cleanId,
    )}`,
    {
      method: "GET",
    },
  );
}

/*
 * =====================================
 * TRACKING BY AWB
 * =====================================
 */

export async function getShiprocketTrackingByAwb(
  awbCode: string,
) {
  const cleanAwb =
    awbCode.trim();

  if (!cleanAwb) {
    throw new Error(
      "AWB code missing hai.",
    );
  }

  return shiprocketRequest(
    `/courier/track/awb/${encodeURIComponent(
      cleanAwb,
    )}`,
    {
      method: "GET",
    },
  );
}

/*
 * =====================================
 * SHIPMENT DETAILS
 * =====================================
 */

export async function getShiprocketShipmentDetails(
  shipmentId:
    | string
    | number,
) {
  const cleanId =
    String(
      shipmentId,
    ).trim();

  if (!cleanId) {
    throw new Error(
      "Shiprocket shipment id missing hai.",
    );
  }

  return shiprocketRequest(
    `/shipments/${encodeURIComponent(
      cleanId,
    )}`,
    {
      method: "GET",
    },
  );
}