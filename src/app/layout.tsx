import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jbm = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ElectronIx — Real-Time OEE Monitoring for CNC Machine Shops",
  description:
    "ElectronIx delivers live OEE monitoring for CNC shop floors — track Availability, Performance & Quality across every spindle. Reduce downtime by 40% with AI root-cause analysis and MQTT / OPC UA integration.",
  keywords: [
    "OEE monitoring software",
    "CNC machine monitoring",
    "shop floor analytics",
    "real-time OEE dashboard",
    "manufacturing analytics",
    "digital twin CNC",
    "OPC UA MQTT monitoring",
    "machining downtime reduction",
  ],
  openGraph: {
    type: "website",
    title: "ElectronIx — Real-Time OEE Monitoring for CNC Machine Shops",
    description:
      "Live OEE monitoring across every CNC spindle. AI root-cause analysis, 5-second telemetry, MQTT & OPC UA ready.",
    siteName: "ElectronIx",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElectronIx — Real-Time OEE Monitoring",
    description:
      "See every CNC machine. Cut hidden downtime in half. AI-powered OEE monitoring built for the shop floor.",
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
