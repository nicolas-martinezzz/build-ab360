import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const SolutionQuoteBanner = async () => {
  const t = await getTranslations("solutionPage.quoteBanner");

  return (
    <section aria-label={t("line1")} className="section-band bg-white">
      <SectionContainer className="text-center">
        <p className="figma-title-3 mx-auto max-w-[54.875rem] font-normal text-surface-bg">
          {t("line1")}
          <br />
          <span className="font-semibold">{t("line2")}</span>
        </p>
      </SectionContainer>
    </section>
  );
};
