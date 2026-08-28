import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";

import {
  attachExistingOrdersToUser,
  serializeUser,
} from "@/lib/auth/account";

import {
  normalizeIdentity,
} from "@/lib/auth/identity";

import {
  verifyOtp,
} from "@/lib/auth/otp";

import {
  hashPassword,
} from "@/lib/auth/password";

import {
  attachSessionCookie,
} from "@/lib/auth/session";

import {
  createSignupReward,
} from "@/lib/rewards";

import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RegisterRequestBody = {
  name?: string;
  identifier?: string;
  password?: string;
  otp?: string;

  /*
   * Email OTP ke liye request-otp API se
   * ye signed token milta hai.
   *
   * Phone/Twilio OTP ke liye empty ho sakta hai.
   */
  otpToken?: string;
};

export async function POST(
  request: Request
) {
  try {
    /*
     * ==========================================
     * REQUEST BODY
     * ==========================================
     */

    const body =
      (await request.json()) as RegisterRequestBody;

    /*
     * ==========================================
     * NAME
     * ==========================================
     */

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid name enter karo.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * EMAIL / MOBILE
     * ==========================================
     */

    const identifier =
      typeof body.identifier === "string"
        ? body.identifier.trim()
        : "";

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email ya mobile number required hai.",
        },
        {
          status: 400,
        }
      );
    }

    const identity =
      normalizeIdentity(
        identifier
      );

    /*
     * ==========================================
     * PASSWORD
     * ==========================================
     */

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password minimum 8 characters ka hona chahiye.",
        },
        {
          status: 400,
        }
      );
    }

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
        }
      );
    }

    /*
     * ==========================================
     * OTP
     * ==========================================
     */

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 6-digit OTP enter karo.",
        },
        {
          status: 400,
        }
      );
    }

    const otpToken =
      typeof body.otpToken ===
      "string"
        ? body.otpToken.trim()
        : "";

    /*
     * Email OTP ke liye signed token required hai.
     */
    if (
      identity.type === "email" &&
      !otpToken
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP verification token missing hai. Please OTP dubara send karo.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * DATABASE
     * ==========================================
     */

    await connectDatabase();

    /*
     * ==========================================
     * CHECK EXISTING ACCOUNT
     * ==========================================
     */

    const existing =
      await User.findOne(
        identity.type === "email"
          ? {
              email:
                identity.value,
            }
          : {
              phone:
                identity.value,
            }
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
        }
      );
    }

    /*
     * ==========================================
     * VERIFY OTP
     * ==========================================
     */

    const verification =
      await verifyOtp({
        rawIdentity:
          identity.value,

        code:
          otp,

        otpToken:
          identity.type === "email"
            ? otpToken
            : "",
      });

    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP invalid ya expire ho chuka hai. Please naya OTP request karo.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * HASH PASSWORD
     * ==========================================
     */

    const passwordHash =
      await hashPassword(
        password
      );

    /*
     * ==========================================
     * CREATE USER
     * ==========================================
     */

    let user;

    try {
      user =
        await User.create({
          name,

          email:
            identity.type ===
            "email"
              ? identity.value
              : undefined,

          phone:
            identity.type ===
            "phone"
              ? identity.value
              : undefined,

          passwordHash,

          emailVerified:
            identity.type ===
            "email",

          phoneVerified:
            identity.type ===
            "phone",

          points: 0,

          wishlistProductIds: [],
        });
    } catch (createError) {
      const mongoError =
        createError as {
          code?: number;
        };

      if (
        mongoError.code ===
        11000
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Is email/mobile se account already exist karta hai. Login karo.",
          },
          {
            status: 409,
          }
        );
      }

      throw createError;
    }

    /*
     * ==========================================
     * SIGNUP REWARD
     * ==========================================
     */

    await createSignupReward(
      user._id.toString()
    );

    /*
     * ==========================================
     * REFRESH USER
     * ==========================================
     */

    const refreshedUser =
      await User.findById(
        user._id
      );

    if (!refreshedUser) {
      throw new Error(
        "Account create hua lekin reload nahi ho paaya."
      );
    }

    /*
     * ==========================================
     * ATTACH PREVIOUS GUEST ORDERS
     * ==========================================
     */

    await attachExistingOrdersToUser(
      refreshedUser
    );

    /*
     * ==========================================
     * FINAL USER
     * ==========================================
     */

    const finalUser =
      (
        await User.findById(
          refreshedUser._id
        )
      ) ?? refreshedUser;

    /*
     * ==========================================
     * RESPONSE
     * ==========================================
     */

    const response =
      NextResponse.json(
        {
          success: true,

          message:
            "Account created. 100 welcome points added!",

          user:
            serializeUser(
              finalUser
            ),
        },
        {
          status: 201,
        }
      );

    /*
     * ==========================================
     * AUTO LOGIN
     * ==========================================
     */

    return attachSessionCookie(
      response,
      finalUser._id.toString()
    );
  } catch (error) {
    console.error(
      "[REGISTER_ERROR]",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Account create nahi ho paaya.";

    const lowerMessage =
      message.toLowerCase();

    const isClientError =
      lowerMessage.includes("otp") ||
      lowerMessage.includes(
        "password"
      ) ||
      lowerMessage.includes(
        "email"
      ) ||
      lowerMessage.includes(
        "mobile"
      ) ||
      lowerMessage.includes(
        "phone"
      ) ||
      lowerMessage.includes(
        "identifier"
      );

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
      }
    );
  }
}