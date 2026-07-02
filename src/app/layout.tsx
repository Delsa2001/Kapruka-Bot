import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala", "latin"],
  weight: ["400", "500", "600", "700"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: "Kapruka Buddy — Shop Sri Lanka in One Conversation",
  description:
    "Your AI shopping companion on Kapruka.com. Search products, check delivery island-wide, checkout with a pay link, and track orders — in English, Sinhala, Tamil, or Tanglish.",
  keywords: [
    "Kapruka",
    "Sri Lanka",
    "AI shopping",
    "Kapruka Buddy",
    "e-commerce agent",
    "Sinhala",
    "Tamil",
    "Tanglish",
    "checkout",
  ],
  openGraph: {
    title: "Kapruka Buddy — Shop Sri Lanka in One Conversation",
    description:
      "Chat to shop on Kapruka.com — search, deliver island-wide, and pay in 60 seconds.",
    type: "website",
    images: [{ url: "/kapruka-logo.png", alt: "Kapruka" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kapruka Buddy — AI Shopping",
    description: "Search · Deliver · Checkout — all in one chat",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#402970",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${notoSinhala.variable} ${notoTamil.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
