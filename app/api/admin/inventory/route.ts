import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/require-admin";
import Inventory from "@/models/Inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * =========================================================
 * CLEAN STOCK VALUE
 * =========================================================
 */
function cleanStock(value: unknown) {
  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 0
  ) {
    return null;
  }

  return number;
}

/*
 * =========================================================
 * GET ADMIN INVENTORY
 * =========================================================
 */
export async function GET() {
  try {
    /*
     * -----------------------------------------------------
     * ADMIN AUTHENTICATION
     * -----------------------------------------------------
     */
    const auth = await requireAdmin();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * -----------------------------------------------------
     * DATABASE
     * -----------------------------------------------------
     */
    await connectDatabase();

    const inventory =
      await Inventory.find({})
        .sort({
          gender: 1,
          color: 1,
        })
        .lean();

    return NextResponse.json(
      {
        success: true,
        inventory,
      },
      {
        status: 200,
      },
    );
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

/*
 * =========================================================
 * UPDATE ADMIN INVENTORY
 * =========================================================
 */
export async function PATCH(
  request: Request,
) {
  try {
    /*
     * -----------------------------------------------------
     * ADMIN AUTHENTICATION
     * -----------------------------------------------------
     */
    const auth = await requireAdmin();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * -----------------------------------------------------
     * REQUEST BODY
     * -----------------------------------------------------
     */
    const body = await request.json();

    const productId = String(
      body.productId ?? "",
    ).trim();

    const color = String(
      body.color ?? "",
    ).trim();

    const part =
      body.part === "top" ||
      body.part === "bottom"
        ? body.part
        : "";

    const size = String(
      body.size ?? "",
    ).trim();

    const stock = cleanStock(
      body.stock,
    );

    /*
     * -----------------------------------------------------
     * VALIDATION
     * -----------------------------------------------------
     */
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

    /*
     * -----------------------------------------------------
     * DATABASE
     * -----------------------------------------------------
     */
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

    /*
     * -----------------------------------------------------
     * FIND SIZE
     * -----------------------------------------------------
     */
    const entries =
      inventory[field];

    const entry =
      entries.find(
        (current) =>
          current.size === size,
      );

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Size not found in inventory.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * -----------------------------------------------------
     * UPDATE STOCK
     * -----------------------------------------------------
     */
    entry.stock = stock;

    await inventory.save();

    console.log(
      "[ADMIN_INVENTORY_UPDATED]",
      {
        admin:
          auth.session.email,

        productId,
        color,
        part,
        size,
        stock,
      },
    );

    /*
     * -----------------------------------------------------
     * SUCCESS
     * -----------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,

        message:
          "Inventory updated successfully.",

        inventory,
      },
      {
        status: 200,
      },
    );
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