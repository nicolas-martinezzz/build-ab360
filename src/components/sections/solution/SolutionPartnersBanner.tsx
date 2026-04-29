import { getTranslations } from "next-intl/server";
import { PartnersCtaBanner } from "@/components/sections/PartnersCtaBanner";
import { SITE_ASSETS } from "@/config/assets";

export const SolutionPartnersBanner = async () => {
  const t = await getTranslations("solutionPage.partnersBanner");

  return (
    <PartnersCtaBanner
      backgroundSrc={SITE_ASSETS.solution.partnersBackground}
      cta={t("cta")}
      ctaWrapperClassName="md:mt-16"
      headline={t("headline")}
      taglineLine1={t("tagline1")}
      taglineLine2={t("tagline2")}
    />
  );
};
