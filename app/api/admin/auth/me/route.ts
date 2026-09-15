import { NextResponse } from "next/server";

import {
  clearAdminSession,
  getAdminSession,
} from "@/lib/admin-auth";
import { connectDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session =
      await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        {
          status: 401,
        },
      );
    }

    await connectDatabase();

    const admin =
      await Admin.findOne({
        _id: session.adminId,
        isActive: true,
      }).select(
        "email name role",
      );

    if (!admin) {
      await clearAdminSession();

      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,

      admin: {
        id:
          admin._id.toString(),

        email:
          admin.email,

        name:
          admin.name,

        role:
          admin.role,
      },
    });
  } catch (error) {
    console.error(
      "[ADMIN_ME_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
      },
      {
        status: 500,
      },
    );
  }
}