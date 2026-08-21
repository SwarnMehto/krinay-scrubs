"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import {
  navigationSections,
  type NavigationSection,
} from "@/data/navigation";

type GenderSlug = "women" | "men";

function getSectionByGender(
  gender: GenderSlug,
): NavigationSection | undefined {
  return navigationSections.find(
    (section) => section.label.toLowerCase() === gender,
  );
}

function scrollPageToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

export default function Header() {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();

  const [activeMenu, setActiveMenu] =
    useState<GenderSlug | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [mobileGenderOpen, setMobileGenderOpen] =
    useState<GenderSlug | null>(null);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const closeTimerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const activeSection = activeMenu
    ? getSectionByGender(activeMenu)
    : undefined;

  const cancelScheduledClose = () => {
    if (!closeTimerRef.current) {
      return;
    }

    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openDesktopMenu = (gender: GenderSlug) => {
    cancelScheduledClose();
    setActiveMenu(gender);
  };

  const scheduleCloseDesktopMenu = () => {
    cancelScheduledClose();

    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
      closeTimerRef.current = null;
    }, 170);
  };

  const closeDesktopMenu = () => {
    cancelScheduledClose();
    setActiveMenu(null);
  };

  const handleDesktopNavigation = () => {
    closeDesktopMenu();
    setSearchOpen(false);
    scrollPageToTop();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileGenderOpen(null);
    setSearchOpen(false);
    scrollPageToTop();
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-[#eadada] bg-white"
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleCloseDesktopMenu}
      >
        <div className="mx-auto flex min-h-[94px] max-w-[1450px] items-center gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-full p-2 text-black transition hover:bg-[#fff4f4] hover:text-[#922424] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={23} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            scroll
            onClick={handleDesktopNavigation}
            className="flex h-[90px] w-[80px] shrink-0 items-center justify-center overflow-hidden"
          >
            <Image
              src="/images/logo.png"
              alt="Krinay Scrubs"
              width={80}
              height={90}
              priority
              className="h-[90px] w-[80px] object-contain"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            <Link
              href="/"
              scroll
              onClick={handleDesktopNavigation}
              className="rounded-full px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
            >
              Home
            </Link>

            {(["women", "men"] as GenderSlug[]).map((gender) => {
              const section = getSectionByGender(gender);

              if (!section) {
                return null;
              }

              const isActive = activeMenu === gender;

              return (
                <Link
                  key={gender}
                  href={section.href}
                  scroll
                  onMouseEnter={() => openDesktopMenu(gender)}
                  onClick={handleDesktopNavigation}
                  aria-expanded={isActive}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#fff4f4] text-[#922424]"
                      : "text-black hover:bg-[#fff4f4] hover:text-[#922424]"
                  }`}
                >
                  {section.label}

                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      isActive ? "rotate-180" : ""
                    }`}
                  />
                </Link>
              );
            })}

            <Link
              href="/about"
              scroll
              onClick={handleDesktopNavigation}
              className="rounded-full px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              scroll
              onClick={handleDesktopNavigation}
              className="rounded-full px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
            >
              Contact Us
            </Link>
          </nav>

          {/* Right navigation */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <div className="mr-2 hidden items-center gap-1 xl:flex">
              <Link
                href="/track-order"
                scroll
                onClick={handleDesktopNavigation}
                className="rounded-full px-3 py-2 text-xs font-bold text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
              >
                Track Order
              </Link>

              <Link
                href="/bulk-order"
                scroll
                onClick={handleDesktopNavigation}
                className="rounded-full px-3 py-2 text-xs font-bold text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
              >
                Bulk Order
              </Link>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchOpen((current) => !current);
                closeDesktopMenu();
              }}
              className="rounded-full p-2.5 text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            <Link
              href="/wishlist"
              scroll
              onClick={handleDesktopNavigation}
              className="relative hidden rounded-full p-2.5 text-black transition hover:bg-[#fff4f4] hover:text-[#922424] sm:flex"
              aria-label={`Wishlist with ${wishlistCount} products`}
            >
              <Heart size={20} />

              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#922424] px-1 text-[10px] font-bold text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              scroll
              onClick={handleDesktopNavigation}
              className="relative hidden rounded-full p-2.5 text-black transition hover:bg-[#fff4f4] hover:text-[#922424] sm:flex"
              aria-label={user ? `My account, ${user.points} points` : "Login or create account"}
              title={user ? `${user.points} reward points` : "Login / Create Account"}
            >
              <UserRound size={20} />

              {user && user.points > 0 && (
                <span className="absolute -right-2 -top-1 rounded-full bg-[#fff0f0] px-1.5 py-0.5 text-[8px] font-black text-[#922424]">
                  {user.points}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              scroll
              onClick={handleDesktopNavigation}
              className="relative rounded-full p-2.5 text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingBag size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#922424] px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="border-t border-[#eadada] bg-white px-4 py-4">
            <form
              action="/shop"
              method="GET"
              onSubmit={() => {
                setSearchOpen(false);
                closeDesktopMenu();
              }}
              className="mx-auto flex max-w-3xl overflow-hidden rounded-full border border-[#d8caca] bg-white transition focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]"
            >
              <Search
                size={19}
                className="ml-4 shrink-0 self-center text-black/45"
              />

              <input
                type="search"
                name="search"
                placeholder="Search medical scrubs..."
                className="w-full bg-transparent px-3 py-3 text-sm text-black outline-none placeholder:text-black/45"
              />

              <button
                type="submit"
                className="m-1 rounded-full bg-[#922424] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Desktop mega menu */}
        {activeSection && (
          <DesktopMegaMenu
            section={activeSection}
            closeMenu={closeDesktopMenu}
            keepMenuOpen={cancelScheduledClose}
            scheduleCloseMenu={scheduleCloseDesktopMenu}
          />
        )}
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation overlay"
          />

          <aside className="relative h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eadada] px-5">
              <Link
                href="/"
                scroll
                onClick={closeMobileMenu}
                className="flex h-[90px] w-[80px] items-center justify-center overflow-hidden"
              >
                <Image
                  src="/images/logo.png"
                  alt="Krinay Scrubs"
                  width={80}
                  height={90}
                  className="h-[90px] w-[80px] object-contain"
                />
              </Link>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-full p-2 text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
                aria-label="Close navigation menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="p-5">
              <Link
                href="/"
                scroll
                onClick={closeMobileMenu}
                className="block border-b border-[#eadada] py-4 text-base font-bold text-black"
              >
                Home
              </Link>

              {(["women", "men"] as GenderSlug[]).map(
                (gender) => {
                  const section = getSectionByGender(gender);

                  if (!section) {
                    return null;
                  }

                  const isOpen =
                    mobileGenderOpen === gender;

                  return (
                    <div
                      key={gender}
                      className="border-b border-[#eadada]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setMobileGenderOpen(
                            isOpen ? null : gender,
                          )
                        }
                        className="flex w-full items-center justify-between py-4 text-left text-base font-bold text-black"
                        aria-expanded={isOpen}
                      >
                        {section.label}

                        <ChevronDown
                          size={18}
                          className={`transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="pb-5">
                          <Link
                            href={section.href}
                            scroll
                            onClick={closeMobileMenu}
                            className="mb-4 flex items-center justify-center rounded-full bg-[#922424] px-5 py-3 text-sm font-bold text-white"
                          >
                            Shop All {section.label} Scrubs
                          </Link>

                          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#922424]">
                            Shop By Colours
                          </p>

                          <div className="space-y-1">
                            {section.colours.map((colour) => (
                              <Link
                                key={colour.name}
                                href={colour.href}
                                scroll
                                onClick={closeMobileMenu}
                                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-black/75 transition hover:bg-[#fff4f4] hover:text-[#922424]"
                              >
                                <span className="flex items-center gap-3">
                                  <span
                                    className="h-4 w-4 rounded-full border border-black/10"
                                    style={{
                                      backgroundColor:
                                        colour.hex,
                                    }}
                                  />

                                  {colour.name}
                                </span>

                                <ChevronRight size={14} />
                              </Link>
                            ))}
                          </div>

                          <p className="mb-2 mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#922424]">
                            Shop By Style
                          </p>

                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                scroll
                                onClick={closeMobileMenu}
                                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-black/75 transition hover:bg-[#fff4f4] hover:text-[#922424]"
                              >
                                {item.name}
                                <ChevronRight size={14} />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              )}

              <Link
                href="/about"
                scroll
                onClick={closeMobileMenu}
                className="block border-b border-[#eadada] py-4 text-base font-bold text-black"
              >
                About Us
              </Link>

              <Link
                href="/contact"
                scroll
                onClick={closeMobileMenu}
                className="block border-b border-[#eadada] py-4 text-base font-bold text-black"
              >
                Contact Us
              </Link>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/track-order"
                  scroll
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-[#eadada] px-3 py-3 text-center text-xs font-bold text-black transition hover:border-[#922424] hover:text-[#922424]"
                >
                  Track Order
                </Link>

                <Link
                  href="/bulk-order"
                  scroll
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-[#922424] px-3 py-3 text-center text-xs font-bold text-white transition hover:bg-[#701a1a]"
                >
                  Bulk Order
                </Link>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="/wishlist"
                  scroll
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#eadada] px-3 py-3 text-xs font-bold text-black"
                >
                  <Heart size={16} />
                  Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
                </Link>

                <Link
                  href="/account"
                  scroll
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#eadada] px-3 py-3 text-xs font-bold text-black"
                >
                  <UserRound size={16} />
                  {user ? "My Account" : "Login / Account"}
                </Link>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

type DesktopMegaMenuProps = {
  section: NavigationSection;
  closeMenu: () => void;
  keepMenuOpen: () => void;
  scheduleCloseMenu: () => void;
};

function DesktopMegaMenu({
  section,
  closeMenu,
  keepMenuOpen,
  scheduleCloseMenu,
}: DesktopMegaMenuProps) {
  const handleMenuLinkClick = () => {
    closeMenu();
    scrollPageToTop();
  };

  return (
    <div
      className="
        absolute
        left-1/2
        top-full
        w-[min(980px,calc(100vw-40px))]
        -translate-x-1/2
        overflow-hidden
        rounded-b-xl
        border
        border-t-0
        border-[#eadada]
        bg-white
        shadow-[0_18px_40px_rgba(0,0,0,0.15)]
      "
      onMouseEnter={keepMenuOpen}
      onMouseLeave={scheduleCloseMenu}
    >
      <div className="grid grid-cols-[155px_minmax(0,1fr)_195px]">
        {/* Left: colours and extra links */}
        <aside className="min-w-0 border-r border-[#eadada] bg-[#fffafa] px-3 py-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.04em] text-black">
            Shop By Colours
          </h2>

          <div className="mt-2 space-y-0.5">
            {section.colours.map((colour) => (
              <Link
                key={colour.name}
                href={colour.href}
                scroll
                onClick={handleMenuLinkClick}
                className="group flex min-w-0 items-center justify-between gap-2 rounded-md px-1 py-1.5 text-[10px] font-semibold leading-tight text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                    style={{
                      backgroundColor: colour.hex,
                    }}
                  />

                  <span className="min-w-0 break-words">
                    {colour.name}
                  </span>
                </span>

                <ChevronRight
                  size={10}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>

          <div className="mt-2 border-t border-[#eadada] pt-2">
            {section.extraLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                scroll
                onClick={handleMenuLinkClick}
                className="group flex min-w-0 items-center justify-between gap-2 rounded-md px-1 py-1.5 text-[10px] font-semibold leading-[14px] text-black transition hover:bg-[#fff4f4] hover:text-[#922424]"
              >
                <span className="min-w-0 break-words">
                  {link.name}
                </span>

                <ChevronRight
                  size={10}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        </aside>

        {/* Middle: 2 cards on top and 2 below */}
        <section className="min-w-0 px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#922424]">
                Shop Collection
              </p>

              <h2 className="mt-0.5 text-sm font-black text-black">
                All {section.label}&apos;s Scrubs
              </h2>
            </div>

            <Link
              href={section.href}
              scroll
              onClick={handleMenuLinkClick}
              className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#922424] underline underline-offset-4"
            >
              Shop All
              <ChevronRight size={11} />
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            {section.items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                scroll
                onClick={handleMenuLinkClick}
                className="group grid min-h-[125px] min-w-0 grid-cols-[140px_minmax(0,1fr)] items-center gap-4 rounded-xl border border-[#f0dddd] bg-white p-3 transition hover:border-[#922424] hover:shadow-sm"
              >
                <MenuImage
                  src={item.image}
                  alt={item.name}
                  fallback={item.name}
                />

                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-[11px] font-black leading-[15px] text-black transition group-hover:text-[#922424]">
                    {item.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[9px] leading-[13px] text-black/50">
                    {item.description}
                  </p>

                  <span className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold text-[#922424] underline underline-offset-2">
                    Shop Now

                    <ChevronRight
                      size={9}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Right: promotional card */}
        <aside className="p-3">
          <Link
            href={section.promo.href}
            scroll
            onClick={handleMenuLinkClick}
            className="group relative block h-full min-h-[330px] overflow-hidden rounded-xl bg-[#f1e5e5]"
          >
            <MenuImage
              src={section.promo.image}
              alt={section.promo.title}
              fallback={`${section.label} Scrubs`}
              fullHeight
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-white/75">
                {section.promo.eyebrow}
              </p>

              <h3 className="mt-1 text-sm font-black leading-tight">
                {section.promo.title}
              </h3>

              <p className="mt-1 line-clamp-3 text-[8px] leading-3 text-white/75">
                {section.promo.description}
              </p>

              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[8px] font-black text-black transition group-hover:bg-[#922424] group-hover:text-white">
                {section.promo.buttonLabel}
                <ChevronRight size={9} />
              </span>
            </div>
          </Link>
        </aside>
      </div>
    </div>
  );
}

type MenuImageProps = {
  src?: string;
  alt: string;
  fallback: string;
  fullHeight?: boolean;
};

function MenuImage({
  src,
  alt,
  fallback,
  fullHeight = false,
}: MenuImageProps) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const wrapperClass = fullHeight
    ? "absolute inset-0 overflow-hidden"
    : "relative h-[82px] w-full overflow-hidden rounded-lg bg-[#fff4f4]";

  if (!src || imageFailed) {
    return (
      <div
        className={`${wrapperClass} flex items-center justify-center bg-gradient-to-br from-[#f8eaea] to-[#e8cccc] p-2 text-center`}
      >
        <div>
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-sm">
            🥼
          </div>

          <p className="mt-1 line-clamp-1 text-[8px] font-bold text-[#922424]">
            {fallback}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={fullHeight ? "195px" : "125px"}
        onError={() => setImageFailed(true)}
        className="object-cover transition duration-500 group-hover:scale-105"
      />
    </div>
  );
}