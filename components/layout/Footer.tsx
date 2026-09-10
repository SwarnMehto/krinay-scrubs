import Link from "next/link";

import {
  BookOpen,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  FaInstagram,
} from "react-icons/fa";

/*
 * ==========================================
 * SHOP / DISCOVERY LINKS
 * ==========================================
 */

const shopLinks = [
  {
    label:
      "All Scrubs",

    href:
      "/shop",
  },

  {
    label:
      "Men's Scrubs",

    href:
      "/category/men",
  },

  {
    label:
      "Women's Scrubs",

    href:
      "/category/women",
  },

  {
    label:
      "Lab Coats",

    href:
      "/category/lab-coats",
  },

  /*
   * SEO CONTENT HUB
   */
  {
    label:
      "Scrub Guide",

    href:
      "/blog",
  },
];

/*
 * ==========================================
 * CUSTOMER SUPPORT
 * ==========================================
 */

const customerSupportLinks =
  [
    {
      label:
        "Contact Us",

      href:
        "/contact",
    },

    {
      label:
        "Track Order",

      href:
        "/track-order",
    },

    {
      label:
        "Shipping Policy",

      href:
        "/shipping-policy",
    },

    {
      label:
        "Return Policy",

      href:
        "/return-policy",
    },
  ];

/*
 * ==========================================
 * LEGAL
 * ==========================================
 */

const legalLinks = [
  {
    label:
      "Privacy Policy",

    href:
      "/privacy-policy",
  },

  {
    label:
      "Terms & Conditions",

    href:
      "/terms-and-conditions",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#922424] text-white">

      {/* ======================================
          MAIN FOOTER
      ====================================== */}

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">

        {/* ====================================
            BRAND
        ==================================== */}

        <div>
          <Link
            href="/"
            className="inline-block"
          >
            <span className="text-2xl font-black tracking-tight text-white">
              KRINAY
            </span>

            <span className="ml-2 text-sm tracking-[0.25em] text-white/80">
              SCRUBS
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
            Comfortable,
            practical and
            professional medical
            scrubs designed for
            doctors, nurses and
            healthcare
            professionals.
          </p>

          {/* Scrub guide shortcut */}

          <Link
            href="/blog"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white/90 transition hover:text-white hover:underline"
          >
            <BookOpen
              size={17}
            />

            Read Our Scrub Guide
          </Link>

          {/* Instagram */}

          <div className="mt-6">
            <a
              href="https://www.instagram.com/krinayscrubs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Krinay Scrubs on Instagram"
              className="group inline-flex flex-col items-center gap-2"
            >
              <span className="rounded-full border border-white/40 p-2.5 text-white transition group-hover:bg-white group-hover:text-[#922424]">
                <FaInstagram
                  size={18}
                />
              </span>

              <span className="text-xs font-medium text-white/80 transition group-hover:text-white">
                Follow on
                Instagram
              </span>
            </a>
          </div>
        </div>

        {/* ====================================
            SHOP
        ==================================== */}

        <div>
          <h2 className="text-base font-bold text-white">
            Shop & Explore
          </h2>

          <ul className="mt-5 space-y-3">
            {shopLinks.map(
              (item) => (
                <li
                  key={
                    item.href
                  }
                >
                  <Link
                    href={
                      item.href
                    }
                    className="text-sm text-white/85 transition hover:text-white hover:underline"
                  >
                    {
                      item.label
                    }
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* ====================================
            CUSTOMER SUPPORT
        ==================================== */}

        <div>
          <h2 className="text-base font-bold text-white">
            Customer
            Support
          </h2>

          <ul className="mt-5 space-y-3">
            {customerSupportLinks.map(
              (item) => (
                <li
                  key={
                    item.href
                  }
                >
                  <Link
                    href={
                      item.href
                    }
                    className="text-sm text-white/85 transition hover:text-white hover:underline"
                  >
                    {
                      item.label
                    }
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* ====================================
            CONTACT
        ==================================== */}

        <div>
          <h2 className="text-base font-bold text-white">
            Contact Krinay
          </h2>

          <div className="mt-5 space-y-4 text-sm text-white/80">

            {/* Address */}

            <div className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 shrink-0 text-white"
                size={18}
              />

              <p>
                First Floor,
                Plot No. 63,
                Harsh Vihar,
                Pitampura,
                Delhi – 110034
              </p>
            </div>

            {/* Phone */}

            <a
              href="tel:+919599443877"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <Phone
                className="shrink-0"
                size={18}
              />

              <span>
                +91 95994 43877
              </span>
            </a>

            {/* Email */}

            <a
              href="mailto:contact@krinay.in"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <Mail
                className="shrink-0"
                size={18}
              />

              <span>
                contact@krinay.in
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* ======================================
          BOTTOM BAR
      ====================================== */}

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <p>
            ©{" "}
            {new Date().getFullYear()}{" "}
            Krinay Scrubs.
            All rights
            reserved.
          </p>

          <div className="flex flex-wrap gap-4">

            {/* Blog secondary internal link */}

            <Link
              href="/blog"
              className="transition hover:text-white hover:underline"
            >
              Scrub Guide
            </Link>

            {legalLinks.map(
              (item) => (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="transition hover:text-white hover:underline"
                >
                  {
                    item.label
                  }
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}