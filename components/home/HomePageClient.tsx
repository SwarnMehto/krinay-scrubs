"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";
import {
  communityImages,
  homeCollections,
  homeTestimonials,
} from "@/data/homepage";
import type { Product } from "@/types/product";

const trustBenefits = [
  {
    title: "Pan India Delivery",
    description: "Secure delivery through trusted courier partners.",
    icon: Truck,
  },
  {
    title: "Quality Assured",
    description: "Comfortable fabrics designed for long duty hours.",
    icon: BadgeCheck,
  },
  {
    title: "Easy Assistance",
    description: "Support for size, order and return-related queries.",
    icon: Headphones,
  },
  {
    title: "Secure Payment",
    description: "Protected online payments through Razorpay.",
    icon: ShieldCheck,
  },
];

const shopByColours = [
  {
    name: "Airforce",
    label: "Airforce",
    hex: "#385467",
    href: "/shop?colour=Airforce%20Blue",
    available: true,
  },
  {
    name: "Royal Blue",
    label: "Royal Blue",
    hex: "#0066D9",
    href: "/shop?colour=Royal%20Blue",
    available: true,
  },
  {
    name: "black",
    label: "black",
    hex: "#111827",
    href: "/shop?colour=Black",
    available: true,
  },
  {
    name: "Wine",
    label: "Wine",
    hex: "#8B1E3F",
    href: "/shop?colour=Wine",
    available: true,
  },
  {
    name: "Coffee",
    label: "Coffee",
    hex: "#6F4E37",
    href: "/shop?colour=Coffee",
    available: false,
  },
  {
    name: "Olive",
    label: "Olive",
    hex: "#808000",
    href: "/shop?colour=Olive",
    available: true,
  },
];


export default function HomePageClient() {
  const scrubProducts = products.filter(
    (product) => product.category !== "Lab Coats",
  );

const newArrivalScrubs = [
  // =========================
  // MEN'S SCRUBS
  // =========================

  // Men's Wine
  scrubProducts.find((product) => {
    const slug = product.slug?.trim().toLowerCase();

    return (
      slug === "mens-athletic-scrub-set-wine" ||
      (
        product.category === "Men" &&
        slug.includes("mens-athletic-scrub") &&
        slug.includes("wine")
      )
    );
  }),

  // Men's Mediterranean Olive
  scrubProducts.find((product) => {
    const slug = product.slug?.trim().toLowerCase();

    return (
      slug === "mens-athletic-scrub-set-mediterranean-olive" ||
      (
        product.category === "Men" &&
        slug.includes("mens-athletic-scrub") &&
        (
          slug.includes("mediterranean-olive") ||
          slug.includes("olive")
        )
      )
    );
  }),

  // Men's Black
  scrubProducts.find((product) => {
    const slug = product.slug?.trim().toLowerCase();

    return (
      slug === "mens-athletic-scrub-set-black" ||
      (
        product.category === "Men" &&
        slug.includes("mens-athletic-scrub") &&
        slug.includes("black")
      )
    );
  }),

  // =========================
  // WOMEN'S SCRUBS
  // =========================

  // Women's Airforce Blue
  scrubProducts.find((product) => {
    const slug = product.slug?.trim().toLowerCase();

    return (
      slug === "womens-athletic-scrub-set-airforce-blue" ||
      (
        product.category === "Women" &&
        slug.includes("womens-athletic-scrub") &&
        slug.includes("airforce-blue")
      )
    );
  }),

  // Women's Wine
  scrubProducts.find((product) => {
    const slug = product.slug?.trim().toLowerCase();

    return (
      slug === "womens-athletic-scrub-set-wine" ||
      (
        product.category === "Women" &&
        slug.includes("womens-athletic-scrub") &&
        slug.includes("wine")
      )
    );
  }),

  // Women's Mediterranean Olive
  scrubProducts.find((product) => {
    const slug = product.slug?.trim().toLowerCase();

    return (
      slug === "womens-athletic-scrub-set-mediterranean-olive" ||
      (
        product.category === "Women" &&
        slug.includes("womens-athletic-scrub") &&
        (
          slug.includes("mediterranean-olive") ||
          slug.includes("olive")
        )
      )
    );
  }),
].filter((product): product is Product => Boolean(product));

  const newArrivalLabCoats = products
    .filter((product) => product.category === "Lab Coats")
    .slice(0, 2);

  // Final New Arrivals
  const newArrivals = [
    ...newArrivalScrubs,
    ...newArrivalLabCoats,
  ];

  const bestsellers = [...scrubProducts]
    .sort((firstProduct, secondProduct) => {
      return secondProduct.rating - firstProduct.rating;
    })
    .slice(0, 4);

  const womenProducts = scrubProducts
    .filter((product) => product.category === "Women")
    .slice(0, 4);

  const menProducts = scrubProducts
    .filter((product) => product.category === "Men")
    .slice(0, 4);

  return (
    <>
      <HeroSection />

      <TrustStrip />

      <ShopByColourSection />

      <CollectionSection />

      <ProductSection
        eyebrow="Just Dropped"
        title="New Arrivals"
        description="Explore the latest Krinay medical scrub designs."
        href="/shop"
        products={newArrivals}
      />

      <ProductSection
        eyebrow="Customer Favourites"
        title="Our Bestselling Scrubs"
        description="Professional scrub sets preferred by healthcare workers."
        href="/shop"
        products={bestsellers}
        background="soft"
      />

      <ProductSection
        eyebrow="Women’s Collection"
        title="Scrubs designed for her"
        description="Modern fits combining professional styling and all-day comfort."
        href="/shop?category=Women"
        products={womenProducts}
      />

      <ProductSection
        eyebrow="Men’s Collection"
        title="Performance scrubs for him"
        description="Functional, comfortable and professional scrub sets."
        href="/shop?category=Men"
        products={menProducts}
        background="soft"
      />

      <BusinessServicesSection />

      <WhyKrinaySection />

      <TestimonialsSection />

      <CommunitySection />
    </>
  );
}

