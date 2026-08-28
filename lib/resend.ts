import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error(
    "RESEND_API_KEY environment variable missing hai."
  );
}

// Initialize Resend
export const resend = new Resend(resendApiKey);

// Resend email configuration
export const resendConfig = {
  // krinay.in is verified in Resend
  fromEmail: "Krinay Website <contact@krinay.in>",

  // Email where Krinay will receive notifications/details
  receiverEmail:
    process.env.CONTACT_RECEIVER_EMAIL ||
    "krinayclothing@gmail.com",
};