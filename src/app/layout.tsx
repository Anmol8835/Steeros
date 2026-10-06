import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Hedvig_Letters_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const hedvigSerif = Hedvig_Letters_Serif({
  subsets: ["latin"],
  variable: "--font-hedvig-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Steeros: Every prompt pays the right price",
  description:
    "Steeros routes every LLM prompt to the cheapest model that can handle it. Up to 85% lower spend, same quality. One proxy, no code changes.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hedvigSerif.variable}`}
    >
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
