import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import BulkOrderRequest from "@/models/BulkOrderRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.website) {
      return NextResponse.json({
        success: true,
      });
    }

    const fullName =
      String(body.fullName ?? "").trim();

    const organization =
      String(body.organization ?? "").trim();

    const phone =
      String(body.phone ?? "").trim();

    const email =
      String(body.email ?? "").trim();

    const quantity = Number(body.quantity);

    if (
      fullName.length < 2 ||
      organization.length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name and organization required hain.",
        },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid phone number required hai.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid quantity required hai.",
        },
        { status: 400 },
      );
    }

    await connectDatabase();

    await BulkOrderRequest.create({
      fullName,
      organization,
      phone,
      email,
      quantity,
      colours:
        String(body.colours ?? "").trim(),
      sizes:
        String(body.sizes ?? "").trim(),
      embroidery:
        String(body.embroidery ?? "No"),
      message:
        String(body.message ?? "").trim(),
    });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Bulk order request error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Bulk order request submit nahi hui.",
      },
      { status: 500 },
    );
  }
}