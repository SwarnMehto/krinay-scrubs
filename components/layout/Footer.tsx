import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

const shopLinks = [
  {
    label: "All Scrubs",
    href: "/shop",
  },
  {
    label: "Men's Scrubs",
    href: "/category/men",
  },
  {
    label: "Women's Scrubs",
    href: "/category/women",
  },
  {
    label: "Lab Coats",
    href: "/category/lab-coats",
  },
];

const customerSupportLinks = [
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "Track Order",
    href: "/track-order",
  },
  {
    label: "Shipping Policy",
    href: "/shipping-policy",
  },
  {
    label: "Return Policy",
    href: "/return-policy",
  },
];

const legalLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms-and-conditions",
  },
];

const instagramUrl = "#";

export default function Footer() {
  return (
    <footer className="bg-[#922424] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tight text-white">
              KRINAY
            </span>

            <span className="ml-2 text-sm tracking-[0.25em] text-white/80">
              SCRUBS
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
            Comfortable, practical and professional medical uniforms designed
            for healthcare professionals.
          </p>

          <div className="mt-5 flex gap-3">
            <a
  href="https://www.instagram.com/krinayscrubs/"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Follow Krinay on Instagram"
  className="rounded-full border border-white/40 p-2.5 text-white transition hover:bg-white hover:text-[#922424]"
>
  <FaInstagram size={18} />
</a>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Shop</h2>

          <ul className="mt-5 space-y-3">
            {shopLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/85 transition hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-white">
            Customer Support
          </h2>

          <ul className="mt-5 space-y-3">
            {customerSupportLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/85 transition hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Contact Krinay</h2>

          <div className="mt-5 space-y-4 text-sm text-white/80">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0 text-white" size={18} />

              <p>
                First Floor, Plot No. 63, Harsh Vihar, Pitampura, Delhi –
                110034
              </p>
            </div>

            <a
              href="tel:+918586083877"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <Phone className="shrink-0" size={18} />
              <span>+91 85860 83877</span>
            </a>

            <a
              href="mailto:contact@krinay.in"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <Mail className="shrink-0" size={18} />
              <span>contact@krinay.in</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} Krinay Scrubs. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-4">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-white hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}