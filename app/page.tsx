import BatchDashboardPreview from "@/components/BatchDashboardPreview";
import BentoGrid from "@/components/BentoGrid";
import ComparisonSection from "@/components/ComparisonSection";
import ComplianceSection from "@/components/ComplianceSection";
import CustomerSection from "@/components/CustomerSection";
import Footer from "@/components/Footer";
import GlobalCorridorsSection from "@/components/GlobalCorridorsSection";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import RoadmapSection from "@/components/RoadmapSection";
import TeamSection from "@/components/TeamSection";
import TrustBar from "@/components/TrustBar";
import WalrusSection from "@/components/WalrusSection";

export default function Home() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#F6F0ED] text-[#326273]">
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <GlobalCorridorsSection />
      <BentoGrid />
      <WalrusSection />
      <ComparisonSection />
      <BatchDashboardPreview />
      <ComplianceSection />
      <RoadmapSection />
      <CustomerSection />
      <TeamSection />
      <Footer />
    </main>
  );
}
