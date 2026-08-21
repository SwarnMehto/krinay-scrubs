import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export const runtime = "nodejs";

type InvoiceDisplayLine = {
  id: string;
  name: string;
  description: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image: string;
  type:
    | "top"
    | "bottom"
    | "product"
    | "embroidery";
};

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function createInvoiceLines(
  items: Array<Record<string, any>>,
): InvoiceDisplayLine[] {
  const lines: InvoiceDisplayLine[] = [];

  items.forEach((item, itemIndex) => {
    const quantity =
      Number(item.quantity) || 1;

    const basePrice =
      Number(item.basePrice) ||
      Number(item.price) ||
      0;

    /*
     * Complete Set:
     *
     * ₹1,444 =>
     * Top ₹722
     * Bottom ₹722
     */
    if (item.purchaseType === "set") {
      const topUnitPrice =
        Math.floor(basePrice / 2);

      const bottomUnitPrice =
        basePrice - topUnitPrice;

      lines.push({
        id: `${itemIndex}-top`,

        name: `${item.name} - Top`,

        description:
          "Scrub Top",

        size:
          item.topSize || "",

        color:
          item.color || "",

        quantity,

        unitPrice:
          topUnitPrice,

        total:
          topUnitPrice *
          quantity,

        image:
          item.image || "",

        type: "top",
      });

      lines.push({
        id: `${itemIndex}-bottom`,

        name: `${item.name} - Bottom`,

        description:
          "Scrub Bottom",

        size:
          item.bottomSize || "",

        color:
          item.color || "",

        quantity,

        unitPrice:
          bottomUnitPrice,

        total:
          bottomUnitPrice *
          quantity,

        image:
          item.image || "",

        type: "bottom",
      });
    } else {
      const type =
        item.purchaseType === "top"
          ? "top"
          : item.purchaseType === "bottom"
            ? "bottom"
            : "product";

      lines.push({
        id: `${itemIndex}-product`,

        name:
          item.name || "Krinay Product",

        description:
          type === "top"
            ? "Scrub Top"
            : type === "bottom"
              ? "Scrub Bottom"
              : "Product",

        size:
          item.size || "",

        color:
          item.color || "",

        quantity,

        unitPrice:
          basePrice,

        total:
          basePrice * quantity,

        image:
          item.image || "",

        type,
      });
    }

    /*
     * Embroidery product price me included hoti hai,
     * invoice clarity ke liye separate line show karenge.
     */
    if (
      item.embroidery?.enabled &&
      Number(item.embroidery.price) > 0
    ) {
      const embroideryPrice =
        Number(
          item.embroidery.price,
        );

      const text = [
        item.embroidery.line1,
        item.embroidery.line2,
        item.embroidery.selectedIconLabel,
      ]
        .filter(Boolean)
        .join(" · ");

      lines.push({
        id: `${itemIndex}-embroidery`,

        name:
          "Custom Embroidery",

        description:
          text ||
          `${item.embroidery.mode} embroidery`,

        size: "",

        color:
          item.embroidery.textColor ||
          "",

        quantity,

        unitPrice:
          embroideryPrice,

        total:
          embroideryPrice *
          quantity,

        image: "",

        type:
          "embroidery",
      });
    }
  });

  return lines;
}

export async function GET(
  request: Request,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const orderNumber =
      searchParams
        .get("orderNumber")
        ?.trim();

    const token =
      searchParams
        .get("token")
        ?.trim();

    if (!orderNumber || !token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice access information missing hai.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    const order =
      await Order.findOne({
        orderNumber,
        invoiceAccessToken:
          token,
      })
        .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice nahi mila ya access link invalid hai.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Pending prepaid order ke invoice ko paid
     * tax invoice nahi bolenge.
     */
    const paymentLabel =
      order.paymentMethod ===
        "cod"
        ? order.paymentStatus ===
          "cod_pending"
          ? "Cash on Delivery - Payment Pending"
          : String(
              order.paymentStatus,
            ).toUpperCase()
        : order.paymentStatus ===
            "paid"
          ? "Paid"
          : "Payment Pending";

    const items =
      createInvoiceLines(
        order.items as unknown as Array<
          Record<string, any>
        >,
      );

    const gstIncluded =
      Number(
        order.pricing
          .gstIncluded,
      ) || 0;

    const customerState =
      String(
        order.customer.state ||
          "",
      )
        .trim()
        .toLowerCase();

    const sellerState =
      (
        process.env
          .KRINAY_STATE ||
        "Delhi"
      )
        .trim()
        .toLowerCase();

    const isIntraState =
      customerState ===
      sellerState;

    const cgst =
      isIntraState
        ? roundMoney(
            gstIncluded / 2,
          )
        : 0;

    const sgst =
      isIntraState
        ? roundMoney(
            gstIncluded - cgst,
          )
        : 0;

    const igst =
      isIntraState
        ? 0
        : roundMoney(
            gstIncluded,
          );

    /*
     * GST prices me included hai.
     */
    const taxableValue =
      roundMoney(
        Math.max(
          Number(
            order.pricing
              .subtotal,
          ) -
            Number(
              order.pricing
                .discount,
            ) -
            gstIncluded,
          0,
        ),
      );

    return NextResponse.json({
      success: true,

      invoice: {
        invoiceNumber:
          `INV-${order.orderNumber}`,

        orderNumber:
          order.orderNumber,

        createdAt:
          order.createdAt,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        paymentLabel,

        razorpayPaymentId:
          order.razorpayPaymentId ||
          "",

        orderStatus:
          order.orderStatus,

        seller: {
          name:
            process.env
              .KRINAY_LEGAL_NAME ||
            "Krinay",

          brand:
            "KRINAY SCRUBS",

          gstin:
            process.env
              .KRINAY_GSTIN ||
            "",

          address:
            process.env
              .KRINAY_INVOICE_ADDRESS ||
            "",

          state:
            process.env
              .KRINAY_STATE ||
            "Delhi",

          stateCode:
            process.env
              .KRINAY_STATE_CODE ||
            "07",

          hsn:
            process.env
              .KRINAY_SCRUB_HSN ||
            "",
        },

        customer: {
          fullName:
            order.customer.fullName,

          phone:
            order.customer.phone,

          email:
            order.customer.email ||
            "",

          addressLine1:
            order.customer
              .addressLine1,

          addressLine2:
            order.customer
              .addressLine2 ||
            "",

          landmark:
            order.customer
              .landmark ||
            "",

          city:
            order.customer.city,

          state:
            order.customer.state,

          pinCode:
            order.customer
              .pinCode,

          country:
            order.customer
              .country ||
            "India",
        },

        items,

        pricing: {
          subtotal:
            Number(
              order.pricing
                .subtotal,
            ),

          discount:
            Number(
              order.pricing
                .discount,
            ),

          taxableValue,

          shippingCharge:
            Number(
              order.pricing
                .shippingCharge,
            ),

          gstRate: 5,

          gstIncluded,

          cgst,

          sgst,

          igst,

          total:
            Number(
              order.pricing.total,
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Invoice API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Invoice load nahi ho paya.",
      },
      {
        status: 500,
      },
    );
  }
}