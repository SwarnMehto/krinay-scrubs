import "server-only";

import Razorpay from "razorpay";

let razorpayClient:
  | Razorpay
  | null = null;

export function getRazorpayClient() {
  if (razorpayClient) {
    return razorpayClient;
  }

  const keyId =
    process.env.RAZORPAY_KEY_ID?.trim();

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing hain. RAZORPAY_KEY_ID aur RAZORPAY_KEY_SECRET check karo.",
    );
  }

  if (
    keyId === "rzp_test_your_key_id" ||
    keySecret === "your_test_key_secret"
  ) {
    throw new Error(
      "Placeholder Razorpay credentials use ho rahe hain. Razorpay Dashboard se actual Test Mode keys add karo.",
    );
  }

  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayClient;
}