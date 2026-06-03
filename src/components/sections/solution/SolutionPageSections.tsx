import { SolutionActorsSection } from "@/components/sections/solution/SolutionActorsSection";
import { SolutionAgentsSection } from "@/components/sections/solution/SolutionAgentsSection";
import { SolutionDiagnosticCta } from "@/components/sections/solution/SolutionDiagnosticCta";
import { SolutionHeroSection } from "@/components/sections/solution/SolutionHeroSection";
import { SolutionOpenlabSection } from "@/components/sections/solution/SolutionOpenlabSection";
import { SolutionPartnersBanner } from "@/components/sections/solution/SolutionPartnersBanner";
import { SolutionPlatformSection } from "@/components/sections/solution/SolutionPlatformSection";
import { SolutionSimulabSection } from "@/components/sections/solution/SolutionSimulabSection";

export const SolutionPageSections = () => (
  <>
    <SolutionHeroSection />
<SolutionSimulabSection />
    <SolutionOpenlabSection />
    <SolutionPlatformSection />
    <SolutionAgentsSection />
    <SolutionActorsSection />
    <SolutionDiagnosticCta />
    <SolutionPartnersBanner />
  </>
);
