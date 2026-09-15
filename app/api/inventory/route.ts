import { NextResponse } from "next/server";

import { products } from "@/data/products";
import { connectDatabase } from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      "[INVENTORY_GET_ERROR]",
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
 * Creates missing inventory records.
 *
 * Existing inventory is NEVER overwritten,
 * therefore running this again is safe.
 */
export async function POST() {
  try {
    await connectDatabase();

    const liveScrubs =
      products.filter(
        (product) =>
          product.productType ===
            "scrub" &&
          product.inStock &&
          (
            product.gender ===
              "Men" ||
            product.gender ===
              "Women"
          ),
      );

    let created = 0;

    for (const product of liveScrubs) {
      /*
       * Each live card currently represents
       * one primary colour.
       */
      const color =
        product.colors[0];

      if (!color) {
        continue;
      }

      const existing =
        await Inventory.findOne({
          productId:
            product.id,
          color,
        });

      if (existing) {
        continue;
      }

      const topSizes =
        product.topSizes?.length
          ? product.topSizes
          : product.sizes;

      const bottomSizes =
        product.bottomSizes?.length
          ? product.bottomSizes
          : product.sizes;

      await Inventory.create({
        productId:
          product.id,

        productName:
          product.name,

        gender:
          product.gender,

        color,

        topStock:
          topSizes.map(
            (size) => ({
              size,
              stock: 0,
            }),
          ),

        bottomStock:
          bottomSizes.map(
            (size) => ({
              size,
              stock: 0,
            }),
          ),
      });

      created++;
    }

    return NextResponse.json({
      success: true,
      created,
      message:
        created > 0
          ? `${created} inventory records created.`
          : "Inventory already initialized.",
    });
  } catch (error) {
    console.error(
      "[INVENTORY_INIT_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to initialize inventory.",
      },
      {
        status: 500,
      },
    );
  }
}