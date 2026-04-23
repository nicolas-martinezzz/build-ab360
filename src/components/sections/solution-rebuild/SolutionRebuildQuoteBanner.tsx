import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const SolutionRebuildQuoteBanner = async () => {
  const t = await getTranslations("solutionPage.quoteBanner");

  return (
    <section className="bg-white py-12 md:py-16">
      <SectionContainer className="text-center">
        <div className="mx-auto max-w-[54.875rem]">
          <p className="text-sm leading-[1.44] text-surface-bg md:text-base">
            {t("line1")}
          </p>
          <p className="text-sm font-bold leading-[1.34] text-surface-bg md:text-base">
            {t("line2")}
          </p>
        </div>
      </SectionContainer>
    </section>
  );
};
