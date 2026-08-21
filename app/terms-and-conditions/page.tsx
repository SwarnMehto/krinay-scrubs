import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Krinay",
  description:
    "Read the terms governing use of the Krinay website, customer accounts, product orders, pricing, payments, delivery and healthcare apparel purchases.",
  alternates: {
    canonical: "https://krinay.in/terms-and-conditions",
  },
  openGraph: {
    title: "Terms and Conditions | Krinay",
    description:
      "Website, ordering, payment and customer terms for Krinay.",
    url: "https://krinay.in/terms-and-conditions",
    siteName: "Krinay",
    type: "website",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-[#fffafa]">
      <section className="border-b border-[#922424]/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#922424]">
            Website Terms
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Terms and Conditions
          </h1>

          <p className="mt-5 text-lg leading-8 text-neutral-600">
            These terms govern your access to and use of the Krinay website,
            products and related customer services.
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: July 2026
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="space-y-10 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10">
          <PolicySection title="1. Acceptance of Terms">
            By accessing the website or placing an order, you agree to these
            Terms and Conditions, our Privacy Policy, Shipping Policy and
            Return Policy.
          </PolicySection>

          <PolicySection title="2. Website Use">
            You agree to use the website only for lawful purposes and not to
            interfere with its operation, security, software, content or
            services.
          </PolicySection>

          <PolicySection title="3. Product Information">
            Krinay aims to display product descriptions, colours, measurements
            and images accurately. Minor variations may occur because of
            screens, lighting, production batches or fabric characteristics.
          </PolicySection>

          <PolicySection title="4. Pricing">
            Product prices and promotional offers may change without prior
            notice. The applicable price is generally the price displayed when
            the order is placed, subject to correction of obvious technical or
            pricing errors.
          </PolicySection>

          <PolicySection title="5. Orders">
            Placing an order does not guarantee acceptance. Krinay may cancel
            or limit an order because of stock availability, payment failure,
            suspected fraud, pricing errors or delivery restrictions.
          </PolicySection>

          <PolicySection title="6. Payments">
            Orders must be paid using payment methods available at checkout.
            Payment processing may be handled by third-party service providers
            under their own terms.
          </PolicySection>

          <PolicySection title="7. Shipping and Delivery">
            Shipping estimates are indicative and may be affected by courier
            operations, weather, serviceability and events outside Krinay's
            reasonable control.
          </PolicySection>

          <PolicySection title="8. Returns and Refunds">
            Returns, exchanges, cancellations and refunds are governed by the
            Return Policy published on this website.
          </PolicySection>

          <PolicySection title="9. Intellectual Property">
            The Krinay name, logo, website design, text, photographs, graphics,
            product presentation and other content may be protected by
            intellectual property laws. Unauthorised reproduction or commercial
            use is prohibited.
          </PolicySection>

          <PolicySection title="10. User Accounts">
            Customers are responsible for maintaining the confidentiality of
            their login details and for activity performed through their
            accounts.
          </PolicySection>

          <PolicySection title="11. Limitation of Liability">
            To the extent permitted by law, Krinay will not be responsible for
            indirect, incidental or consequential losses arising from website
            use, delayed delivery or misuse of products.
          </PolicySection>

          <PolicySection title="12. Governing Law">
            These terms are governed by the laws applicable in India. Subject
            to applicable consumer law, disputes may be subject to the
            jurisdiction of competent courts in Delhi.
          </PolicySection>

          <PolicySection title="13. Contact">
            For questions about these terms, email{" "}
            <a
              href="mailto:contact@krinay.in"
              className="font-semibold text-[#922424] underline"
            >
              contact@krinay.in
            </a>
            .
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