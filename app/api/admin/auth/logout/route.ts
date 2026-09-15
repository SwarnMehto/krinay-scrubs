import { NextResponse } from "next/server";

import {
  clearAdminSession,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearAdminSession();

    return NextResponse.json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    console.error(
      "[ADMIN_LOGOUT_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to log out.",
      },
      {
        status: 500,
      },
    );
  }
}