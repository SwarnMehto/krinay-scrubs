import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const shopLinks = [
  { name: "All Scrubs", href: "/shop" },
  { name: "Men's Scrubs", href: "/category/men" },
  { name: "Women's Scrubs", href: "/category/women" },
  { name: "Lab Coats", href: "/category/lab-coats" },
];

const supportLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "Track Order", href: "/track-order" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Return Policy", href: "/return-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-[#052a4f] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tight">KRINAY</span>
            <span className="ml-2 text-sm tracking-[0.25em] text-sky-200">
              SCRUBS
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            Comfortable, practical and professional medical uniforms designed
            for healthcare professionals.
          </p>

          {/* <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="rounded-full border border-white/20 p-2.5 transition hover:bg-white hover:text-[#052a4f]"
            >
              <Instagram size={18} />
            </a>
          </div> */}
        </div>

        <div>
          <h2 className="text-base font-bold">Shop</h2>

          <ul className="mt-5 space-y-3">
            {shopLinks.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold">Customer Support</h2>

          <ul className="mt-5 space-y-3">
            {supportLinks.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold">Contact Krinay</h2>

          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0" size={18} />
              <p>
                First Floor, Plot No. 63, Harsh Vihar, Pitampura, Delhi –
                110034
              </p>
            </div>

            <a
              href="tel:+918586083877"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <Phone size={18} />
              +91 85860 83877
            </a>

            <a
              href="mailto:contact@krinay.in"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <Mail size={18} />
              contact@krinay.in
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Krinay Scrubs. All rights reserved.</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>

            <Link href="/terms-and-conditions" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}