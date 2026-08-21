import crypto from "crypto";
import { NextResponse } from "next/server";

import { products } from "@/data/products";
import { connectDatabase } from "@/lib/mongodb";
import { getAuthenticatedUserOrNull } from "@/lib/auth/account";
import { safelyNotifyConfirmedOrder } from "@/lib/order-notifications";
import { syncOrderToShiprocket } from "@/lib/shiprocket";
import Order from "@/models/Order";

import type {
  CreateOrderInput,
  OrderItemInput,
} from "@/types/order";

export const runtime = "nodejs";

function createOrderNumber() {
  const date = new Date();

  const year = date
    .getFullYear()
    .toString()
    .slice(-2);

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000,
  );

  return `KRN${year}${month}${day}${randomNumber}`;
}

function validateCustomer(
  customer: CreateOrderInput["customer"],
) {
  if (!customer) {
    return "Customer information is required.";
  }

  if (
    !customer.fullName ||
    customer.fullName.trim().length < 3
  ) {
    return "Valid full name is required.";
  }

  if (
    !/^[6-9]\d{9}$/.test(
      customer.phone?.trim() ?? "",
    )
  ) {
    return "Valid 10-digit mobile number is required.";
  }

  if (
    customer.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      customer.email.trim(),
    )
  ) {
    return "Valid email address is required.";
  }

  if (
    !customer.addressLine1 ||
    customer.addressLine1.trim().length < 8
  ) {
    return "Complete shipping address is required.";
  }

  if (!customer.city?.trim()) {
    return "City is required.";
  }

  if (!customer.state?.trim()) {
    return "State is required.";
  }

  if (
    !/^\d{6}$/.test(
      customer.pinCode?.trim() ?? "",
    )
  ) {
    return "Valid 6-digit PIN code is required.";
  }

  return null;
}

const ALLOWED_EMBROIDERY_MODES = new Set([
  "bundle",
  "top",
  "bottom",
]);

const ALLOWED_EMBROIDERY_FONTS = new Set([
  "block",
  "script",
]);

const ALLOWED_EMBROIDERY_COLOURS = new Set([
  "white",
  "black",
  "gold",
  "grey",
  "lime",
  "pink",
]);

function prepareEmbroidery(
  requestedItem: OrderItemInput,
) {
  const input = requestedItem.embroidery;

  if (!input?.enabled) {
    return undefined;
  }

  const mode = ALLOWED_EMBROIDERY_MODES.has(input.mode)
    ? input.mode
    : "top";

  const font = ALLOWED_EMBROIDERY_FONTS.has(input.font)
    ? input.font
    : "block";

  const textColor = ALLOWED_EMBROIDERY_COLOURS.has(
    input.textColor,
  )
    ? input.textColor
    : "white";

  const line1 = String(input.line1 ?? "")
    .trim()
    .slice(0, 22);

  const line2 = String(input.line2 ?? "")
    .trim()
    .slice(0, 22);

  const selectedIconId = String(
    input.selectedIconId ?? "",
  )
    .trim()
    .slice(0, 80);

  const selectedIconLabel = String(
    input.selectedIconLabel ?? "",
  )
    .trim()
    .slice(0, 100);

  const selectedIconSymbol = String(
    input.selectedIconSymbol ?? "",
  )
    .trim()
    .slice(0, 20);

  const fileName = String(input.fileName ?? "")
    .trim()
    .slice(0, 180);

  const fileUrl = String(input.fileUrl ?? "")
    .trim()
    .slice(0, 1000);

  const publicId = String(input.publicId ?? "")
    .trim()
    .slice(0, 300);

  const hasLogo = Boolean(
    selectedIconId || fileUrl,
  );

  if (!line1 && !hasLogo) {
    throw new Error(
      `${requestedItem.name} embroidery me text, icon ya logo required hai.`,
    );
  }

  const basePrice =
    mode === "bundle"
      ? 399
      : mode === "top"
        ? 199
        : 149;

  const logoPrice =
    mode === "bundle" ? 0 : hasLogo ? 250 : 0;

  const addBottomName =
    mode === "top" &&
    Boolean(input.addBottomName);

  const bottomNamePrice =
    addBottomName ? 99 : 0;

  const price =
    basePrice +
    logoPrice +
    bottomNamePrice;

  return {
    enabled: true as const,
    mode,
    placement:
      mode === "bottom"
        ? ("bottom" as const)
        : ("top" as const),
    line1,
    line2,
    font,
    textColor,
    addBottomName,
    selectedIconId,
    selectedIconLabel,
    selectedIconSymbol,
    fileName,
    fileUrl,
    publicId,
    basePrice,
    logoPrice,
    bottomNamePrice,
    price,
    type: hasLogo
      ? ("logo" as const)
      : ("name" as const),
    instructions: String(
      input.instructions ?? "",
    )
      .trim()
      .slice(0, 500),
  };
}

