import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { products } from "@/data/products";
import type {
  CreateOrderInput,
  OrderItemInput,
} from "@/types/order";

export const runtime = "nodejs";

function createOrderNumber() {
  const date = new Date();

  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `KRN${year}${month}${day}${randomNumber}`;
}

function validateCustomer(customer: CreateOrderInput["customer"]) {
  if (!customer) {
    return "Customer information is required.";
  }

  if (!customer.fullName || customer.fullName.trim().length < 3) {
    return "Valid full name is required.";
  }

  if (!/^[6-9]\d{9}$/.test(customer.phone?.trim() ?? "")) {
    return "Valid 10-digit mobile number is required.";
  }

  if (
    customer.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())
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

  if (!/^\d{6}$/.test(customer.pinCode?.trim() ?? "")) {
    return "Valid 6-digit PIN code is required.";
  }

  return null;
}

function prepareOrderItems(items: OrderItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  return items.map((requestedItem) => {
    const product = products.find(
      (currentProduct) =>
        currentProduct.id === requestedItem.productId,
    );

    if (!product) {
      throw new Error(
        `${requestedItem.name || "A product"} is no longer available.`,
      );
    }

    if (!product.inStock || product.stock <= 0) {
      throw new Error(`${product.name} is out of stock.`);
    }

    if (!product.sizes.includes(requestedItem.size)) {
      throw new Error(
        `Invalid size selected for ${product.name}.`,
      );
    }

    if (!product.colors.includes(requestedItem.color)) {
      throw new Error(
        `Invalid colour selected for ${product.name}.`,
      );
    }

    const quantity = Number(requestedItem.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > product.stock
    ) {
      throw new Error(
        `Invalid quantity selected for ${product.name}.`,
      );
    }

    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      size: requestedItem.size,
      color: requestedItem.color,
      quantity,
    };
  });
}

function calculatePricing(
  items: ReturnType<typeof prepareOrderItems>,
  couponCode?: string,
) {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const normalizedCoupon = couponCode?.trim().toUpperCase() ?? "";

  const discount =
    normalizedCoupon === "WELCOME10"
      ? Math.round(subtotal * 0.1)
      : 0;

  const discountedSubtotal = Math.max(subtotal - discount, 0);

  const shippingCharge =
    discountedSubtotal === 0 || discountedSubtotal >= 999 ? 0 : 99;

  const gstIncluded = Math.round(
    (discountedSubtotal * 12) / 112,
  );

  const total = discountedSubtotal + shippingCharge;

  return {
    subtotal,
    discount,
    shippingCharge,
    gstIncluded,
    total,
    couponCode: discount > 0 ? normalizedCoupon : "",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderInput;

    const customerError = validateCustomer(body.customer);

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
      body.paymentMethod !== "prepaid" &&
      body.paymentMethod !== "cod"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        {
          status: 400,
        },
      );
    }

    const preparedItems = prepareOrderItems(body.items);

    const pricing = calculatePricing(
      preparedItems,
      body.couponCode,
    );

    await connectDatabase();

    let orderNumber = createOrderNumber();

    while (await Order.exists({ orderNumber })) {
      orderNumber = createOrderNumber();
    }

    const order = await Order.create({
      orderNumber,

      customer: {
        fullName: body.customer.fullName.trim(),
        phone: body.customer.phone.trim(),
        email: body.customer.email?.trim().toLowerCase() ?? "",
        addressLine1: body.customer.addressLine1.trim(),
        addressLine2: body.customer.addressLine2?.trim() ?? "",
        landmark: body.customer.landmark?.trim() ?? "",
        city: body.customer.city.trim(),
        state: body.customer.state.trim(),
        pinCode: body.customer.pinCode.trim(),
        country: "India",
      },

      items: preparedItems,

      pricing: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shippingCharge: pricing.shippingCharge,
        gstIncluded: pricing.gstIncluded,
        total: pricing.total,
      },

      couponCode: pricing.couponCode,

      paymentMethod: body.paymentMethod,

      paymentStatus:
        body.paymentMethod === "cod"
          ? "cod_pending"
          : "pending",

      orderStatus: "pending",

      shipmentApprovalStatus: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          shipmentApprovalStatus:
            order.shipmentApprovalStatus,
          pricing: order.pricing,
          createdAt: order.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create order error:", error);

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