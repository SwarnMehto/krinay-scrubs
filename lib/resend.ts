import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error(
    "RESEND_API_KEY environment variable missing hai.",
  );
}

export const resend = new Resend(resendApiKey);

export const resendConfig = {
  fromEmail:
    process.env.RESEND_FROM_EMAIL ||
    "Krinay Website <contact@krinay.in>",

  receiverEmail:
    process.env.CONTACT_RECEIVER_EMAIL ||
    "krinayclothing@gmail.com",
};