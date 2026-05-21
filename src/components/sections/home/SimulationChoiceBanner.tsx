import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const SimulationChoiceBanner = async () => {
  const t = await getTranslations("home.simulationChoiceBanner");

  return (
    <section
      aria-label={t("regionAria")}
      className="section-band bg-green-100 md:min-h-[16.9375rem]"
    >
      <SectionContainer>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
          <p className="figma-text-l max-w-[36.5rem] text-black [overflow-wrap:anywhere]">
            {t("left")}
          </p>
          <div className="flex min-w-0 shrink-0 flex-col items-start md:items-end md:text-right">
            <p className="figma-text-l-bold text-black [overflow-wrap:anywhere]">
              {t("rightLine1")}
            </p>
            <p className="mt-1 figma-text-l-bold text-green-600 [overflow-wrap:anywhere]">
              {t("rightLine2")}
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
