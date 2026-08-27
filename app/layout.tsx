import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CartProvider from "@/context/CartContext";
import AuthProvider from "@/context/AuthContext";
import WishlistProvider from "@/context/WishlistContext";
import "./globals.css";
import RazorpayScript from "@/components/payment/RazorpayScript";
import { Suspense } from "react";
import ScrollToTop from "@/components/common/ScrollToTop";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Krinay Scrubs | Medical Scrubs & Healthcare Uniforms",
    template: "%s | Krinay Scrubs",
  },
  description:
    "Shop comfortable and professional medical scrubs, healthcare uniforms and lab coats from Krinay Scrubs.",
  metadataBase: new URL("https://krinay.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
    >
      <body className={inter.className}>
        <CartProvider>
          <AuthProvider>
            <WishlistProvider>

              <RazorpayScript />

              <AnnouncementBar />

              <Header />

              <main className="min-h-screen">{children}</main>

              <Footer />

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 2200,
                  style: {
                    borderRadius: "12px",
                    background: "#0f172a",
                    color: "#ffffff",
                  },
                }}
              />

            </WishlistProvider>
          </AuthProvider>
        </CartProvider>

        {/* Google Analytics */}
        <GoogleAnalytics gaId="G-VTM9Y9KXFC" />

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '941725608270089');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* Meta Pixel - NoScript Fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=941725608270089&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

      </body>
    </html>
  );
}