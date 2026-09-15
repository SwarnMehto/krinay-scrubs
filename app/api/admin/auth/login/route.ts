import { NextResponse } from "next/server";

import {
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { connectDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginRequest = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as LoginRequest;

    const email =
      body.email
        ?.trim()
        .toLowerCase() ?? "";

    const password =
      body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    /*
     * passwordHash has select:false in Admin model,
     * therefore explicitly request it here.
     */
    const admin =
      await Admin.findOne({
        email,
      }).select(
        "+passwordHash",
      );

    /*
     * Same response for invalid email/password.
     * This avoids exposing whether an admin email exists.
     */
    if (
      !admin ||
      !admin.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    const passwordMatches =
      await verifyAdminPassword(
        password,
        admin.passwordHash,
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * =====================================================
     * CREATE SECURE SESSION
     * =====================================================
     */
    await setAdminSession({
      adminId:
        admin._id.toString(),

      email:
        admin.email,

      role: "admin",
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Login successful.",

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
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[ADMIN_LOGIN_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to sign in right now.",
      },
      {
        status: 500,
      },
    );
  }
}