function prepareOrderItems(
  items: OrderItemInput[],
) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error("Cart is empty.");
  }

  return items.map((requestedItem) => {
    const product = products.find(
      (currentProduct) =>
        currentProduct.id ===
        requestedItem.productId,
    );

    if (!product) {
      throw new Error(
        `${
          requestedItem.name || "A product"
        } is no longer available.`,
      );
    }

    if (
      !product.inStock ||
      product.stock <= 0
    ) {
      throw new Error(
        `${product.name} is out of stock.`,
      );
    }

    const requestedColor =
      String(
        requestedItem.color ?? "",
      ).trim();

    if (
      !product.colors.includes(
        requestedColor,
      )
    ) {
      throw new Error(
        `Invalid colour selected for ${product.name}.`,
      );
    }

    const quantity = Number(
      requestedItem.quantity,
    );

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > product.stock
    ) {
      throw new Error(
        `Invalid quantity selected for ${product.name}.`,
      );
    }

    const embroidery =
      prepareEmbroidery(requestedItem);

    /*
     * Products with purchaseOptions=true support:
     * - Complete set
     * - Top only
     * - Bottom only
     *
     * All other products continue through the old single-size flow.
     */
    if (product.purchaseOptions) {
      const purchaseType =
        requestedItem.purchaseType === "top" ||
        requestedItem.purchaseType === "bottom" ||
        requestedItem.purchaseType === "set"
          ? requestedItem.purchaseType
          : "set";

      const topSizes =
        product.topSizes?.length
          ? product.topSizes
          : product.sizes;

      const bottomSizes =
        product.bottomSizes?.length
          ? product.bottomSizes
          : product.sizes;

      const topSize =
        String(
          requestedItem.topSize ?? "",
        ).trim();

      const bottomSize =
        String(
          requestedItem.bottomSize ?? "",
        ).trim();

      if (
        (purchaseType === "set" ||
          purchaseType === "top") &&
        !topSizes.includes(topSize)
      ) {
        throw new Error(
          `Invalid top size selected for ${product.name}.`,
        );
      }

      if (
        (purchaseType === "set" ||
          purchaseType === "bottom") &&
        !bottomSizes.includes(
          bottomSize,
        )
      ) {
        throw new Error(
          `Invalid bottom size selected for ${product.name}.`,
        );
      }

      const basePrice =
        purchaseType === "top"
          ? product.topPrice ??
            product.price
          : purchaseType ===
              "bottom"
            ? product.bottomPrice ??
              product.price
            : product.setPrice ??
              product.price;

      const mrp =
        purchaseType === "top"
          ? product.topOriginalPrice ??
            product.originalPrice ??
            basePrice
          : purchaseType ===
              "bottom"
            ? product.bottomOriginalPrice ??
              product.originalPrice ??
              basePrice
            : product.setOriginalPrice ??
              product.originalPrice ??
              basePrice;

      const discountPercent =
        product.discountPercent ??
        (mrp > basePrice
          ? Math.round(
              ((mrp - basePrice) /
                mrp) *
                100,
            )
          : 0);

      const discountAmount =
        Math.max(
          mrp - basePrice,
          0,
        );

      const finalUnitPrice =
        basePrice +
        (embroidery?.price ?? 0);

      const size =
        purchaseType === "set"
          ? `Top ${topSize} / Bottom ${bottomSize}`
          : purchaseType === "top"
            ? topSize
            : bottomSize;

      const name =
        purchaseType === "top"
          ? `${product.name} - Top`
          : purchaseType ===
              "bottom"
            ? `${product.name} - Bottom`
            : product.name;

      /*
       * Use only an image that belongs to the selected colour gallery.
       * This prevents arbitrary external image URLs being stored in orders.
       */
      const allowedImages =
        product.colorImages?.[
          requestedColor
        ] ??
        product.images ??
        [product.image];

      const requestedImage =
        String(
          requestedItem.image ?? "",
        ).trim();

      const safeImage =
        requestedImage &&
        allowedImages.includes(
          requestedImage,
        )
          ? requestedImage
          : allowedImages[0] ??
            product.image;

      return {
        productId: product.id,
        name,
        slug: product.slug,
        image: safeImage,

        basePrice,
        price: finalUnitPrice,

        mrp,
        discountPercent,
        discountAmount,

        purchaseType,
        topSize:
          purchaseType ===
          "bottom"
            ? ""
            : topSize,
        bottomSize:
          purchaseType === "top"
            ? ""
            : bottomSize,

        size,
        color: requestedColor,
        quantity,

        cartKey:
          requestedItem.cartKey
            ?.trim() ?? "",

        embroidery,
      };
    }

    /*
     * Backward-compatible old product flow.
     */
    const requestedSize =
      String(
        requestedItem.size ?? "",
      ).trim();

    if (
      !product.sizes.includes(
        requestedSize,
      )
    ) {
      throw new Error(
        `Invalid size selected for ${product.name}.`,
      );
    }

    const basePrice =
      product.price;

    const mrp =
      product.originalPrice ??
      basePrice;

    const discountPercent =
      mrp > basePrice
        ? Math.round(
            ((mrp - basePrice) /
              mrp) *
              100,
          )
        : 0;

    const discountAmount =
      Math.max(
        mrp - basePrice,
        0,
      );

    const finalUnitPrice =
      basePrice +
      (embroidery?.price ?? 0);

    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,

      basePrice,
      price: finalUnitPrice,

      mrp,
      discountPercent,
      discountAmount,

      purchaseType: "",
      topSize: "",
      bottomSize: "",

      size: requestedSize,
      color: requestedColor,
      quantity,

      cartKey:
        requestedItem.cartKey
          ?.trim() ?? "",

      embroidery,
    };
  });
}

