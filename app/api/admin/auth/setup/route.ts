import { NextResponse } from "next/server";

import {
  hashAdminPassword,
  setAdminSession,
} from "@/lib/admin-auth";
import { connectDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SetupRequest = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    await connectDatabase();

    /*
     * =====================================================
     * SECURITY:
     * Setup is allowed ONLY when no admin exists.
     * =====================================================
     */
    const existingAdminCount =
      await Admin.countDocuments();

    if (existingAdminCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin setup has already been completed.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as SetupRequest;

    const email =
      body.email
        ?.trim()
        .toLowerCase() ?? "";

    const password =
      body.password ?? "";

    const name =
      body.name?.trim() ||
      "Krinay Admin";

    /*
     * =====================================================
     * EMAIL VALIDATION
     * =====================================================
     */
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !email ||
      !emailRegex.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * PASSWORD VALIDATION
     * =====================================================
     */
    if (password.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 10 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const hasUppercase =
      /[A-Z]/.test(password);

    const hasLowercase =
      /[a-z]/.test(password);

    const hasNumber =
      /\d/.test(password);

    const hasSpecial =
      /[^A-Za-z0-9]/.test(password);

    if (
      !hasUppercase ||
      !hasLowercase ||
      !hasNumber ||
      !hasSpecial
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must include uppercase, lowercase, number and special character.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * HASH PASSWORD
     * =====================================================
     */
    const passwordHash =
      await hashAdminPassword(
        password,
      );

    /*
     * =====================================================
     * CREATE ADMIN
     * =====================================================
     */
    const admin =
      await Admin.create({
        email,
        passwordHash,
        name,
        role: "admin",
        isActive: true,
      });

    /*
     * =====================================================
     * LOGIN IMMEDIATELY AFTER SETUP
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
          "Krinay admin account created successfully.",

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
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "[ADMIN_SETUP_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create the admin account.",
      },
      {
        status: 500,
      },
    );
  }
}