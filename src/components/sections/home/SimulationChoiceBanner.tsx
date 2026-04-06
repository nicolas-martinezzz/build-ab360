import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const SimulationChoiceBanner = async () => {
  const t = await getTranslations("home.simulationChoiceBanner");

  return (
    <section aria-label={t("regionAria")} className="bg-green-100 py-12 sm:py-16 md:py-20">
      <SectionContainer>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12 lg:gap-16">
          <p className="max-w-xl text-base text-surface-bg leading-relaxed [overflow-wrap:anywhere] sm:text-lg md:max-w-[min(100%,28rem)] lg:max-w-md">
            {t("left")}
          </p>
          <div className="flex min-w-0 shrink-0 flex-col items-start md:items-end md:text-right">
            <p className="text-lg font-bold text-surface-bg [overflow-wrap:anywhere] sm:text-xl md:text-2xl">
              {t("rightLine1")}
            </p>
            <p className="mt-1 text-lg font-bold text-green-600 [overflow-wrap:anywhere] sm:text-xl md:text-2xl">
              {t("rightLine2")}
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
