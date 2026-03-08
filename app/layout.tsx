import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ProofPulse — Social Proof Widget pour E-commerces",
    template: "%s | ProofPulse",
  },
  description:
    "Augmentez vos conversions de +23% avec des notifications de preuve sociale en temps réel. Installation en 60 secondes. Compatible Shopify, WooCommerce et tout site.",
  keywords: ["social proof", "conversion", "widget", "e-commerce", "shopify", "woocommerce"],
  authors: [{ name: "ProofPulse" }],
  creator: "ProofPulse",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://proofpulse.io",
    title: "ProofPulse — Social Proof Widget pour E-commerces",
    description: "Augmentez vos conversions de +23% avec des notifications de preuve sociale en temps réel.",
    siteName: "ProofPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProofPulse — Social Proof Widget pour E-commerces",
    description: "Augmentez vos conversions de +23% avec des notifications de preuve sociale en temps réel.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
