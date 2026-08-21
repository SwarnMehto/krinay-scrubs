import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseMedical,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Premium Medical Lab Coats for Doctors | Krinay",
  description:
    "Shop premium medical lab coats for doctors, medical students, nurses and healthcare professionals in India. Comfortable, professional and designed for long working hours.",
  keywords: [
    "medical lab coats",
    "doctor lab coat",
    "white coat for doctors",
    "lab coat for medical students",
    "hospital uniforms India",
    "healthcare apparel",
    "Krinay lab coats",
    "medical clothing Delhi",
  ],
  alternates: {
    canonical: "https://krinay.in/category/lab-coats",
  },
  openGraph: {
    title: "Premium Medical Lab Coats | Krinay",
    description:
      "Professional lab coats engineered for doctors, medical students and healthcare professionals.",
    url: "https://krinay.in/category/lab-coats",
    siteName: "Krinay",
    type: "website",
  },
};

const features = [
  "Professional and modern fit",
  "Comfortable for long hospital shifts",
  "Functional medical utility pockets",
  "Durable and easy-care fabric",
  "Suitable for doctors and medical students",
  "Designed for everyday clinical use",
];

export default function LabCoatsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Medical Lab Coats",
    description:
      "Premium medical lab coats for doctors, medical students and healthcare professionals.",
    url: "https://krinay.in/category/lab-coats",
    isPartOf: {
      "@type": "WebSite",
      name: "Krinay",
      url: "https://krinay.in",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />

      <main className="bg-[#fffafa] text-[#191919]">
        <section className="border-b border-[#922424]/10 bg-gradient-to-br from-[#fffafa] via-white to-[#922424]/5">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#922424]">
                Professional Healthcare Apparel
              </p>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-[#171717] sm:text-5xl lg:text-6xl">
                Premium Lab Coats Made for Modern Healthcare Professionals
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                Discover professional medical lab coats designed for doctors,
                medical students, nurses, laboratory professionals and
                healthcare teams. Built to deliver comfort, confidence and
                functionality throughout demanding workdays.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 font-semibold text-white transition hover:bg-[#761c1c]"
                >
                  Explore Collection
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/bulk-order"
                  className="inline-flex items-center gap-2 rounded-full border border-[#922424] px-7 py-3.5 font-semibold text-[#922424] transition hover:bg-[#922424] hover:text-white"
                >
                  Bulk Lab Coat Orders
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#922424]/10 bg-white p-6 shadow-sm sm:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#922424]/10 text-[#922424]">
                <BriefcaseMedical size={30} />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Designed for Clinical Excellence
              </h2>

              <div className="mt-6 grid gap-4">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 rounded-xl bg-[#fff7f7] p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#922424] text-white">
                      <Check size={14} />
                    </span>

                    <p className="leading-6 text-neutral-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-neutral-200 bg-white p-7">
              <Sparkles className="text-[#922424]" size={28} />
              <h2 className="mt-5 text-xl font-bold">Professional Appearance</h2>
              <p className="mt-3 leading-7 text-neutral-600">
                Clean silhouettes and refined details help healthcare
                professionals maintain a confident and polished appearance.
              </p>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-7">
              <ShieldCheck className="text-[#922424]" size={28} />
              <h2 className="mt-5 text-xl font-bold">Made for Daily Use</h2>
              <p className="mt-3 leading-7 text-neutral-600">
                Created for regular clinical, laboratory and institutional use
                with a focus on durability and ease of movement.
              </p>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-7">
              <BriefcaseMedical className="text-[#922424]" size={28} />
              <h2 className="mt-5 text-xl font-bold">Functional Storage</h2>
              <p className="mt-3 leading-7 text-neutral-600">
                Practical pockets provide convenient storage for pens,
                notepads and everyday medical accessories.
              </p>
            </article>
          </div>
        </section>

        <section className="bg-[#922424]">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 py-12 text-white sm:px-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Need lab coats for your clinic or hospital?
              </h2>
              <p className="mt-2 text-white/80">
                Contact Krinay for institutional and bulk healthcare apparel
                orders.
              </p>
            </div>

            <Link
              href="/bulk-order"
              className="rounded-full bg-white px-7 py-3.5 font-semibold text-[#922424] transition hover:bg-[#f8eeee]"
            >
              Request Bulk Pricing
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}