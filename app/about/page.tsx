import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Krinay Scrubs",
  description:
    "Discover Krinay Scrubs — professional medical scrubs designed for comfort, movement, durability and long healthcare shifts.",
};

const values = [
  {
    title: "Professional Comfort",
    description:
      "Designed to support long clinical shifts with flexible movement and all-day comfort.",
    icon: HeartPulse,
  },
  {
    title: "Functional Design",
    description:
      "Practical pockets, clean fits and healthcare-focused details built for everyday work.",
    icon: BadgeCheck,
  },
  {
    title: "Reliable Quality",
    description:
      "Carefully selected fabrics and construction designed for regular professional use.",
    icon: ShieldCheck,
  },
  {
    title: "Pan-India Delivery",
    description:
      "Krinay Scrubs are delivered to healthcare professionals and teams across India.",
    icon: Truck,
  },
];

const audience = [
  "Doctors",
  "Nurses",
  "Medical Students",
  "Technicians",
  "Clinics",
  "Hospitals",
  "Healthcare Institutes",
];

export default function AboutPage() {
  return (
    <>
      {/* =========================================
          HERO
      ========================================= */}

      <section className="relative overflow-hidden bg-[#922424] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">
              About Krinay
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Scrubs made for the people who care for everyone else.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              Krinay creates professional medical workwear designed around
              comfort, movement, practicality and the real demands of modern
              healthcare.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-black text-[#922424] transition hover:bg-[#fff4f4]"
              >
                Shop Scrubs
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/bulk-order"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
              >
                Bulk Orders
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          BRAND STORY
      ========================================= */}

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          {/* LOGO BLOCK */}

          <div className="relative overflow-hidden rounded-[2rem] border border-[#eadada] bg-gradient-to-br from-[#fff8f8] via-white to-[#f7e8e8] p-8 shadow-sm sm:p-12">
            <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#922424]/10 blur-3xl" />

            <div className="relative flex min-h-[380px] flex-col items-center justify-center text-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] border border-[#eadada] bg-white p-5 shadow-lg shadow-[#922424]/10">
                <Image
                  src="/images/logo.png"
                  alt="Krinay Scrubs Logo"
                  width={150}
                  height={150}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-[#922424]">
                Krinay Scrubs
              </p>

              <h2 className="mt-3 max-w-md text-2xl font-black leading-tight text-black sm:text-3xl">
                Built for every shift.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
                Professional medical scrubs created for healthcare
                professionals who need confidence, comfort and performance
                throughout demanding workdays.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fff0f0] px-4 py-2 text-xs font-black text-[#922424]">
                <Sparkles size={15} />
                Designed for healthcare professionals
              </div>
            </div>
          </div>

          {/* STORY */}

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
              Our Story
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-black sm:text-4xl">
              Built around the needs of modern healthcare professionals.
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-8 text-black/65 sm:text-base">
              <p>
                Healthcare professionals spend long hours moving, standing,
working long shifts, and handling demanding clinical routines.
Their workwear should support that responsibility, not make it
harder.
              </p>

              <p>
                Krinay was created with a simple focus: make medical scrubs that
                combine a professional appearance with practical utility,
                comfortable movement and reliable everyday performance.
              </p>

              <p>
                From fabric selection to fit, pockets and finishing, our goal is
                to create workwear that healthcare professionals can feel
                confident wearing throughout every shift.
              </p>

              <p>
                Krinay serves individual professionals as well as clinics,
                hospitals, institutes and healthcare teams looking for
                dependable professional medical workwear.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
              >
                Explore Collection
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#922424] px-7 py-3.5 text-sm font-bold text-[#922424] transition hover:bg-[#fff4f4]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          WHY KRINAY
      ========================================= */}

      <section className="bg-[#fff8f8] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
              Why Krinay
            </p>

            <h2 className="mt-4 text-3xl font-black text-black sm:text-4xl">
              Made for real healthcare work.
            </h2>

            <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
              Every Krinay product is developed with the practical needs of
              healthcare professionals in mind.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="rounded-2xl border border-[#eadada] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-black">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-black/60">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          WHO WE SERVE
      ========================================= */}

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#eadada] bg-[#fffafa] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#922424] text-white">
                <Users size={25} />
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
                Who We Serve
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight text-black">
                Made for the healthcare community.
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/60">
                From individual professionals to complete teams, Krinay aims to
                make professional medical workwear accessible across India.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {audience.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#eadada] bg-white px-5 py-3 text-sm font-bold text-black/70 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FINAL CTA
      ========================================= */}

      <section className="bg-[#922424] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
              Built For Every Shift
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Discover professional scrubs designed for long healthcare days.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-black text-[#922424] transition hover:bg-[#fff4f4]"
            >
              Shop Now
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/bulk-order"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
            >
              Bulk Enquiry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}