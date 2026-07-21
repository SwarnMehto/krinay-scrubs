import { NextResponse } from "next/server";

import { connectDatabase } from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    /*
     * Honeypot field populated means likely spam.
     * Fake successful response return karenge.
     */
    if (body.website) {
      return NextResponse.json({
        success: true,
      });
    }

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid name required hai.",
        },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 10-digit phone number required hai.",
        },
        { status: 400 },
      );
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid email required hai.",
        },
        { status: 400 },
      );
    }

    if (subject.length < 3 || message.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject aur complete message required hai.",
        },
        { status: 400 },
      );
    }

    await connectDatabase();

    await ContactMessage.create({
      name,
      phone,
      email,
      subject,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message received.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Message submit nahi ho paya.",
      },
      { status: 500 },
    );
  }
}