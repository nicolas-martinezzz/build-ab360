import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const IntroStripSection = async () => {
  const t = await getTranslations("home.introStrip");

  return (
    <section
      aria-label={t("regionAria")}
      className="bg-green-100 py-12 md:min-h-[19.375rem] md:py-[3.375rem]"
    >
      <SectionContainer>
        <div className="grid gap-10 md:grid-cols-2 md:items-start md:justify-between md:gap-x-20">
          <div
            className="intro-verse-col-left max-w-[29.2rem] text-left text-[1.25rem] leading-[1.44] text-black"
          >
            <p className="intro-verse-line">{t("leftLine1")}</p>
            <p className="intro-verse-line">{t("leftLine2")}</p>
            <p className="intro-verse-line">{t("leftLine3")}</p>
            <p className="intro-verse-line">{t("leftLine4")}</p>
            <p className="intro-verse-line pt-5 figma-text-l-bold text-black">{t("leftLine5")}</p>
            <p className="intro-verse-line figma-text-l-bold text-black">{t("leftLine6")}</p>
          </div>
          <div
            className="intro-verse-col-right max-w-[29.2rem] text-left text-[1.25rem] leading-[1.44] text-black md:justify-self-end md:text-right"
          >
            <p className="intro-verse-line">{t("rightLine1")}</p>
            <p className="intro-verse-line figma-text-l-bold text-green-500">{t("rightLine2")}</p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
