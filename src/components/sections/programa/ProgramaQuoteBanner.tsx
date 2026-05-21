import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const ProgramaQuoteBanner = async () => {
  const t = await getTranslations("programaPage.quoteBanner");

  return (
    <section aria-labelledby="programa-quote-banner-title" className="bg-surface-bg py-16 md:py-20 lg:py-24">
      <SectionContainer>
        <div className="max-w-[44rem]">
          <p className="type-eyebrow text-white/75">{t("eyebrow")}</p>

          <h2 className="figma-title-2-bold mt-3 text-white" id="programa-quote-banner-title">
            {t("headlineLine1")}
            <br />
            {t("headlineLine2")}
            <br />
            {t("headlineLine3")}
          </h2>

          <p className="figma-text-l mt-8 max-w-[30rem] text-white/85">{t("sublead")}</p>

          <div className="figma-text-m mt-6 max-w-[37rem] space-y-3 text-white/75">
            <p>{t("paragraph1")}</p>
            <p>{t("paragraph2")}</p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
