import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Check,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Scrubs Collection Coming Soon | Krinay",

  description:
    "Upcoming Krinay medical scrub collections designed for comfort, movement and professional healthcare work.",
};

type ComingSoonPageProps = {
  searchParams: Promise<{
    category?: string;
    type?: string;
  }>;
};

const collectionDetails: Record<
  string,
  {
    title: string;
    description: string;
    cardOneTitle: string;
    cardOneDescription: string;
    cardTwoTitle: string;
    cardTwoDescription: string;
    cardThreeTitle: string;
    cardThreeDescription: string;
  }
> = {
  "plus-size": {
    title:
      "Plus Size Scrubs",

    description:
      "We’re expanding the Krinay collection with more inclusive sizing designed for healthcare professionals who need comfort, movement and a professional fit through every shift.",

    cardOneTitle:
      "Extended Size Range",

    cardOneDescription:
      "We’re working on additional sizing options to create a more comfortable and professional fit for more healthcare professionals.",

    cardTwoTitle:
      "Same Krinay Comfort",

    cardTwoDescription:
      "The upcoming range will maintain our focus on stretch, freedom of movement, useful pockets and all-day comfort.",

    cardThreeTitle:
      "Built for Healthcare",

    cardThreeDescription:
      "Designed for doctors, nurses, technicians, students and healthcare teams working long and demanding shifts.",
  },

  classic: {
    title:
      "Classic Scrubs",

    description:
      "Our Classic Scrub collection is coming soon with clean professional styling, everyday comfort and practical features designed for healthcare work.",

    cardOneTitle:
      "Professional Design",

    cardOneDescription:
      "A timeless scrub design created for clinics, hospitals, medical institutes and everyday professional use.",

    cardTwoTitle:
      "Everyday Comfort",

    cardTwoDescription:
      "Comfort-focused construction designed to support long shifts, regular movement and demanding workdays.",

    cardThreeTitle:
      "Practical Functionality",

    cardThreeDescription:
      "Functional pockets and healthcare-focused details designed to make everyday clinical work easier.",
  },

  jogger: {
    title:
      "Jogger Scrubs",

    description:
      "Krinay Jogger Scrubs are coming soon with a modern athletic look, flexible movement and comfortable styling for healthcare professionals.",

    cardOneTitle:
      "Modern Jogger Fit",

    cardOneDescription:
      "A contemporary jogger-style silhouette designed for professionals who prefer a modern medical workwear look.",

    cardTwoTitle:
      "Built for Movement",

    cardTwoDescription:
      "Designed to support walking, bending and long working hours with comfortable freedom of movement.",

    cardThreeTitle:
      "Healthcare Ready",

    cardThreeDescription:
      "Practical functionality and professional styling created specifically for demanding healthcare environments.",
  },

  cargo: {
    title:
      "Cargo Scrubs",

    description:
      "Krinay Cargo Scrubs are coming soon with practical utility storage, comfortable movement and a professional medical workwear design.",

    cardOneTitle:
      "Utility Storage",

    cardOneDescription:
      "Extra functional storage designed for healthcare professionals who carry essential tools throughout their shifts.",

    cardTwoTitle:
      "Comfortable Performance",

    cardTwoDescription:
      "Made for active healthcare environments where comfort and easy movement are essential throughout the day.",

    cardThreeTitle:
      "Professional Cargo Fit",

    cardThreeDescription:
      "A modern cargo-inspired medical scrub design that balances utility with a clean professional appearance.",
  },
};

const fallbackDetails = {
  title:
    "Scrubs Collection",

  description:
    "A new Krinay Scrubs collection is coming soon, designed for comfort, movement and professional healthcare work.",

  cardOneTitle:
    "Professional Comfort",

  cardOneDescription:
    "Designed around the everyday needs of healthcare professionals.",

  cardTwoTitle:
    "Functional Design",

  cardTwoDescription:
    "Practical medical workwear built for active and demanding shifts.",

  cardThreeTitle:
    "Krinay Quality",

  cardThreeDescription:
    "Comfort-focused construction with professional styling and reliable functionality.",
};

