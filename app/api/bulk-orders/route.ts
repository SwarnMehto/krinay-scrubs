import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BulkOrderRequest = {
  fullName?: unknown;
  organization?: unknown;
  phone?: unknown;
  email?: unknown;
  quantity?: unknown;
  colours?: unknown;
  sizes?: unknown;
  embroidery?: unknown;
  message?: unknown;
  website?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatValue(value: string, fallback = "Not provided") {
  return escapeHtml(value || fallback);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
    const adminEmail = process.env.KRINAY_ADMIN_EMAIL?.trim() || "contact@krinay.in";

    if (!apiKey) throw new Error("RESEND_API_KEY missing hai.");
    if (!fromEmail) throw new Error("RESEND_FROM_EMAIL missing hai.");

    const body = (await request.json()) as BulkOrderRequest;
    const website = cleanText(body.website, 200);
    if (website) {
      return NextResponse.json({ success: true, message: "Bulk order request submitted." });
    }

    const fullName = cleanText(body.fullName, 80);
    const organization = cleanText(body.organization, 120);
    const phone = cleanText(body.phone, 20);
    const email = cleanText(body.email, 160).toLowerCase();
    const quantityText = cleanText(body.quantity, 12);
    const colours = cleanText(body.colours, 300);
    const sizes = cleanText(body.sizes, 300);
    const embroidery = cleanText(body.embroidery, 30) || "No";
    const message = cleanText(body.message, 3000);

    if (fullName.length < 2) return NextResponse.json({ success: false, message: "Valid full name required hai." }, { status: 400 });
    if (organization.length < 2) return NextResponse.json({ success: false, message: "Hospital, clinic ya institute name required hai." }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ success: false, message: "Valid 10-digit Indian mobile number required hai." }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, message: "Valid email address enter karein." }, { status: 400 });

    const quantity = Number(quantityText);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
      return NextResponse.json({ success: false, message: "Valid estimated quantity required hai." }, { status: 400 });
    }

    const submittedAt = new Date();
    const submittedAtIndia = submittedAt.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const subject = `New Bulk Order Request: ${organization} — ${quantity} Scrubs`;
    const html = `
      <div style="margin:0;background:#f8f5f5;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111827">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #eadada;border-radius:20px;overflow:hidden">
          <div style="background:#922424;padding:26px 30px;color:#ffffff">
            <div style="font-size:13px;letter-spacing:2px;font-weight:700;opacity:.78">KRINAY SCRUBS</div>
            <h1 style="margin:10px 0 0;font-size:25px;line-height:1.3">New Bulk Order Quotation Request</h1>
          </div>
          <div style="padding:28px 30px">
            <p style="margin:0 0 22px;color:#475569;line-height:1.7">A customer submitted a new bulk-order requirement from the KRINAY website.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px"><tbody>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700;width:38%">Full name</td><td style="padding:11px;border-bottom:1px solid #eee">${formatValue(fullName)}</td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Organization</td><td style="padding:11px;border-bottom:1px solid #eee">${formatValue(organization)}</td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Phone</td><td style="padding:11px;border-bottom:1px solid #eee"><a href="tel:+91${escapeHtml(phone)}" style="color:#922424">${escapeHtml(phone)}</a></td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Email</td><td style="padding:11px;border-bottom:1px solid #eee">${formatValue(email)}</td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Estimated quantity</td><td style="padding:11px;border-bottom:1px solid #eee">${quantity}</td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Required colours</td><td style="padding:11px;border-bottom:1px solid #eee">${formatValue(colours, "Not specified")}</td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Required sizes</td><td style="padding:11px;border-bottom:1px solid #eee">${formatValue(sizes, "Not specified")}</td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Logo embroidery</td><td style="padding:11px;border-bottom:1px solid #eee">${formatValue(embroidery)}</td></tr>
              <tr><td style="padding:11px;border-bottom:1px solid #eee;font-weight:700">Submitted</td><td style="padding:11px;border-bottom:1px solid #eee">${escapeHtml(submittedAtIndia)}</td></tr>
            </tbody></table>
            <div style="margin-top:22px;padding:18px;background:#fff7f7;border:1px solid #eadada;border-radius:14px">
              <div style="font-size:13px;font-weight:700;color:#922424;margin-bottom:8px">Additional requirements</div>
              <div style="font-size:14px;line-height:1.7;white-space:pre-wrap;color:#334155">${formatValue(message, "No additional requirements")}</div>
            </div>
            <div style="margin-top:24px"><a href="https://wa.me/91${escapeHtml(phone)}" style="display:inline-block;background:#922424;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:14px;font-weight:700">Contact customer</a></div>
          </div>
        </div>
      </div>`;

    const text = [
      "NEW KRINAY BULK ORDER REQUEST", "",
      `Full name: ${fullName}`, `Organization: ${organization}`, `Phone: ${phone}`,
      `Email: ${email || "Not provided"}`, `Estimated quantity: ${quantity}`,
      `Required colours: ${colours || "Not specified"}`,
      `Required sizes: ${sizes || "Not specified"}`,
      `Logo embroidery: ${embroidery}`,
      `Additional requirements: ${message || "None"}`,
      `Submitted: ${submittedAtIndia}`,
    ].join("\n");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Krinay-Scrubs/1.0",
        "Idempotency-Key": `bulk-${phone}-${submittedAt.getTime()}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        reply_to: email || undefined,
        subject, html, text,
        tags: [{ name: "category", value: "bulk_order" }],
      }),
    });

    const resendData = (await resendResponse.json()) as { id?: string; message?: string; error?: { message?: string } };
    if (!resendResponse.ok || !resendData.id) {
      console.error("[BULK_ORDER_RESEND_ERROR]", resendData);
      throw new Error(resendData.error?.message || resendData.message || "Bulk-order email send nahi ho payi.");
    }

    console.log("[BULK_ORDER_EMAIL_SENT]", { emailId: resendData.id, adminEmail, customerPhone: phone, quantity });

    return NextResponse.json({
      success: true,
      message: "Bulk order request email successfully sent.",
      emailSent: true,
      emailId: resendData.id,
    }, { status: 201 });
  } catch (error) {
    console.error("[BULK_ORDER_ERROR]", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Bulk order request submit nahi ho payi.",
    }, { status: 500 });
  }
}
