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

const siteUrl = "https://www.krinay.in";

const siteName = "Krinay Scrubs";

const siteDescription =
  "Shop premium medical scrubs, healthcare uniforms and lab coats by Krinay. Comfortable, stretchable and designed for doctors, nurses, medical students and healthcare professionals.";

/*
 * ==========================================
 * GLOBAL SEO METADATA
 * ==========================================
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "Krinay Scrubs | Premium Medical Scrubs for Doctors & Nurses",

    template:
      "%s | Krinay Scrubs",
  },

  description:
    siteDescription,

  applicationName:
    siteName,

  keywords: [
    "Krinay Scrubs",
    "Krinay",
    "medical scrubs",
    "medical scrubs India",
    "scrubs for doctors",
    "scrubs for nurses",
    "doctor scrubs",
    "nurse scrubs",
    "hospital scrubs",
    "healthcare uniforms",
    "medical uniforms",
    "scrub suits",
    "scrub sets",
    "medical scrub set",
    "men medical scrubs",
    "women medical scrubs",
    "lab coats",
    "doctor lab coats",
    "medical clothing India",
  ],

  authors: [
    {
      name:
        "Krinay Scrubs",
      url:
        siteUrl,
    },
  ],

  creator:
    "Krinay Scrubs",

  publisher:
    "Krinay Scrubs",

  /*
   * ========================================
   * CANONICAL
   * ========================================
   */

  alternates: {
    canonical:
      siteUrl,
  },

  /*
   * ========================================
   * SEARCH ENGINE CRAWLING
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
   * OPEN GRAPH
   * ========================================
   */

  openGraph: {
    type:
      "website",

    locale:
      "en_IN",

    url:
      siteUrl,

    siteName:
      siteName,

    title:
      "Krinay Scrubs | Premium Medical Scrubs for Doctors & Nurses",

    description:
      siteDescription,
  },

  /*
   * ========================================
   * TWITTER / SOCIAL SHARING
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
   * CATEGORY
   * ========================================
   */

  category:
    "Medical Apparel",
};

/*
 * ==========================================
 * ORGANIZATION STRUCTURED DATA
 * ==========================================
 */

const organizationSchema = {
  "@context":
    "https://schema.org",

  "@type":
    "Organization",

  "@id":
    `${siteUrl}/#organization`,

  name:
    "Krinay Scrubs",

  alternateName:
    "Krinay",

  url:
    siteUrl,

  description:
    siteDescription,

  sameAs: [
    "https://www.instagram.com/krinayscrubs/",
  ],
};

/*
 * ==========================================
 * WEBSITE STRUCTURED DATA
 * ==========================================
 */

const websiteSchema = {
  "@context":
    "https://schema.org",

  "@type":
    "WebSite",

  "@id":
    `${siteUrl}/#website`,

  url:
    siteUrl,

  name:
    "Krinay Scrubs",

  alternateName:
    "Krinay",

  description:
    siteDescription,

  publisher: {
    "@id":
      `${siteUrl}/#organization`,
  },

  inLanguage:
    "en-IN",
};

/*
 * ==========================================
 * ROOT LAYOUT
 * ==========================================
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
         * STRUCTURED DATA
         * ==================================
         */}

        <Script
          id="krinay-organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                organizationSchema,
              ),
          }}
        />

        <Script
          id="krinay-website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                websiteSchema,
              ),
          }}
        />

        {/*
         * ==================================
         * APP PROVIDERS
         * ==================================
         */}

        <CartProvider>
          <AuthProvider>
            <WishlistProvider>
              {/* Razorpay */}

              <RazorpayScript />

              {/* Scroll handling */}

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
         * Pixel ID: 895982209973528
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
                  : n.queue.push(arguments)
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