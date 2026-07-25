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

function cleanText(
  value: unknown,
  maxLength: number,
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

function serializeReview(
  review: {
    _id: unknown;
    productId: string;
    productSlug: string;
    productName: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt?: Date | string;
  },
) {
  return {
    id: String(review._id),

    productId:
      review.productId,

    productSlug:
      review.productSlug,

    productName:
      review.productName,

    customerName:
      review.customerName,

    rating:
      review.rating,

    comment:
      review.comment,

    createdAt:
      review.createdAt
        ? new Date(
            review.createdAt,
          ).toISOString()
        : new Date().toISOString(),
  };
}

/* =========================================
   GET REVIEWS
========================================= */

export async function GET(
  request: NextRequest,
) {
  try {
    /*
     * IMPORTANT:
     * Ye lib/mongodb.ts use karega.
     * Wahi Node DNS ko 1.1.1.1 / 8.8.8.8
     * par configure karega.
     */
    await connectDatabase();

    const productId =
      request.nextUrl
        .searchParams
        .get("productId")
        ?.trim();

    const filter =
      productId
        ? {
            productId,
          }
        : {};

    const reviews =
      await Review.find(
        filter,
      )
        .sort({
          createdAt: -1,
        })
        .limit(
          productId
            ? 100
            : 250,
        )
        .lean();

    return NextResponse.json(
      {
        success: true,

        reviews:
          reviews.map(
            serializeReview,
          ),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[REVIEWS_GET_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Reviews temporarily unavailable.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================
   CREATE REVIEW
========================================= */

export async function POST(
  request: NextRequest,
) {
  try {
    await connectDatabase();

    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const productId =
      cleanText(
        body.productId,
        120,
      );

    const productSlug =
      cleanText(
        body.productSlug,
        180,
      );

    const productName =
      cleanText(
        body.productName,
        180,
      );

    const customerName =
      cleanText(
        body.customerName,
        60,
      );

    const comment =
      cleanText(
        body.comment,
        800,
      );

    const rating =
      Number(body.rating);

    if (
      !productId ||
      !productSlug ||
      !productName
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Product information missing hai.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      customerName.length < 2
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please enter your name.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isInteger(
        rating,
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select 1 to 5 stars.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      comment.length < 5
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Review kam se kam 5 characters ka hona chahiye.",
        },
        {
          status: 400,
        },
      );
    }

    const review =
      await Review.create({
        productId,
        productSlug,
        productName,
        customerName,
        rating,
        comment,
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Review published successfully.",

        review:
          serializeReview(
            review.toObject(),
          ),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "[REVIEWS_POST_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Review submit nahi ho paya.",
      },
      {
        status: 500,
      },
    );
  }
}