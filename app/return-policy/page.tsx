import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return, Exchange and Refund Policy | Krinay",
  description:
    "Read Krinay's return, size exchange, refund and cancellation policy for medical scrubs, lab coats and healthcare apparel orders.",
  alternates: {
    canonical: "https://krinay.in/return-policy",
  },
  openGraph: {
    title: "Return and Exchange Policy | Krinay",
    description:
      "Return, exchange and refund terms for Krinay healthcare apparel orders.",
    url: "https://krinay.in/return-policy",
    siteName: "Krinay",
    type: "website",
  },
};

export default function ReturnPolicyPage() {
  return (
    <main className="bg-[#fffafa]">
      <section className="border-b border-[#922424]/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#922424]">
            Returns & Exchanges
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Return, Exchange and Refund Policy
          </h1>

          <p className="mt-5 text-lg leading-8 text-neutral-600">
            We want every healthcare professional to receive the correct size,
            fit and product from Krinay.
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: July 2026
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="space-y-10 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10">
          <PolicySection title="1. Return Request Window">
            Return or exchange requests should be submitted within 7 days of
            delivery unless a different period is clearly stated on the
            relevant product page.
          </PolicySection>

          <PolicySection title="2. Eligible Products">
            A product may be eligible for return or exchange when it is unused,
            unworn, unwashed, undamaged and returned with original tags,
            packaging and invoice.
          </PolicySection>

          <PolicySection title="3. Non-Returnable Products">
            Products that have been worn, washed, altered, stained, damaged,
            personalised, embroidered or purchased under a clearly marked
            non-returnable offer may not be accepted.
          </PolicySection>

          <PolicySection title="4. Hygiene Requirements">
            Healthcare apparel must be tried on carefully over clean clothing.
            Krinay may reject returned products showing signs of use, odour,
            stains, hair, makeup, washing or contamination.
          </PolicySection>

          <PolicySection title="5. Size Exchange">
            Size exchanges are subject to stock availability. Where the desired
            size is unavailable, Krinay may offer another eligible product,
            store credit or a refund according to the applicable order terms.
          </PolicySection>

          <PolicySection title="6. Wrong or Defective Product">
            If you receive a wrong, damaged or defective product, contact us
            within 48 hours of delivery. Include clear photographs, the order
            number and an unpacking video wherever possible.
          </PolicySection>

          <PolicySection title="7. Return Shipping">
            Return shipping charges may depend on the reason for return. Where
            Krinay shipped an incorrect or verified defective item, eligible
            return shipping costs may be handled by Krinay.
          </PolicySection>

          <PolicySection title="8. Refund Timeline">
            After the returned item is received and passes quality inspection,
            approved refunds are generally initiated within 5–10 business days.
            The bank or payment provider may take additional time to reflect
            the amount.
          </PolicySection>

          <PolicySection title="9. Order Cancellation">
            Cancellation requests may be accepted before an order is processed
            or dispatched. Once dispatched, the customer may need to follow the
            regular return process.
          </PolicySection>

          <PolicySection title="10. How to Request a Return">
            Email{" "}
            <a
              href="mailto:contact@krinay.in"
              className="font-semibold text-[#922424] underline"
            >
              contact@krinay.in
            </a>{" "}
            with your order number, registered phone number, reason for return
            and supporting photographs.
          </PolicySection>
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