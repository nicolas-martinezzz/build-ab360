import { AboutCtaBannerSection } from "@/components/sections/about/AboutCtaBannerSection";
import { AboutEcosystemSection } from "@/components/sections/about/AboutEcosystemSection";
import { AboutFoundersSection } from "@/components/sections/about/AboutFoundersSection";
import { AboutHeroSection } from "@/components/sections/about/AboutHeroSection";
import { AboutIntroSection } from "@/components/sections/about/AboutIntroSection";
import { AboutPrinciplesSection } from "@/components/sections/about/AboutPrinciplesSection";
import { AboutTeamSection } from "@/components/sections/about/AboutTeamSection";
import { AboutVisionSection } from "@/components/sections/about/AboutVisionSection";

export const AboutPageSections = () => (
  <>
    <AboutHeroSection />
    <AboutIntroSection />
    <AboutVisionSection />
    <AboutPrinciplesSection />
    <AboutFoundersSection />
    <AboutTeamSection />
    <AboutEcosystemSection />
    <AboutCtaBannerSection />
  </>
);
