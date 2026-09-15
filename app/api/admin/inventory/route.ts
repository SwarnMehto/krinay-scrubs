import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanStock(
  value: unknown,
) {
  const number =
    Number(value);

  if (
    !Number.isInteger(number) ||
    number < 0
  ) {
    return null;
  }

  return number;
}

export async function GET() {
  try {
    await connectDatabase();

    const inventory =
      await Inventory.find({})
        .sort({
          gender: 1,
          color: 1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error(
      "[ADMIN_INVENTORY_GET_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load inventory.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const productId =
      String(
        body.productId ?? "",
      ).trim();

    const color =
      String(
        body.color ?? "",
      ).trim();

    const part =
      body.part === "top" ||
      body.part === "bottom"
        ? body.part
        : "";

    const size =
      String(
        body.size ?? "",
      ).trim();

    const stock =
      cleanStock(
        body.stock,
      );

    if (
      !productId ||
      !color ||
      !part ||
      !size ||
      stock === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid inventory update.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    const field =
      part === "top"
        ? "topStock"
        : "bottomStock";

    const inventory =
      await Inventory.findOne({
        productId,
        color,
      });

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Inventory record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const entries =
      inventory[field];

    const entry =
      entries.find(
        (current) =>
          current.size ===
          size,
      );

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Size not found.",
        },
        {
          status: 404,
        },
      );
    }

    entry.stock =
      stock;

    await inventory.save();

    return NextResponse.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error(
      "[ADMIN_INVENTORY_PATCH_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update inventory.",
      },
      {
        status: 500,
      },
    );
  }
}