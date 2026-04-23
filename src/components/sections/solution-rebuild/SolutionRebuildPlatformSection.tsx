import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

export const SolutionRebuildPlatformSection = async () => {
  const t = await getTranslations("solutionPage.platform");

  return (
    <section className="section-block-spacious relative overflow-hidden bg-[#e6ebde]">
      <SectionContainer className="relative z-10">
        <p className="figma-text-l uppercase tracking-[0.1em] text-grey-dark">
          {t("eyebrow")}
        </p>

        <h2 className="mt-4 max-w-[56rem] text-[2rem] font-bold leading-[1.2] text-surface-bg sm:text-[2.25rem] md:text-[3rem]">
          {t("headline1")}
          <br />
          {t("headline2")}
        </h2>

        <p className="figma-text-l mt-6 max-w-[56rem] text-surface-bg">
          {t("body")}
        </p>

        <div className="relative mx-auto mt-10 aspect-[4/3] w-full max-w-[58rem] overflow-hidden">
          <Image
            alt=""
            aria-hidden
            className="object-contain"
            fill
            sizes="(max-width: 1024px) 90vw, 928px"
            src={SITE_ASSETS.solution.platformBuilding}
          />
        </div>

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,23.8125rem)] lg:gap-14">
          <div>
            <h3 className="text-[1.75rem] font-semibold leading-[1.25] text-surface-bg md:text-[1.875rem]">
              {t("twinTitle")}
            </h3>
            <p className="figma-text-l mt-4 max-w-[46.9375rem] text-surface-bg">
              {t("twinIntro")}{" "}
              <span className="font-bold text-green-500">{t("twinHighlight")}</span>
            </p>
            <div className="figma-text-m mt-6 max-w-[47.5rem] space-y-3 text-surface-bg">
              <p>{t("twinPara1")}</p>
              <p>{t("twinPara2")}</p>
            </div>
          </div>

          <div>
            <h3 className="text-[1.75rem] font-semibold leading-[1.25] text-surface-bg md:text-[1.875rem]">
              {t("connectedTitle")}
            </h3>
            <p className="figma-text-l mt-4 max-w-[23.8125rem] text-surface-bg">
              {t("connectedIntro")}
            </p>
            <p className="figma-text-m mt-6 max-w-[23.75rem] text-surface-bg">
              {t("connectedBody")}
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
