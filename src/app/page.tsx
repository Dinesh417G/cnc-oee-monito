import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoStrip from "@/components/LogoStrip";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

const LiveDashboardSection = dynamic(() => import("@/components/LiveDashboardSection"), { ssr: false });

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "ElectronIx OEE Monitoring",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Real-time OEE monitoring software for CNC factories. Works with Fanuc, Mitsubishi, and Haas machines. No IT team required.",
      "offers": { "@type": "Offer", "priceCurrency": "INR" },
      "publisher": { "@type": "Organization", "name": "ElectronIx", "url": "https://electronix.co.in" },
    },
    {
      "@type": "Organization",
      "name": "ElectronIx",
      "url": "https://electronix.co.in",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Coimbatore",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <Hero />
      <LogoStrip />
      <LiveDashboardSection />
      <CTABanner />
      <Footer />
      <ContactModal />
    </>
  );
}
