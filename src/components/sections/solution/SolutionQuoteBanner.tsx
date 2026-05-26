import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const SolutionQuoteBanner = async () => {
  const t = await getTranslations("solutionPage.quoteBanner");

  return (
    <section aria-label={t("line1")} className="section-band bg-white">
      <SectionContainer className="text-center">
        <div className="mx-auto max-w-[54.875rem]">
          <p className="figma-text-m text-surface-bg">
            {t("line1")}
          </p>
          <p className="figma-text-m font-bold text-surface-bg">
            {t("line2")}
          </p>
        </div>
      </SectionContainer>
    </section>
  );
};
