"use client";

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-script";
const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const existingScript =
      document.getElementById(
        RAZORPAY_SCRIPT_ID,
      ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      existingScript.addEventListener(
        "load",
        () => resolve(Boolean(window.Razorpay)),
        { once: true },
      );

      existingScript.addEventListener(
        "error",
        () => {
          razorpayScriptPromise = null;
          resolve(false);
        },
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      resolve(Boolean(window.Razorpay));
    };

    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}