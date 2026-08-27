import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import {
  attachExistingOrdersToUser,
  serializeUser,
} from "@/lib/auth/account";
import { normalizeIdentity } from "@/lib/auth/identity";
import { verifyOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { attachSessionCookie } from "@/lib/auth/session";
import { createSignupReward } from "@/lib/rewards";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    /*
     * =====================================================
     * REQUEST BODY
     * =====================================================
     */

    const body = (await request.json()) as {
      name?: string;
      identifier?: string;
      password?: string;
      otp?: string;
    };

    /*
     * =====================================================
     * NAME
     * =====================================================
     */

    const name = body.name?.trim() ?? "";

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid name enter karo.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * EMAIL / PHONE
     * =====================================================
     */

    const identity = normalizeIdentity(
      body.identifier ?? "",
    );

    /*
     * =====================================================
     * PASSWORD
     * =====================================================
     */

    const password = body.password ?? "";

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password minimum 8 characters ka hona chahiye.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * At least:
     * - one letter
     * - one number
     */

    if (
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password me kam se kam 1 letter aur 1 number hona chahiye.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * OTP
     * =====================================================
     */

    const otp = body.otp?.trim() ?? "";

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 6-digit OTP enter karo.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * DATABASE
     * =====================================================
     */

    await connectDatabase();

    /*
     * =====================================================
     * CHECK EXISTING ACCOUNT
     * =====================================================
     */

    const existing = await User.findOne(
      identity.channel === "email"
        ? {
            email: identity.identifier,
          }
        : {
            phone: identity.identifier,
          },
    );

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Account already exist karta hai. Login karo.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * =====================================================
     * VERIFY REGISTRATION OTP
     * =====================================================
     *
     * verifyOtp ko successful OTP ko consume karna
     * chahiye so same OTP reuse na ho.
     */

    await verifyOtp({
      identifier: identity.identifier,
      purpose: "register",
      otp,
    });

    /*
     * =====================================================
     * HASH PASSWORD
     * =====================================================
     */

    const passwordHash =
      await hashPassword(password);

    /*
     * =====================================================
     * CREATE USER
     * =====================================================
     */

    let user;

    try {
      user = await User.create({
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

        /*
         * OTP verification itself proves ownership
         * of selected identity.
         */

        emailVerified:
          identity.channel === "email",

        phoneVerified:
          identity.channel === "phone",

        points: 0,

        wishlistProductIds: [],
      });
    } catch (createError) {
      /*
       * Race-condition protection:
       *
       * Request A and B simultaneously same email se
       * register karein toh DB unique index duplicate
       * error throw kar sakta hai.
       */

      const mongoError =
        createError as {
          code?: number;
        };

      if (mongoError.code === 11000) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Is email/mobile se account already exist karta hai. Login karo.",
          },
          {
            status: 409,
          },
        );
      }

      throw createError;
    }

    /*
     * =====================================================
     * SIGNUP REWARD
     * =====================================================
     */

    await createSignupReward(
      user._id.toString(),
    );

    /*
     * Reward create hone ke baad user ko DB se
     * reload karo taaki updated points response me aaye.
     */

    const refreshedUser =
      await User.findById(
        user._id,
      );

    if (!refreshedUser) {
      throw new Error(
        "Account create hua lekin reload nahi ho paaya.",
      );
    }

    /*
     * =====================================================
     * ATTACH OLD GUEST ORDERS
     * =====================================================
     *
     * Agar customer ne account create karne se pehle
     * same email/mobile se orders kiye the toh existing
     * order history account ke saath attach ho sakti hai.
     */

    await attachExistingOrdersToUser(
      refreshedUser,
    );

    /*
     * attachExistingOrdersToUser user ko modify/save kar
     * sakta hai. Final fresh copy read kar lena safest hai.
     */

    const finalUser =
      (await User.findById(
        refreshedUser._id,
      )) ?? refreshedUser;

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    const response =
      NextResponse.json(
        {
          success: true,

          message:
            "Account created. 100 welcome points added!",

          user:
            serializeUser(
              finalUser,
            ),
        },
        {
          status: 201,
        },
      );

    /*
     * =====================================================
     * AUTO LOGIN
     * =====================================================
     *
     * Registration successful hote hi session cookie
     * attach ho jayegi.
     */

    return attachSessionCookie(
      response,
      finalUser._id.toString(),
    );
  } catch (error) {
    console.error(
      "Register error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Account create nahi ho paaya.";

    /*
     * OTP / validation errors ko 400 return karna
     * 500 se better hai.
     */

    const lowerMessage =
      message.toLowerCase();

    const isClientError =
      lowerMessage.includes("otp") ||
      lowerMessage.includes("password") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("mobile") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("identifier");

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          isClientError
            ? 400
            : 500,
      },
    );
  }
}