import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import CartProvider from "@/context/CartContext";
import AuthProvider from "@/context/AuthContext";
import WishlistProvider from "@/context/WishlistContext";

import RazorpayScript from "@/components/payment/RazorpayScript";
import ScrollToTop from "@/components/common/ScrollToTop";

import "./globals.css";

/*
 * ==========================================
 * FONT
 * ==========================================
 */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

/*
 * ==========================================
 * WEBSITE CONFIG
 * ==========================================
 */

const siteUrl =
  "https://www.krinay.in";

const siteName =
  "Krinay Scrubs";

const siteDescription =
  "Shop premium medical scrubs, healthcare uniforms and lab coats by Krinay. Comfortable, stretchable and designed for doctors, nurses, medical students and healthcare professionals.";

/*
 * ==========================================
 * GLOBAL SEO METADATA
 * ==========================================
 *
 * IMPORTANT:
 *
 * Do NOT place a global canonical here.
 *
 * Homepage:
 * app/page.tsx
 *
 * Shop:
 * app/shop/page.tsx
 *
 * Category:
 * app/category/[gender]/page.tsx
 *
 * Products:
 * app/product/[slug]/page.tsx
 *
 * Each important page should define
 * its own canonical URL.
 */

export const metadata: Metadata = {
  /*
   * ========================================
   * BASE URL
   * ========================================
   */

  metadataBase:
    new URL(siteUrl),

  /*
   * ========================================
   * GLOBAL TITLE SYSTEM
   * ========================================
   */

  title: {
    default:
      "Krinay Scrubs | Premium Medical Scrubs for Doctors & Nurses",

    template:
      "%s | Krinay Scrubs",
  },

  /*
   * ========================================
   * GLOBAL DESCRIPTION
   * ========================================
   */

  description:
    siteDescription,

  /*
   * ========================================
   * BRAND INFORMATION
   * ========================================
   */

  applicationName:
    siteName,

  authors: [
    {
      name:
        siteName,

      url:
        siteUrl,
    },
  ],

  creator:
    siteName,

  publisher:
    siteName,

  category:
    "Medical Apparel",

  /*
   * ========================================
   * GLOBAL KEYWORDS
   * ========================================
   *
   * Individual pages have more specific
   * metadata where required.
   */

  keywords: [
    "Krinay Scrubs",
    "Krinay",
    "medical scrubs",
    "medical scrubs India",
    "doctor scrubs",
    "nurse scrubs",
    "hospital scrubs",
    "medical scrub sets",
    "scrub suits",
    "scrubs for doctors",
    "scrubs for nurses",
    "scrubs for medical students",
    "healthcare uniforms",
    "hospital uniforms",
    "medical uniforms",
    "men medical scrubs",
    "women medical scrubs",
    "lab coats",
    "doctor lab coats",
    "healthcare workwear",
  ],

  /*
   * ========================================
   * ROBOTS
   * ========================================
   */

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },

  /*
   * ========================================
   * OPEN GRAPH DEFAULTS
   * ========================================
   *
   * Individual important pages override
   * title, description and URL.
   */

  openGraph: {
    type:
      "website",

    locale:
      "en_IN",

    siteName:
      siteName,

    title:
      "Krinay Scrubs | Premium Medical Scrubs for Doctors & Nurses",

    description:
      siteDescription,
  },

  /*
   * ========================================
   * TWITTER DEFAULTS
   * ========================================
   */

  twitter: {
    card:
      "summary_large_image",

    title:
      "Krinay Scrubs | Premium Medical Scrubs for Doctors & Nurses",

    description:
      siteDescription,
  },

  /*
   * ========================================
   * FORMAT DETECTION
   * ========================================
   */

  formatDetection: {
    telephone:
      false,

    address:
      false,

    email:
      false,
  },
};

/*
 * ==========================================
 * ROOT LAYOUT
 * ==========================================
 */

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
    >
      <body
        className={
          inter.className
        }
      >
        {/*
         * ==================================
         * APP PROVIDERS
         * ==================================
         */}

        <CartProvider>
          <AuthProvider>
            <WishlistProvider>

              {/*
               * ============================
               * RAZORPAY
               * ============================
               */}

              <RazorpayScript />

              {/*
               * ============================
               * SCROLL HANDLING
               * ============================
               */}

              <Suspense
                fallback={null}
              >
                <ScrollToTop />
              </Suspense>

              {/*
               * ============================
               * WEBSITE LAYOUT
               * ============================
               */}

              <AnnouncementBar />

              <Header />

              <main className="min-h-screen">
                {children}
              </main>

              <Footer />

              {/*
               * ============================
               * TOAST NOTIFICATIONS
               * ============================
               */}

              <Toaster
                position="top-right"
                toastOptions={{
                  duration:
                    2200,

                  style: {
                    borderRadius:
                      "12px",

                    background:
                      "#0f172a",

                    color:
                      "#ffffff",
                  },
                }}
              />

            </WishlistProvider>
          </AuthProvider>
        </CartProvider>

        {/*
         * ==================================
         * GOOGLE ANALYTICS
         * ==================================
         */}

        <GoogleAnalytics
          gaId="G-VTM9Y9KXFC"
        />

        {/*
         * ==================================
         * META PIXEL
         * ==================================
         */}

        <Script
          id="meta-pixel"
          strategy="afterInteractive"
        >
          {`
            !function(f,b,e,v,n,t,s)
            {
              if(f.fbq)return;

              n=f.fbq=function(){
                n.callMethod
                  ? n.callMethod.apply(n,arguments)
                  : n.queue.push(arguments);
              };

              if(!f._fbq)f._fbq=n;

              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];

              t=b.createElement(e);
              t.async=!0;
              t.src=v;

              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s);

            }(
              window,
              document,
              'script',
              'https://connect.facebook.net/en_US/fbevents.js'
            );

            fbq(
              'init',
              '895982209973528'
            );

            fbq(
              'track',
              'PageView'
            );
          `}
        </Script>

        {/*
         * ==================================
         * META PIXEL NOSCRIPT FALLBACK
         * ==================================
         */}

        <noscript>
          <img
            height="1"
            width="1"
            style={{
              display:
                "none",
            }}
            src="https://www.facebook.com/tr?id=895982209973528&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

      </body>
    </html>
  );
}