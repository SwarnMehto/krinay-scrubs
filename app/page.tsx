import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Krinay Scrubs | Professional Medical Scrubs",
  description:
    "Shop comfortable and professional medical scrubs for doctors, nurses and healthcare professionals from Krinay Scrubs.",
};

export default function HomePage() {
  return <HomePageClient />;
}