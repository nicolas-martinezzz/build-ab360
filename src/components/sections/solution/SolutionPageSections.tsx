import { SolutionActorsSection } from "@/components/sections/solution/SolutionActorsSection";
import { SolutionAgentsSection } from "@/components/sections/solution/SolutionAgentsSection";
import { SolutionDiagnosticCta } from "@/components/sections/solution/SolutionDiagnosticCta";
import { SolutionHeroSection } from "@/components/sections/solution/SolutionHeroSection";
import { SolutionOpenlabSection } from "@/components/sections/solution/SolutionOpenlabSection";
import { SolutionPartnersBanner } from "@/components/sections/solution/SolutionPartnersBanner";
import { SolutionPlatformSection } from "@/components/sections/solution/SolutionPlatformSection";
import { SolutionQuoteBanner } from "@/components/sections/solution/SolutionQuoteBanner";
import { SolutionSimulabSection } from "@/components/sections/solution/SolutionSimulabSection";

export const SolutionPageSections = () => (
  <>
    <SolutionHeroSection />
    <div className="bg-surface-bg px-4 pb-14 sm:px-6 lg:px-8 xl:px-0">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl shadow-2xl">
        <iframe
          className="h-[32rem] w-full sm:h-[40rem] lg:h-[46rem]"
          loading="lazy"
          src="/simulab-demo.html"
          title="Demo interactiva de SimuLab"
        />
      </div>
    </div>
    <SolutionQuoteBanner />
    <SolutionSimulabSection />
    <SolutionOpenlabSection />
    <SolutionPlatformSection />
    <SolutionAgentsSection />
    <SolutionActorsSection />
    <SolutionDiagnosticCta />
    <SolutionPartnersBanner />
  </>
);
