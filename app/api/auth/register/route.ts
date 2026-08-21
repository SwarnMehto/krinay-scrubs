import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import { attachExistingOrdersToUser, serializeUser } from "@/lib/auth/account";
import { normalizeIdentity } from "@/lib/auth/identity";
import { verifyOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { attachSessionCookie } from "@/lib/auth/session";
import { createSignupReward } from "@/lib/rewards";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      identifier?: string;
      password?: string;
      otp?: string;
    };

    const name = body.name?.trim() ?? "";

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid name enter karo.",
        },
        { status: 400 },
      );
    }

    const identity = normalizeIdentity(body.identifier ?? "");
    const password = body.password ?? "";
    const otp = body.otp?.trim() ?? "";

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "6-digit OTP enter karo.",
        },
        { status: 400 },
      );
    }

    await connectDatabase();

    const existing = await User.findOne(
      identity.channel === "email"
        ? { email: identity.identifier }
        : { phone: identity.identifier },
    );

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Account already exist karta hai. Login karo.",
        },
        { status: 409 },
      );
    }

    await verifyOtp({
      identifier: identity.identifier,
      purpose: "register",
      otp,
    });

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email:
        identity.channel === "email"
          ? identity.identifier
          : undefined,
      phone:
        identity.channel === "phone"
          ? identity.identifier
          : undefined,
      passwordHash,
      emailVerified: identity.channel === "email",
      phoneVerified: identity.channel === "phone",
      points: 0,
      wishlistProductIds: [],
    });

    await createSignupReward(user._id.toString());

    const refreshedUser = await User.findById(user._id);

    if (!refreshedUser) {
      throw new Error("Account create hua lekin reload nahi ho paaya.");
    }

    await attachExistingOrdersToUser(refreshedUser);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created. 100 welcome points added!",
        user: serializeUser(refreshedUser),
      },
      { status: 201 },
    );

    return attachSessionCookie(response, user._id.toString());
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Account create nahi ho paaya.",
      },
      { status: 500 },
    );
  }
}
