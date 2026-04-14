import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const SimulationChoiceBanner = async () => {
  const t = await getTranslations("home.simulationChoiceBanner");

  return (
    <section aria-label={t("regionAria")} className="section-band bg-green-100">
      <SectionContainer>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12 lg:gap-16">
          <p className="type-body max-w-xl text-surface-bg [overflow-wrap:anywhere] md:max-w-[min(100%,28rem)] lg:max-w-md">
            {t("left")}
          </p>
          <div className="flex min-w-0 shrink-0 flex-col items-start md:items-end md:text-right">
            <p className="text-xl font-bold text-surface-bg [overflow-wrap:anywhere] sm:text-2xl md:text-[1.75rem]">
              {t("rightLine1")}
            </p>
            <p className="mt-1 text-xl font-bold text-green-600 [overflow-wrap:anywhere] sm:text-2xl md:text-[1.75rem]">
              {t("rightLine2")}
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
