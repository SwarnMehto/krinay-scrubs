import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Krinay",
  description:
    "Learn how Krinay collects, uses, protects and processes customer information when you browse or shop healthcare apparel on krinay.in.",
  alternates: {
    canonical: "https://krinay.in/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Krinay",
    description:
      "Information about how Krinay manages and protects customer data.",
    url: "https://krinay.in/privacy-policy",
    siteName: "Krinay",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#fffafa]">
      <section className="border-b border-[#922424]/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#922424]">
            Data & Privacy
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-5 text-lg leading-8 text-neutral-600">
            This policy explains how Krinay collects, uses and protects
            information when customers browse or shop on our website.
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Last updated: July 2026
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="space-y-10 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10">
          <PolicySection title="1. Information We Collect">
            We may collect your name, email address, mobile number, billing and
            shipping address, order information, account details, customer
            service communication and website usage information.
          </PolicySection>

          <PolicySection title="2. Payment Information">
            Payments may be processed by authorised third-party payment
            gateways. Krinay does not intentionally store complete card,
            banking or UPI authentication credentials on its own servers.
          </PolicySection>

          <PolicySection title="3. How We Use Information">
            Information may be used to process orders, deliver products,
            provide support, prevent fraud, improve the website, communicate
            order updates and send marketing communication where permitted.
          </PolicySection>

          <PolicySection title="4. Cookies and Analytics">
            We may use cookies and analytics technologies to understand website
            usage, remember customer preferences, measure marketing campaigns
            and improve the shopping experience.
          </PolicySection>

          <PolicySection title="5. Advertising Technologies">
            Subject to applicable consent and browser settings, Krinay may use
            advertising tools such as Meta Pixel, Google Analytics and related
            technologies to measure conversions and provide relevant
            advertisements.
          </PolicySection>

          <PolicySection title="6. Information Sharing">
            We may share necessary information with payment processors,
            logistics partners, hosting providers, analytics services,
            marketing platforms and other service providers required to operate
            the business.
          </PolicySection>

          <PolicySection title="7. Data Protection">
            Krinay uses reasonable administrative and technical safeguards.
            However, no internet transmission or electronic storage system can
            be guaranteed to be completely secure.
          </PolicySection>

          <PolicySection title="8. Customer Rights">
            Subject to applicable law, customers may request access,
            correction, deletion or restriction of certain personal
            information by contacting Krinay.
          </PolicySection>

          <PolicySection title="9. Marketing Communication">
            Customers may unsubscribe from promotional emails through the
            unsubscribe option where available or by contacting us. Essential
            order and service messages may still be sent.
          </PolicySection>

          <PolicySection title="10. Contact">
            For privacy-related questions, email{" "}
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