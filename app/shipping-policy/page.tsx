import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy | Krinay",
  description:
    "Read Krinay's shipping policy, delivery timelines, shipping charges, order tracking and delivery information for medical scrubs and healthcare apparel.",
  alternates: {
    canonical: "https://krinay.in/shipping-policy",
  },
  openGraph: {
    title: "Shipping Policy | Krinay",
    description:
      "Delivery timelines, shipping charges and order tracking information for Krinay orders.",
    url: "https://krinay.in/shipping-policy",
    siteName: "Krinay",
    type: "website",
  },
};

export default function ShippingPolicyPage() {
  return (
    <main className="bg-[#fffafa]">
      <section className="border-b border-[#922424]/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#922424]">
            Customer Support
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Shipping Policy
          </h1>

          <p className="mt-5 text-lg leading-8 text-neutral-600">
            This policy explains how Krinay processes, ships and delivers
            medical scrubs, lab coats and healthcare apparel orders across
            India.
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: July 2026
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="space-y-10 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10">
          <PolicySection title="1. Order Processing">
            Orders are generally processed within 1–3 business days after
            successful payment confirmation. Orders placed on Sundays, public
            holidays or during major sales may require additional processing
            time.
          </PolicySection>

          <PolicySection title="2. Delivery Timeline">
            Standard delivery usually takes approximately 3–8 business days
            after dispatch, depending on the delivery address, courier
            availability and serviceability of the destination PIN code.
          </PolicySection>

          <PolicySection title="3. Shipping Charges">
            Shipping charges, when applicable, are displayed during checkout.
            Krinay may offer free shipping when the order value meets the
            minimum threshold displayed on the website.
          </PolicySection>

          <PolicySection title="4. Order Tracking">
            Once the order is dispatched, customers may receive tracking
            information through email, SMS or WhatsApp. Customers may also use
            the Track Order page to check the latest shipment status.
          </PolicySection>

          <PolicySection title="5. Delivery Attempts">
            Courier partners may make multiple delivery attempts. Customers
            should ensure that the provided phone number and delivery address
            are correct and accessible.
          </PolicySection>

          <PolicySection title="6. Delayed Deliveries">
            Delivery delays may occur because of weather conditions, courier
            disruptions, regional restrictions, public holidays, natural
            events or circumstances outside Krinay's reasonable control.
          </PolicySection>

          <PolicySection title="7. Incorrect or Incomplete Address">
            Krinay will not be responsible for delays or non-delivery caused by
            an incorrect or incomplete shipping address provided by the
            customer.
          </PolicySection>

          <PolicySection title="8. Damaged or Missing Package">
            If a package arrives visibly damaged or an item is missing, contact
            Krinay customer support within 48 hours of delivery with the order
            number, photographs and an unpacking video where available.
          </PolicySection>

          <PolicySection title="9. Contact">
            For shipping-related questions, contact us at{" "}
            <a
              href="mailto:contact@krinay.in"
              className="font-semibold text-[#922424] underline"
            >
              contact@krinay.in
            </a>
            .
          </PolicySection>

          <div className="rounded-2xl bg-[#922424]/5 p-5">
            <p className="font-medium text-neutral-800">
              Already placed an order?
            </p>

            <Link
              href="/track-order"
              className="mt-3 inline-flex font-semibold text-[#922424] underline"
            >
              Track your Krinay order
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      <p className="mt-3 leading-8 text-neutral-600">{children}</p>
    </section>
  );
}