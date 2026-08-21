import { NextResponse } from "next/server";

import { products } from "@/data/products";
import { requireAuthenticatedUser } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

function validProductId(productId: string) {
  return products.some((product) => product.id === productId);
}

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    return NextResponse.json({
      success: true,
      productIds: user.wishlistProductIds ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json(
        {
          success: false,
          message: "Login required.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Wishlist load nahi ho paayi.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as {
      action?: "add" | "remove" | "set";
      productId?: string;
      productIds?: string[];
    };

    if (body.action === "set") {
      const productIds = Array.from(
        new Set(
          (body.productIds ?? []).filter(
            (productId) =>
              typeof productId === "string" && validProductId(productId),
          ),
        ),
      );

      user.wishlistProductIds = productIds;
      await user.save();

      return NextResponse.json({
        success: true,
        productIds,
      });
    }

    const productId = body.productId?.trim() ?? "";

    if (!productId || !validProductId(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product.",
        },
        { status: 400 },
      );
    }

    const current = new Set(user.wishlistProductIds ?? []);

    if (body.action === "remove") {
      current.delete(productId);
    } else {
      current.add(productId);
    }

    user.wishlistProductIds = Array.from(current);
    await user.save();

    return NextResponse.json({
      success: true,
      productIds: user.wishlistProductIds,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return NextResponse.json(
        {
          success: false,
          message: "Login required.",
        },
        { status: 401 },
      );
    }

    console.error("Wishlist update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Wishlist update nahi ho paayi.",
      },
      { status: 500 },
    );
  }
}