function calculatePricing(
  items: ReturnType<
    typeof prepareOrderItems
  >,
  couponCode?: string,
) {
  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0,
  );

  const normalizedCoupon =
    couponCode
      ?.trim()
      .toUpperCase() ?? "";

  const discount =
    normalizedCoupon === "WELCOME10"
      ? Math.round(subtotal * 0.1)
      : 0;

  const discountedSubtotal =
    Math.max(
      subtotal - discount,
      0,
    );

  const shippingCharge =
    discountedSubtotal === 0 ||
    discountedSubtotal >= 999
      ? 0
      : 99;

  /*
   * Prices GST inclusive hain.
   */
  const gstIncluded = Math.round(
  (discountedSubtotal * 5) / 105,
);

  const total =
    discountedSubtotal +
    shippingCharge;

  return {
    subtotal,
    discount,
    shippingCharge,
    gstIncluded,
    total,

    couponCode:
      discount > 0
        ? normalizedCoupon
        : "",
  };
}

function isShiprocketOrderSynced(order: {
  get: (path: string) => unknown;
}) {
  return Boolean(
    order.get("shiprocketOrderId") &&
      order.get("shiprocketShipmentId"),
  );
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as CreateOrderInput;

    const customerError =
      validateCustomer(body.customer);

    if (customerError) {
      return NextResponse.json(
        {
          success: false,
          message: customerError,
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.paymentMethod !==
        "prepaid" &&
      body.paymentMethod !== "cod"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment method.",
        },
        {
          status: 400,
        },
      );
    }

    const preparedItems =
      prepareOrderItems(body.items);

    const pricing = calculatePricing(
      preparedItems,
      body.couponCode,
    );

    await connectDatabase();

    /*
     * Login optional hai. Session mile to order account se link hoga,
     * otherwise guest checkout bilkul same tarah work karega.
     */
    const authUser = await getAuthenticatedUserOrNull();

    let orderNumber =
      createOrderNumber();

    while (
      await Order.exists({
        orderNumber,
      })
    ) {
      orderNumber =
        createOrderNumber();
    }

    const isCodOrder =
      body.paymentMethod === "cod";

      const invoiceAccessToken =
  crypto.randomBytes(32).toString("hex");

    /*
     * COD order immediately confirmed ho sakta hai.
     * Prepaid order payment verification tak pending rahega.
     */
    const order = await Order.create({
  orderNumber,

  invoiceAccessToken,

      userId: authUser?._id ?? null,

      customer: {
        fullName:
          body.customer.fullName.trim(),

        phone:
          body.customer.phone.trim(),

        email:
          body.customer.email
            ?.trim()
            .toLowerCase() ?? "",

        addressLine1:
          body.customer.addressLine1.trim(),

        addressLine2:
          body.customer.addressLine2
            ?.trim() ?? "",

        landmark:
          body.customer.landmark
            ?.trim() ?? "",

        city:
          body.customer.city.trim(),

        state:
          body.customer.state.trim(),

        pinCode:
          body.customer.pinCode.trim(),

        country: "India",
      },

      items: preparedItems,

      pricing: {
        subtotal:
          pricing.subtotal,

        discount:
          pricing.discount,

        shippingCharge:
          pricing.shippingCharge,

        gstIncluded:
          pricing.gstIncluded,

        total:
          pricing.total,
      },

      couponCode:
        pricing.couponCode,

      paymentMethod:
        body.paymentMethod,

      paymentStatus: isCodOrder
        ? "cod_pending"
        : "pending",

      orderStatus: isCodOrder
        ? "confirmed"
        : "pending",

      /*
       * Shiprocket order create ho sakta hai,
       * lekin courier, AWB aur pickup manual rahenge.
       */
      shipmentApprovalStatus:
        "pending",

      shiprocketOrderId: "",
      shiprocketShipmentId: "",

      courierName: "",
      awbCode: "",
      trackingUrl: "",
    });

    let shiprocketSynced = false;
    let shiprocketError = "";

    /*
     * COD order ko immediately Shiprocket panel me
     * create kar do.
     *
     * Prepaid order yahan sync nahi hoga. Payment
     * verification route successful hone ke baad
     * Shiprocket par create hoga.
     */
    if (isCodOrder) {
      try {
        await syncOrderToShiprocket(
          order,
        );

        shiprocketSynced =
          isShiprocketOrderSynced(
            order,
          );
      } catch (error) {
        shiprocketError =
          error instanceof Error
            ? error.message
            : "Shiprocket sync failed.";

        console.error(
          "Shiprocket COD order sync error:",
          error,
        );

        /*
         * Shipping sync fail hone par customer ka COD
         * order cancel nahi hoga. Order MongoDB me
         * confirmed rahega aur sync later retry hoga.
         */
        shiprocketSynced = false;
      }
    }

    /*
     * COD order confirmed hote hi admin WhatsApp +
     * optional customer SMS.
     *
     * Prepaid order ke liye notification payment verify
     * hone ke baad /api/payments/verify se jayegi.
     *
     * Notification failure order ko fail nahi karega.
     */
    const notification =
      isCodOrder
        ? await safelyNotifyConfirmedOrder(
            order,
          )
        : null;

    return NextResponse.json(
      {
        success: true,

        message: isCodOrder
          ? shiprocketSynced
            ? "COD order created and synced to Shiprocket."
            : "COD order created. Shiprocket sync pending."
          : "Order created. Payment pending.",

        order: {
  id: order._id.toString(),

  orderNumber:
    order.orderNumber,

  invoiceAccessToken:
    order.invoiceAccessToken,

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          orderStatus:
            order.orderStatus,

          shipmentApprovalStatus:
            order.shipmentApprovalStatus,

          shiprocketSynced,
          shiprocketError,

          shiprocketOrderId:
            order.get(
              "shiprocketOrderId",
            ) ?? "",

          shiprocketShipmentId:
            order.get(
              "shiprocketShipmentId",
            ) ?? "",

          pricing:
            order.pricing,

          notification,

          createdAt:
            order.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create order error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create order.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,

      message:
        "Public order listing is not allowed. Admin authentication will be added later.",
    },
    {
      status: 403,
    },
  );
}