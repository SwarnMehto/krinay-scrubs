import "server-only";

const SHIPROCKET_BASE_URL =
  "https://apiv2.shiprocket.in/v1/external";

type TokenCache = {
  token: string;
  expiresAt: number;
};

declare global {
  var shiprocketTokenCache:
    | TokenCache
    | undefined;
}

type SyncableOrder = {
  _id: {
    toString(): string;
  };

  orderNumber: string;

  createdAt?: Date;

  customer: {
    fullName: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pinCode: string;
  };

  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
  }>;

  pricing: {
    subtotal: number;
    discount?: number;
    shippingCharge: number;
    total: number;
  };

  paymentMethod: "prepaid" | "cod";
  paymentStatus: string;

  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;

  save(): Promise<unknown>;
};

type ShiprocketOrderResponse = {
  order_id?: string | number;
  shipment_id?: string | number;
  status?: string;
  message?: string;
  errors?: unknown;
};

function requiredEnvironment(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} missing hai in .env.local`,
    );
  }

  return value;
}

async function getShiprocketToken() {
  const cached =
    global.shiprocketTokenCache;

  if (
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached.token;
  }

  const email = requiredEnvironment(
    "SHIPROCKET_API_EMAIL",
  );

  const password = requiredEnvironment(
    "SHIPROCKET_API_PASSWORD",
  );

  const response = await fetch(
    `${SHIPROCKET_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok || !data.token) {
    console.error(
      "Shiprocket authentication error:",
      data,
    );

    throw new Error(
      data.message ||
        "Shiprocket authentication failed.",
    );
  }

  /*
   * Official validity 10 days hai.
   * Safe side par 9 days cache.
   */
  global.shiprocketTokenCache = {
    token: data.token,
    expiresAt:
      Date.now() +
      9 * 24 * 60 * 60 * 1000,
  };

  return data.token as string;
}

function formatOrderDate(
  dateValue?: Date,
) {
  const date = dateValue
    ? new Date(dateValue)
    : new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  const hours = String(
    date.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function splitName(fullName: string) {
  const parts = fullName
    .trim()
    .split(/\s+/);

  const firstName =
    parts.shift() || "Customer";

  return {
    firstName,
    lastName: parts.join(" "),
  };
}

function createSku(
  productId: string,
  size: string,
  color: string,
) {
  return `KRN-${productId}-${size}-${color}`
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .slice(0, 80);
}

export async function syncOrderToShiprocket(
  order: SyncableOrder,
) {
  if (
    order.shiprocketOrderId &&
    order.shiprocketShipmentId
  ) {
    return {
      alreadySynced: true,
      orderId:
        order.shiprocketOrderId,
      shipmentId:
        order.shiprocketShipmentId,
    };
  }

  if (
    order.paymentMethod === "prepaid" &&
    order.paymentStatus !== "paid"
  ) {
    throw new Error(
      "Unpaid prepaid order Shiprocket me sync nahi kiya ja sakta.",
    );
  }

  const token =
    await getShiprocketToken();

  const pickupLocation =
    requiredEnvironment(
      "SHIPROCKET_PICKUP_LOCATION",
    );

  const fallbackEmail =
    requiredEnvironment(
      "SHIPROCKET_FALLBACK_EMAIL",
    );

  const {
    firstName,
    lastName,
  } = splitName(
    order.customer.fullName,
  );

  const totalUnits =
    order.items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  const itemWeight = Number(
    process.env
      .SHIPROCKET_ITEM_WEIGHT_KG ??
      "0.5",
  );

  const weight = Math.max(
    itemWeight * totalUnits,
    0.5,
  );

  const discountedSubtotal =
    Math.max(
      order.pricing.subtotal -
        (order.pricing.discount ?? 0),
      0,
    );

  const secondAddressLine = [
    order.customer.addressLine2,
    order.customer.landmark,
  ]
    .filter(Boolean)
    .join(", ");

  const payload = {
    order_id: order.orderNumber,

    order_date: formatOrderDate(
      order.createdAt,
    ),

    pickup_location:
      pickupLocation,

    billing_customer_name:
      firstName,

    billing_last_name:
      lastName,

    billing_address:
      order.customer.addressLine1,

    billing_address_2:
      secondAddressLine,

    billing_city:
      order.customer.city,

    billing_pincode:
      order.customer.pinCode,

    billing_state:
      order.customer.state,

    billing_country: "India",

    billing_email:
      order.customer.email ||
      fallbackEmail,

    billing_phone:
      order.customer.phone,

    shipping_is_billing: true,

    order_items:
      order.items.map((item) => ({
        name: item.name,

        sku: createSku(
          item.productId,
          item.size,
          item.color,
        ),

        units: item.quantity,

        /*
         * Product unit selling price.
         * Prices already GST inclusive.
         */
        selling_price: item.price,

        tax: 12,

        discount: 0,
      })),

    payment_method:
      order.paymentMethod === "cod"
        ? "COD"
        : "Prepaid",

    shipping_charges:
      order.pricing.shippingCharge,

    giftwrap_charges: 0,
    transaction_charges: 0,

    total_discount:
      order.pricing.discount ?? 0,

    sub_total:
      discountedSubtotal,

    weight,

    length: Number(
      process.env
        .SHIPROCKET_PACKAGE_LENGTH_CM ??
        "30",
    ),

    breadth: Number(
      process.env
        .SHIPROCKET_PACKAGE_BREADTH_CM ??
        "25",
    ),

    height: Number(
      process.env
        .SHIPROCKET_PACKAGE_HEIGHT_CM ??
        "8",
    ),
  };

  const response = await fetch(
    `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify(payload),

      cache: "no-store",
    },
  );

  const result =
    (await response.json()) as ShiprocketOrderResponse;

  if (
    !response.ok ||
    !result.order_id ||
    !result.shipment_id
  ) {
    console.error(
      "Shiprocket create order error:",
      result,
    );

    throw new Error(
      result.message ||
        `Shiprocket order create failed: ${JSON.stringify(
          result.errors ?? result,
        )}`,
    );
  }

  order.shiprocketOrderId =
    String(result.order_id);

  order.shiprocketShipmentId =
    String(result.shipment_id);

  await order.save();

  return {
    alreadySynced: false,
    orderId:
      String(result.order_id),

    shipmentId:
      String(result.shipment_id),
  };
}