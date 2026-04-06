import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const IntroStripSection = async () => {
  const t = await getTranslations("home.introStrip");

  return (
    <section
      aria-label={t("regionAria")}
      className="bg-green-100 py-12 sm:py-14 md:py-16"
    >
      <SectionContainer>
        <div className="grid gap-10 md:grid-cols-2 md:items-start md:justify-between md:gap-x-16 lg:gap-x-24">
          <div
            className="intro-verse-col-left max-w-xl border-l-2 border-green-500/25 pl-5 text-left text-[1.05rem] leading-[1.75] tracking-[0.01em] text-surface-bg sm:text-base sm:leading-[1.8]"
          >
            <p className="intro-verse-line">{t("leftLine1")}</p>
            <p className="intro-verse-line">{t("leftLine2")}</p>
            <p className="intro-verse-line">{t("leftLine3")}</p>
            <p className="intro-verse-line">{t("leftLine4")}</p>
            <p className="intro-verse-line pt-2 font-bold text-black">{t("leftLine5")}</p>
            <p className="intro-verse-line font-bold text-black">{t("leftLine6")}</p>
          </div>
          <div
            className="intro-verse-col-right max-w-md border-l-2 border-green-500/35 pl-5 text-left text-[1.05rem] leading-[1.75] tracking-[0.01em] text-surface-bg sm:text-base sm:leading-[1.8] md:max-w-lg md:justify-self-end"
          >
            <p className="intro-verse-line">{t("rightLine1")}</p>
            <p className="intro-verse-line font-bold text-green-500">{t("rightLine2")}</p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
