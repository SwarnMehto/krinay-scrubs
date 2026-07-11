"use client";

import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Men", href: "/category/men" },
  { name: "Women", href: "/category/women" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { cartCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-slate-700 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <Link href="/" className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tight text-[#063970]">
                KRINAY
              </span>

              <span className="mt-1 text-[10px] font-semibold tracking-[0.32em] text-slate-500">
                SCRUBS
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-700 transition hover:text-[#0b78bd]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() =>
                setSearchOpen((current) => !current)
              }
              className="rounded-full p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-[#0b78bd]"
              aria-label="Search"
            >
              <Search size={21} />
            </button>

            <Link
              href="/wishlist"
              className="hidden rounded-full p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-[#0b78bd] sm:block"
              aria-label="Wishlist"
            >
              <Heart size={21} />
            </Link>

            <Link
              href="/account"
              className="hidden rounded-full p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-[#0b78bd] sm:block"
              aria-label="User account"
            >
              <UserRound size={21} />
            </Link>

            <Link
              href="/cart"
              className="relative rounded-full p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-[#0b78bd]"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={21} />

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0b78bd] px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4">
            <form
              action="/shop"
              className="mx-auto flex max-w-3xl items-center overflow-hidden rounded-full border border-slate-300 bg-white focus-within:border-[#0b78bd]"
            >
              <Search
                className="ml-4 text-slate-400"
                size={20}
              />

              <input
                name="search"
                type="search"
                placeholder="Search scrubs, lab coats and more..."
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="m-1 rounded-full bg-[#063970] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b78bd]"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />

          <div className="relative h-full w-[85%] max-w-sm bg-white p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-black tracking-tight text-[#063970]"
              >
                KRINAY
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 text-slate-700 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-slate-100 py-4 text-base font-medium text-slate-800"
                >
                  {item.name}
                </Link>
              ))}

              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-slate-100 py-4 text-base font-medium text-slate-800"
              >
                Wishlist
              </Link>

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-slate-100 py-4 text-base font-medium text-slate-800"
              >
                My Account
              </Link>

              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between border-b border-slate-100 py-4 text-base font-medium text-slate-800"
              >
                Cart

                <span className="rounded-full bg-[#063970] px-2.5 py-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}