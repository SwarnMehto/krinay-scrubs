import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EmbroideryEnquiryRequest = {
  customerName?: unknown;
  customerPhone?: unknown;
  customerEmail?: unknown;
  productName?: unknown;
  productColor?: unknown;
  productImage?: unknown;
  mode?: unknown;
  line1?: unknown;
  line2?: unknown;
  font?: unknown;
  textColor?: unknown;
  addBottomName?: unknown;
  selectedIconId?: unknown;
  selectedIconLabel?: unknown;
  selectedIconSymbol?: unknown;
  fileUrl?: unknown;
  publicId?: unknown;
  fileName?: unknown;
  embroideryPrice?: unknown;
};

function text(value: unknown, max = 300) {
  return typeof value === "string"
    ? value.replace(/\0/g, "").trim().slice(0, max)
    : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function label(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
    const adminEmail =
      process.env.KRINAY_ADMIN_EMAIL?.trim() || "contact@krinay.in";

    if (!apiKey) {
      throw new Error("RESEND_API_KEY missing hai.");
    }

    if (!fromEmail) {
      throw new Error("RESEND_FROM_EMAIL missing hai.");
    }

    const body = (await request.json()) as EmbroideryEnquiryRequest;

    const customerName = text(body.customerName, 100);
    const customerPhone = text(body.customerPhone, 20);
    const customerEmail = text(body.customerEmail, 160).toLowerCase();
    const productName = text(body.productName, 160);
    const productColor = text(body.productColor, 80);
    const productImage = text(body.productImage, 500);
    const mode = text(body.mode, 30);
    const line1 = text(body.line1, 22);
    const line2 = text(body.line2, 22);
    const font = text(body.font, 30);
    const textColor = text(body.textColor, 30);
    const selectedIconLabel = text(body.selectedIconLabel, 100);
    const selectedIconSymbol = text(body.selectedIconSymbol, 20);
    const fileUrl = text(body.fileUrl, 600);
    const fileName = text(body.fileName, 180);
    const embroideryPrice = Number(body.embroideryPrice);
    const addBottomName = Boolean(body.addBottomName);

    if (customerName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Valid full name required hai." },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid 10-digit Indian mobile number required hai.",
        },
        { status: 400 },
      );
    }

    if (
      customerEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
    ) {
      return NextResponse.json(
        { success: false, message: "Valid email address required hai." },
        { status: 400 },
      );
    }

    if (!productName || !mode) {
      return NextResponse.json(
        { success: false, message: "Embroidery details incomplete hain." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(embroideryPrice) || embroideryPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Embroidery price invalid hai." },
        { status: 400 },
      );
    }

    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const subject = `New Embroidery Request: ${productName} — ${customerName}`;

    const html = `
      <div style="margin:0;background:#f8f5f5;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111827">
        <div style="max-width:720px;margin:auto;overflow:hidden;border:1px solid #eadada;border-radius:22px;background:#ffffff">
          <div style="background:#922424;padding:26px 30px;color:#ffffff">
            <div style="font-size:12px;font-weight:800;letter-spacing:2px;opacity:.78">KRINAY SCRUBS</div>
            <h1 style="margin:10px 0 0;font-size:25px">New Custom Embroidery Request</h1>
          </div>

          <div style="padding:28px 30px">
            <p style="margin:0 0 22px;color:#475569;line-height:1.7">
              A customer completed the embroidery customizer on the KRINAY website.
            </p>

            ${
              productImage
                ? `<div style="margin-bottom:22px;text-align:center"><img src="${escapeHtml(productImage)}" alt="${escapeHtml(productName)}" style="max-height:260px;max-width:100%;object-fit:contain;border-radius:16px;background:#eef4f8;padding:12px" /></div>`
                : ""
            }

            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tbody>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700;width:38%">Customer</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(customerName)}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Mobile</td><td style="padding:11px;border-bottom:1px solid #eee"><a href="tel:+91${escapeHtml(customerPhone)}" style="color:#922424">${escapeHtml(customerPhone)}</a></td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Email</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(customerEmail || "Not provided")}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Product</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(productName)}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Selected colour</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(productColor || "Not selected")}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Embroidery type</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(label(mode))}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Line 1</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(line1 || "—")}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Line 2</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(line2 || "—")}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Font</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(label(font))}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Thread colour</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(label(textColor))}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Bottom name</td><td style="padding:11px;border-bottom:1px solid #eee">${addBottomName ? "Yes" : "No"}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Selected icon</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml([selectedIconSymbol, selectedIconLabel].filter(Boolean).join(" ") || "None")}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Custom logo</td><td style="padding:11px;border-bottom:1px solid #eee">${
                  fileUrl
                    ? `<a href="${escapeHtml(fileUrl)}" style="color:#922424;font-weight:700">Open ${escapeHtml(fileName || "uploaded artwork")}</a>`
                    : "Not uploaded"
                }</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Embroidery price</td><td style="padding:11px;border-bottom:1px solid #eee;font-size:18px;font-weight:800;color:#922424">₹${embroideryPrice.toLocaleString("en-IN")}</td></tr>
                <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Submitted</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(submittedAt)}</td></tr>
              </tbody>
            </table>

            <div style="margin-top:24px">
              <a href="https://wa.me/91${escapeHtml(customerPhone)}" style="display:inline-block;border-radius:999px;background:#922424;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:700">Contact customer on WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `embroidery-${customerPhone}-${Date.now()}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        reply_to: customerEmail || undefined,
        subject,
        html,
        text: [
          "NEW KRINAY EMBROIDERY REQUEST",
          `Customer: ${customerName}`,
          `Mobile: ${customerPhone}`,
          `Email: ${customerEmail || "Not provided"}`,
          `Product: ${productName}`,
          `Colour: ${productColor || "Not selected"}`,
          `Type: ${mode}`,
          `Line 1: ${line1 || "—"}`,
          `Line 2: ${line2 || "—"}`,
          `Font: ${font}`,
          `Thread colour: ${textColor}`,
          `Icon: ${selectedIconLabel || "None"}`,
          `Logo: ${fileUrl || "Not uploaded"}`,
          `Price: ₹${embroideryPrice}`,
          `Submitted: ${submittedAt}`,
        ].join("\n"),
      }),
    });

    const resendData = (await resendResponse.json()) as {
      id?: string;
      message?: string;
      error?: { message?: string };
    };

    if (!resendResponse.ok || !resendData.id) {
      console.error("[EMBROIDERY_RESEND_ERROR]", resendData);
      throw new Error(
        resendData.error?.message ||
          resendData.message ||
          "Embroidery email send nahi ho payi.",
      );
    }

    console.log("[EMBROIDERY_EMAIL_SENT]", {
      emailId: resendData.id,
      customerPhone,
      productName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Embroidery requirement email successfully sent.",
        emailId: resendData.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[EMBROIDERY_ENQUIRY_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Embroidery enquiry submit nahi ho payi.",
      },
      { status: 500 },
    );
  }
}
