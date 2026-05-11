import BatchDashboardPreview from "@/components/BatchDashboardPreview";
import BentoGrid from "@/components/BentoGrid";
import ComplianceSection from "@/components/ComplianceSection";
import CustomerSection from "@/components/CustomerSection";
import Footer from "@/components/Footer";
import FpxSimulation from "@/components/FpxSimulation";
import HeroSection from "@/components/HeroSection";
import LandingCTA from "@/components/LandingCTA";
import TrustBar from "@/components/TrustBar";

export default function Home() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#F6F0ED] text-[#326273]">
      <HeroSection />
      <TrustBar />
      <BentoGrid />
      <BatchDashboardPreview />
      <ComplianceSection />
      <FpxSimulation />
      <CustomerSection />
      <LandingCTA />
      <Footer />
    </main>
  );
}
