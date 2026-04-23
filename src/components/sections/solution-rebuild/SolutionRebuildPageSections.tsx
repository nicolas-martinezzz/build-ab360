import { SolutionRebuildActorsSection } from "./SolutionRebuildActorsSection";
import { SolutionRebuildAgentsSection } from "./SolutionRebuildAgentsSection";
import { SolutionRebuildDiagnosticCta } from "./SolutionRebuildDiagnosticCta";
import { SolutionRebuildHeroSection } from "./SolutionRebuildHeroSection";
import { SolutionRebuildOpenlabSection } from "./SolutionRebuildOpenlabSection";
import { SolutionRebuildPartnersBanner } from "./SolutionRebuildPartnersBanner";
import { SolutionRebuildPlatformSection } from "./SolutionRebuildPlatformSection";
import { SolutionRebuildQuoteBanner } from "./SolutionRebuildQuoteBanner";
import { SolutionRebuildSimulabSection } from "./SolutionRebuildSimulabSection";

export const SolutionRebuildPageSections = () => (
  <>
    <SolutionRebuildHeroSection />
    <SolutionRebuildQuoteBanner />
    <SolutionRebuildSimulabSection />
    <SolutionRebuildOpenlabSection />
    <SolutionRebuildPlatformSection />
    <SolutionRebuildAgentsSection />
    <SolutionRebuildActorsSection />
    <SolutionRebuildDiagnosticCta />
    <SolutionRebuildPartnersBanner />
  </>
);
