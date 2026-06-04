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
import SectionDivider from "@/components/SectionDivider";
import TeamSection from "@/components/TeamSection";
import TrustBar from "@/components/TrustBar";
import WalrusSection from "@/components/WalrusSection";

export default function Home() {
  return (
    <main className="min-h-svh overflow-hidden splash-page-bg text-[#326273]">
      <HeroSection />
      <TrustBar />
      <SectionDivider variant="splash" />
      <HowItWorksSection />
      <SectionDivider variant="wave" label="Corridors" />
      <GlobalCorridorsSection />
      <SectionDivider variant="dots" />
      <BentoGrid />
      <SectionDivider variant="pulse" label="Storage" />
      <WalrusSection />
      <SectionDivider variant="wave" label="Compare" />
      <ComparisonSection />
      <SectionDivider variant="dots" />
      <BatchDashboardPreview />
      <SectionDivider variant="pulse" label="Compliance" />
      <ComplianceSection />
      <SectionDivider variant="splash" />
      <RoadmapSection />
      <SectionDivider variant="wave" label="Customers" />
      <CustomerSection />
      <SectionDivider variant="dots" />
      <TeamSection />
      <Footer />
    </main>
  );
}
