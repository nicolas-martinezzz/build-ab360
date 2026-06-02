import { Ab360PlatformSection } from "@/components/sections/home/Ab360PlatformSection";
import { BlogResourcesSection } from "@/components/sections/home/BlogResourcesSection";
import { ClosingStandardCtaSection } from "@/components/sections/home/ClosingStandardCtaSection";
import { IntroStripSection } from "@/components/sections/home/IntroStripSection";
import { OpenlabContactSection } from "@/components/sections/home/OpenlabContactSection";
import { OpenlabSection } from "@/components/sections/home/OpenlabSection";
import { PartnersBanner } from "@/components/sections/home/PartnersBanner";
import { PartnersBootcampCtaSection } from "@/components/sections/home/PartnersBootcampCtaSection";
import { SimulationChoiceBanner } from "@/components/sections/home/SimulationChoiceBanner";
import { SimulabSection } from "@/components/sections/home/SimulabSection";
import { TestimonialsSection } from "@/components/sections/home/TestimonialsSection";
import { YutopiasAboutSection } from "@/components/sections/home/YutopiasAboutSection";

/**
 * Ordered composition of the locale home page below the hero.
 * New marketing sections for `/` belong here; standalone routes get their own `page.tsx`.
 */
export const HomePageSections = () => (
  <>
    <IntroStripSection />
    <SimulabSection />
    <PartnersBanner />
    <OpenlabSection />
    <OpenlabContactSection />
    <SimulationChoiceBanner />
    <PartnersBootcampCtaSection />
    <Ab360PlatformSection />
    <TestimonialsSection />
    <BlogResourcesSection />
    <YutopiasAboutSection />
    <ClosingStandardCtaSection />
  </>
);
