import BatchDashboardPreview from "@/components/BatchDashboardPreview";
import BentoGrid from "@/components/BentoGrid";
import ComparisonSection from "@/components/ComparisonSection";
import ComplianceSection from "@/components/ComplianceSection";
import CustomerSection from "@/components/CustomerSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import TeamSection from "@/components/TeamSection";
import TrustBar from "@/components/TrustBar";

export default function Home() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#F6F0ED] text-[#326273]">
      <HeroSection />
      <ComparisonSection />
      <TrustBar />
      <BentoGrid />
      <BatchDashboardPreview />
      <ComplianceSection />
      <CustomerSection />
      <TeamSection />
      <Footer />
    </main>
  );
}
