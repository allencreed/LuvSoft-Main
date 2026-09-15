import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsletterModal } from "@/components/NewsletterModal";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Love Soft Life",
  description: "Premium physical goods",
  manifest: "/manifest.json",
  openGraph: {
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
    type: "website",
    siteName: "Love Soft Life",
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0d0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <NewsletterModal />
        <Toaster />
      </body>
    </html>
  );
}