function HeroSection() {
  const heroImages = [
    {
      src: "/images/home/hero-models.jpg",
      alt: "Krinay Scrubs medical professionals",
    },
    {
      src: "/images/home/hero-models-2.jpg",
      alt: "Krinay professional medical scrubs collection",
    },
    {
      src: "/images/home/hero-models-3.jpg",
      alt: "Krinay medical scrubs for healthcare professionals",
    },
    {
      src: "/images/home/hero-models-4.jpg",
      alt: "Krinay medical scrubs for healthcare professionals",
    },
    {
      src: "/images/home/hero-models-5.jpg",
      alt: "Krinay medical scrubs for healthcare professionals",
    },
    {
      src: "/images/products/lab-coats/female/01-full-front-v2.jpg",
      alt: "Krinay Flex-U Premium Medical Apron for doctors",
    },
    { src: "/images/products/lab-coats/male/01-full-front.jpg", 
      alt: "Krinay Flex-U Premium Medical Apron for doctors", },
    { src: "/images/products/shubham.jpg", 
      alt: "Krinay medical scrubs for healthcare professionals", },
    
    ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((previousSlide) =>
        (previousSlide + 1) % heroImages.length,
      );
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  return (
    <section className="relative overflow-hidden bg-[#fff7f7]">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#922424]/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#922424]/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-10">
        <div>
          <span className="inline-flex items-center rounded-full border border-[#e7cece] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#922424] shadow-sm sm:text-base">
            For the warriors like you
          </span>

          <h1 className="mt-7 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-black sm:text-5xl lg:text-7xl">
            Scrubs engineered for
            <span className="block text-[#922424]">long shifts.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-black/65 sm:text-lg">
            Discover professional medical scrubs built for comfort, movement
            and confidence throughout demanding healthcare shifts.
          </p>

          <div className="mt-9 flex flex-row flex-nowrap gap-2 sm:gap-3">
            <Link
              href="/shop?category=Women"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#922424] px-4 py-3 text-xs font-black text-white transition hover:bg-[#701a1a] sm:px-5 sm:py-3 sm:text-sm"
            >
              Shop For Her
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/shop?category=Men"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-black bg-white px-4 py-3 text-xs font-black text-black transition hover:border-[#922424] hover:text-[#922424] sm:px-5 sm:py-3 sm:text-sm"
            >
              Shop For Him
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/shop?category=Lab%20Coats"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#922424] bg-[#fff7f7] px-4 py-3 text-xs font-black text-[#922424] transition hover:bg-[#922424] hover:text-white sm:px-5 sm:py-3 sm:text-sm"
            >
              Doctors Lab Coats
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-black/65">
            <span className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-[#922424]" />
              Premium-quality fabric
            </span>

            <span className="flex items-center gap-2">
              <RefreshCcw size={18} className="text-[#922424]" />
              Easy order assistance
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative min-h-[500px] overflow-hidden rounded-[2.5rem] bg-[#ead7d7] shadow-2xl shadow-[#922424]/10 sm:min-h-[570px]">
            {heroImages.map((heroImage, index) => (
              <div
                key={heroImage.src}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  currentSlide === index
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-[1.03] opacity-0"
                }`}
              >
                <HomeImage
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fallback={`Add hero image ${index + 1}`}
                  className="object-cover object-center"
                  priority={index === 0}
                />
              </div>
            ))}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-7 pb-8 pt-28 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">
                Krinay Scrubs
              </p>

              <p className="mt-2 text-2xl font-black">
                Built for the modern healer.
              </p>
            </div>

            <div className="absolute bottom-5 right-6 z-30 flex items-center gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Show hero slide ${index + 1}`}
                  className={`h-2.5 rounded-full border border-white/70 transition-all duration-300 ${
                    currentSlide === index
                      ? "w-8 bg-white"
                      : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 z-30 rounded-2xl border border-[#eadada] bg-white p-4 shadow-xl sm:-left-8 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                <Users size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold text-black/50">Made for</p>
                <p className="text-sm font-black text-black">
                  Doctors, Nurses and all the health care professionals
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -right-3 top-8 z-30 rounded-2xl bg-[#922424] p-4 text-white shadow-xl sm:-right-7 sm:p-5">
            <p className="text-xs font-semibold text-white/75">
              Available sizes
            </p>
            <p className="mt-1 text-xl font-black">XS – 5XL</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="border-y border-[#eadada] bg-white">
      <div className="mx-auto grid max-w-7xl divide-y divide-[#eadada] px-4 sm:px-6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4 lg:px-8">
        {trustBenefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article
              key={benefit.title}
              className="flex items-start gap-4 px-4 py-7"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                <Icon size={20} />
              </div>

              <div>
                <h2 className="text-sm font-black text-black">
                  {benefit.title}
                </h2>

                <p className="mt-1 text-xs leading-5 text-black/55">
                  {benefit.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ShopByColourSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Find your colour"
          title="Shop scrubs by colour"
          description="Airforce Blue, Royal Blue, Wine, olive and black are available now. Other colours are coming soon."
          href="/shop"
          linkLabel="View All Scrubs"
        />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {shopByColours.map((colour) => {
            const cardContent = (
              <>
                <div className="relative mx-auto w-fit">
  <span
    className="mx-auto block h-20 w-20 rounded-full border-4 border-white shadow-md ring-1 ring-black/10 transition group-hover:scale-105"
    style={{ backgroundColor: colour.hex }}
  />

  {!colour.available && (
    <span className="absolute -right-4 -top-3 rounded-full bg-[#922424] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-md">
      Coming Soon
    </span>
  )}
</div>

                <h3 className="mt-4 text-sm font-black text-black">
                  {colour.label}
                </h3>
              </>
            );

            if (!colour.available) {
              return (
                <div
                  key={colour.name}
                  aria-disabled="true"
                  className="group cursor-not-allowed rounded-2xl border border-[#eadada] bg-[#fafafa] p-4 text-center opacity-75"
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <Link
                key={colour.name}
                href={colour.href}
                className="group rounded-2xl border border-[#eadada] bg-white p-4 text-center transition hover:-translate-y-1 hover:border-[#922424] hover:shadow-lg"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CollectionSection() {
  return (
    <section className="bg-[#fff7f7] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Shop by collection"
          title="Scrubs for every professional"
          description="Explore Krinay’s focused collections for women and men."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {homeCollections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative min-h-[500px] overflow-hidden rounded-[2rem] bg-[#ead7d7]"
            >
              <HomeImage
                src={collection.image}
                alt={collection.title}
                fallback={`Add ${collection.title} image`}
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                  {collection.eyebrow}
                </p>

                <h3 className="mt-3 text-3xl font-black sm:text-4xl">
                  {collection.title}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                  {collection.description}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition group-hover:bg-[#922424] group-hover:text-white">
                  Shop Collection
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

type ProductSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  products: Product[];
  background?: "white" | "soft";
};

function ProductSection({
  eyebrow,
  title,
  description,
  href,
  products: sectionProducts,
  background = "white",
}: ProductSectionProps) {
  if (sectionProducts.length === 0) {
    return null;
  }

  return (
    <section
      className={`px-4 py-16 sm:px-6 lg:px-8 lg:py-20 ${
        background === "soft" ? "bg-[#fff7f7]" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={href}
          linkLabel="View All"
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sectionProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessServicesSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        <Link
          href="/bulk-order"
          className="group relative min-h-[410px] overflow-hidden rounded-[2rem] bg-[#922424]"
        >
          <HomeImage
            src="/images/home/bulk-order.jpg"
            alt="Krinay Scrubs bulk order"
            fallback="Add bulk-order team image"
            className="object-cover opacity-55 transition duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          <div className="absolute inset-0 flex max-w-xl flex-col justify-center p-7 text-white sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Users size={23} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
              Clinics, hospitals and teams
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Need scrubs in bulk?
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
              Request bulk pricing, team sizing assistance and coordinated
              scrub colours for your healthcare organisation.
            </p>

            <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition group-hover:bg-[#922424] group-hover:text-white">
              Request Bulk Order
              <ArrowRight size={17} />
            </span>
          </div>
        </Link>

        <Link
          href="/track-order"
          className="group flex min-h-[410px] flex-col justify-between rounded-[2rem] border border-[#eadada] bg-[#fff7f7] p-7 transition hover:border-[#922424] sm:p-10"
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#922424] text-white">
              <PackageCheck size={23} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#922424]">
              Delivery updates
            </p>

            <h2 className="mt-3 text-3xl font-black text-black sm:text-4xl">
              Track your Krinay order
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
              Use your order number and registered phone number to check your
              order and shipment status.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-[#e6cccc] bg-white p-5">
            <div>
              <p className="text-xs font-semibold text-black/45">
                Track status
              </p>
              <p className="mt-1 font-black text-black">
                Confirmed → Shipped → Delivered
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#922424] text-white transition group-hover:translate-x-1">
              <ArrowRight size={19} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

function WhyKrinaySection() {
  const benefits = [
    {
      title: "Designed for long shifts",
      description:
        "Comfortable fits that support movement throughout demanding workdays.",
      icon: BadgeCheck,
    },
    {
      title: "Functional storage",
      description:
        "Useful pockets for everyday medical tools and personal essentials.",
      icon: PackageCheck,
    },
    {
      title: "Professional appearance",
      description:
        "Clean, modern designs created for clinics and healthcare teams.",
      icon: ShieldCheck,
    },
    {
      title: "Customer assistance",
      description:
        "Support for product selection, order updates and bulk requirements.",
      icon: Headphones,
    },
  ];

  return (
    <section className="bg-black px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d99b9b]">
            The Krinay difference
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            For the warriors like you, not ordinary workwear.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="rounded-2xl border border-white/15 bg-white/5 p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#922424] text-white">
                  <Icon size={20} />
                </div>

                <h3 className="mt-5 text-lg font-black">{benefit.title}</h3>

                <p className="mt-3 text-sm leading-7 text-white/60">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-[#fff7f7] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Healthcare community"
          title="Loved by professionals"
          description="Feedback from people who need comfort and functionality every day."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {homeTestimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="rounded-3xl border border-[#eadada] bg-white p-7"
            >
              <div className="flex items-center gap-1 text-[#922424]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={17}
                    fill={
                      index < testimonial.rating ? "currentColor" : "none"
                    }
                  />
                ))}
              </div>

              <p className="mt-6 text-sm leading-7 text-black/65">
                “{testimonial.review}”
              </p>

              <div className="mt-7 border-t border-[#eadada] pt-5">
                <h3 className="font-black text-black">{testimonial.name}</h3>
                <p className="mt-1 text-xs text-black/50">
                  {testimonial.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Krinay community"
          title="Made for warriors like you"
          description="Follow Krinay Scrubs for new launches, medical workwear inspiration and customer stories."
          href="https://www.instagram.com/krinayscrubs/"
          linkLabel="Follow on Instagram"
        />

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {communityImages.map((communityImage) => (
            <div
              key={communityImage.id}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-[#ead7d7]"
            >
              <HomeImage
                src={communityImage.image}
                alt={communityImage.label}
                fallback={communityImage.label}
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

              <p className="absolute inset-x-0 bottom-0 translate-y-full p-5 text-sm font-black text-white transition group-hover:translate-y-0">
                {communityImage.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#922424]">
          {eyebrow}
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">
          {title}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">
          {description}
        </p>
      </div>

      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-2 text-sm font-black text-[#922424] transition hover:text-[#701a1a]"
        >
          {linkLabel}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}

type HomeImageProps = {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  priority?: boolean;
};

function HomeImage({
  src,
  alt,
  fallback,
  className = "",
  priority = false,
}: HomeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f8eaea] to-[#ead1d1] p-6 text-center">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
            🥼
          </div>

          <p className="mt-4 text-sm font-black text-[#922424]">
            {fallback}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, 50vw"
      className={className}
      onError={() => setHasError(true)}
    />
  );
}