import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDatabase();

    const adminExists =
      (await Admin.countDocuments()) > 0;

    return NextResponse.json({
      success: true,
      setupRequired: !adminExists,
    });
  } catch (error) {
    console.error(
      "[ADMIN_SETUP_STATUS_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        setupRequired: false,
        message:
          "Unable to check admin setup status.",
      },
      {
        status: 500,
      },
    );
  }
}