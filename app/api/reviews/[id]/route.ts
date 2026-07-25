import {
  timingSafeEqual,
} from "node:crypto";

import mongoose from "mongoose";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  connectDatabase,
} from "@/lib/mongodb";

import Review from "@/models/Review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminKeyValid(
  providedKey: string,
) {
  const expectedKey =
    process.env.REVIEW_ADMIN_KEY?.trim() ??
    "";

  const cleanProvided =
    providedKey.trim();

  if (
    !expectedKey ||
    !cleanProvided
  ) {
    return false;
  }

  const expectedBuffer =
    Buffer.from(
      expectedKey,
    );

  const providedBuffer =
    Buffer.from(
      cleanProvided,
    );

  if (
    expectedBuffer.length !==
    providedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expectedBuffer,
    providedBuffer,
  );
}

export async function DELETE(
  request: NextRequest,

  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const adminKey =
      request.headers.get(
        "x-review-admin-key",
      ) ?? "";

    if (
      !isAdminKeyValid(
        adminKey,
      )
    ) {
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

    const { id } =
      await context.params;

    if (
      !mongoose.Types
        .ObjectId
        .isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid review ID.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    const deletedReview =
      await Review.findByIdAndDelete(
        id,
      );

    if (!deletedReview) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Review not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    console.error(
      "[REVIEW_DELETE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Review delete nahi ho paya.",
      },
      {
        status: 500,
      },
    );
  }
}