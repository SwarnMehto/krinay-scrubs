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


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Krinay Scrubs | Medical Scrubs & Healthcare Uniforms",
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
    <html lang="en">
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
      </body>
    </html>
  );
}