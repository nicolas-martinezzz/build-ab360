import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

export const SolutionPlatformSection = async () => {
  const t = await getTranslations("solutionPage.platform");

  return (
    <section aria-labelledby="solution-platform-title" className="section-block-spacious relative overflow-hidden bg-agent-surface !pt-5 !pb-7 lg:!pt-7 lg:!pb-9">
      <SectionContainer className="relative z-10">
        <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>

        <h2 className="figma-title-2-bold mt-3 max-w-[56rem] text-surface-bg" id="solution-platform-title">
          {t("headline1")}
          <br />
          {t("headline2")}
        </h2>

        <p className="figma-text-l mt-3 max-w-[56rem] text-surface-bg">
          {t("body")}
        </p>

        <div className="relative mx-auto mt-5 aspect-[4/3] w-full max-w-[56rem] overflow-hidden">
          <Image
            alt=""
            aria-hidden
            className="object-contain"
            fill
            sizes="(max-width: 1024px) 90vw, 928px"
            src={SITE_ASSETS.solution.platformBuilding}
          />
        </div>

        <div className="mt-7 grid gap-12 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,23.8125rem)] lg:gap-14">
          <div>
            <h3 className="figma-title-3 text-surface-bg">
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
            <h3 className="figma-title-3 text-surface-bg">
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
