import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jbm = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ElectronIx — OEE Monitoring Software for CNC Factories | Real-Time, Enterprise-Grade",
  description:
    "Enterprise-grade OEE monitoring software for CNC factories. Works with Fanuc, Mitsubishi, and Haas. No IT team required. Live on your floor in 7 days. Built in Coimbatore, India.",
  keywords: [
    "OEE monitoring software",
    "CNC OEE monitoring",
    "Fanuc OEE monitoring",
    "Mitsubishi CNC monitoring",
    "Haas machine monitoring",
    "real-time OEE dashboard",
    "factory monitoring software India",
    "CNC machine monitoring",
    "OEE software Coimbatore",
    "shop floor OEE tracking",
  ],
  openGraph: {
    type: "website",
    title: "ElectronIx — OEE Monitoring for CNC Factories",
    description:
      "Real-time OEE monitoring across every CNC machine. Works with Fanuc, Mitsubishi, Haas. Live in 7 days.",
    url: "https://electronix.co.in",
    siteName: "ElectronIx",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElectronIx — Real-Time OEE Monitoring for CNC Factories",
    description:
      "Enterprise-grade OEE monitoring across every CNC machine. Fanuc, Mitsubishi, Haas ready. Live in 7 days.",
  },
  alternates: {
    canonical: "https://electronix.co.in",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jbm.variable}`}>
      <body>{children}</body>
    </html>
  );
}
