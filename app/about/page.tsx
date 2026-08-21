import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HeartPulse,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Krinay Scrubs",
  description:
    "Learn about Krinay Scrubs and our mission to create comfortable professional medical scrubs for healthcare workers.",
};

const values = [
  {
    title: "Professional comfort",
    description:
      "Scrubs designed to remain comfortable through long and demanding healthcare shifts.",
    icon: HeartPulse,
  },
  {
    title: "Functional design",
    description:
      "Practical pockets, professional fits and easy movement for daily clinical work.",
    icon: BadgeCheck,
  },
  {
    title: "Reliable quality",
    description:
      "Carefully selected fabrics and construction designed for regular use.",
    icon: ShieldCheck,
  },
  {
    title: "Pan-India delivery",
    description:
      "Professional medical scrubs delivered to healthcare workers across India.",
    icon: Truck,
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#922424] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">
            About Krinay
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Scrubs made for the people who care for everyone else.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80">
            Krinay Scrubs creates comfortable, functional and professional
            medical workwear for doctors, nurses, technicians, students and
            healthcare teams.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex min-h-[430px] items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#fff4f4] to-[#ead0d0]">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#922424] shadow-sm">
                <Users size={42} />
              </div>

              <p className="mt-5 text-lg font-black text-[#922424]">
                Add Krinay team or model image here
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
              Our story
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-black sm:text-4xl">
              Built around the needs of modern healthcare professionals.
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-8 text-black/65 sm:text-base">
              <p>
                Healthcare professionals spend long hours moving, standing and
                caring for patients. Their workwear should support them instead
                of creating discomfort.
              </p>

              <p>
                Krinay focuses on medical scrubs that balance a professional
                appearance with practical storage, comfortable fabrics and
                reliable fits.
              </p>

              <p>
                Our goal is to make quality medical workwear accessible to
                individuals, clinics, hospitals, institutes and complete
                healthcare teams.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
              >
                Shop Scrubs
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/bulk-order"
                className="inline-flex items-center gap-2 rounded-full border border-[#922424] px-7 py-3.5 text-sm font-bold text-[#922424] transition hover:bg-[#fff4f4]"
              >
                Bulk Orders
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff8f8] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
              Why Krinay
            </p>

            <h2 className="mt-4 text-3xl font-black text-black sm:text-4xl">
              Made for real healthcare work.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="rounded-2xl border border-[#eadada] bg-white p-6"
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
    </>
  );
}