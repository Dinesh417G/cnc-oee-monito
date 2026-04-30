import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoStrip from "@/components/LogoStrip";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

const LiveDashboardSection = dynamic(() => import("@/components/LiveDashboardSection"), { ssr: false });

export default function Home() {
  return (
    <>
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