export default async function ComingSoonPage({
  searchParams,
}: ComingSoonPageProps) {
  const params =
    await searchParams;

  const type =
    params.type ??
    "";

  const category =
    params.category === "Men"
      ? "Men"
      : params.category ===
          "Women"
        ? "Women"
        : "";

  const details =
    collectionDetails[type] ??
    fallbackDetails;

  return (
    <main className="min-h-[calc(100vh-90px)] bg-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-[#eadada] bg-[#fff8f8]">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#922424]/5" />

        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#922424]/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* KRINAY */}

            <div className="inline-flex items-center gap-2 rounded-full border border-[#e6cccc] bg-white px-5 py-2.5 shadow-sm">
              <Sparkles
                size={16}
                className="text-[#922424]"
              />

              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">
                Krinay Scrubs
              </span>
            </div>

            {/* TITLE */}

            <h1 className="mt-7 text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-6xl">
              {details.title}
            </h1>

            {/* OPTIONAL GENDER */}

            {category && (
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-[#922424]">
                {category} Collection
              </p>
            )}

            {/* COMING SOON */}

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#922424] px-5 py-2.5 text-sm font-black uppercase tracking-[0.16em] text-white shadow-sm">
              <BellRing size={17} />

              Coming Soon
            </div>

            {/* DESCRIPTION */}

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-black/60 sm:text-lg">
              {details.description}
            </p>

            {/* BUTTONS */}

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop?category=Women"
                className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
              >
                Shop Available Women
                Scrubs

                <ArrowRight size={17} />
              </Link>

              <Link
                href="/shop?category=Men"
                className="inline-flex items-center gap-2 rounded-full border border-[#922424] bg-white px-7 py-3.5 text-sm font-bold text-[#922424] transition hover:bg-[#fff0f0]"
              >
                Shop Available Men
                Scrubs

                <ArrowRight size={17} />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8caca] bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:border-[#922424] hover:text-[#922424]"
              >
                <ArrowLeft size={17} />

                Back Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INFORMATION CARDS
      ===================================================== */}

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* CARD 1 */}

            <article className="rounded-3xl border border-[#eadada] bg-white p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                <Check size={22} />
              </div>

              <h2 className="mt-5 text-xl font-black text-black">
                {
                  details.cardOneTitle
                }
              </h2>

              <p className="mt-3 text-sm leading-7 text-black/60">
                {
                  details.cardOneDescription
                }
              </p>
            </article>

            {/* CARD 2 */}

            <article className="rounded-3xl border border-[#eadada] bg-white p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                <Check size={22} />
              </div>

              <h2 className="mt-5 text-xl font-black text-black">
                {
                  details.cardTwoTitle
                }
              </h2>

              <p className="mt-3 text-sm leading-7 text-black/60">
                {
                  details.cardTwoDescription
                }
              </p>
            </article>

            {/* CARD 3 */}

            <article className="rounded-3xl border border-[#eadada] bg-white p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                <Check size={22} />
              </div>

              <h2 className="mt-5 text-xl font-black text-black">
                {
                  details.cardThreeTitle
                }
              </h2>

              <p className="mt-3 text-sm leading-7 text-black/60">
                {
                  details.cardThreeDescription
                }
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          AVAILABLE NOW
      ===================================================== */}

      <section className="border-y border-[#eadada] bg-[#fff8f8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
            Available Now
          </p>

          <h2 className="mt-4 text-3xl font-black text-black sm:text-4xl">
            Shop our V-Neck
            Athletic Scrubs.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">
            While this collection
            is being prepared,
            explore our currently
            available V-Neck
            Athletic Scrubs for
            women and men.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop?category=Women&style=athletic"
              className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
            >
              Shop Women V-Neck

              <ArrowRight size={17} />
            </Link>

            <Link
              href="/shop?category=Men&style=athletic"
              className="inline-flex items-center gap-2 rounded-full border border-[#922424] bg-white px-7 py-3.5 text-sm font-bold text-[#922424] transition hover:bg-[#fff0f0]"
            >
              Shop Men V-Neck

              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}