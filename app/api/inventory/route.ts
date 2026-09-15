import { NextResponse } from "next/server";

import { products } from "@/data/products";
import { connectDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/require-admin";
import Inventory from "@/models/Inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * =========================================================
 * PUBLIC INVENTORY GET
 * =========================================================
 *
 * Public intentionally.
 *
 * Customer-facing product pages will use this endpoint
 * later to determine which sizes are available.
 *
 * This endpoint only READS inventory.
 * It cannot modify stock.
 */
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
 * =========================================================
 * INITIALIZE INVENTORY
 * =========================================================
 *
 * ADMIN ONLY.
 *
 * Creates missing inventory records.
 *
 * Existing inventory is NEVER overwritten.
 * Therefore running this endpoint again will not reset
 * existing stock values.
 */
export async function POST() {
  try {
    /*
     * -----------------------------------------------------
     * ADMIN AUTHENTICATION
     * -----------------------------------------------------
     */
    const auth =
      await requireAdmin();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
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

    /*
     * -----------------------------------------------------
     * LIVE SCRUB PRODUCTS ONLY
     * -----------------------------------------------------
     */
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
    let skipped = 0;

    /*
     * -----------------------------------------------------
     * CREATE MISSING INVENTORY RECORDS
     * -----------------------------------------------------
     */
    for (const product of liveScrubs) {
      /*
       * Current product structure:
       * each live product card represents
       * one primary colour.
       */
      const color =
        product.colors[0];

      if (!color) {
        skipped++;
        continue;
      }

      /*
       * Never overwrite existing inventory.
       */
      const existing =
        await Inventory.findOne({
          productId:
            product.id,

          color,
        });

      if (existing) {
        skipped++;
        continue;
      }

      /*
       * Use dedicated Top / Bottom sizes
       * when available.
       *
       * Otherwise fallback to general sizes.
       */
      const topSizes =
        product.topSizes?.length
          ? product.topSizes
          : product.sizes;

      const bottomSizes =
        product.bottomSizes?.length
          ? product.bottomSizes
          : product.sizes;

      /*
       * New variants intentionally start at 0.
       *
       * Admin enters the real physical stock
       * from the Inventory dashboard.
       */
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

    /*
     * -----------------------------------------------------
     * ADMIN AUDIT LOG
     * -----------------------------------------------------
     */
    console.log(
      "[ADMIN_INVENTORY_INITIALIZED]",
      {
        admin:
          auth.session.email,

        created,
        skipped,
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

        created,

        skipped,

        message:
          created > 0
            ? `${created} inventory records created successfully.`
            : "Inventory is already initialized.",
      },
      {
        status: 200,
      },
    );
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