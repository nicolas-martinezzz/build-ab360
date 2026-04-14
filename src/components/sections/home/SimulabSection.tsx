import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

export const SimulabSection = async () => {
  const t = await getTranslations("home.simulab");

  return (
    <section
      aria-labelledby="simulab-title"
      className="section-block-spacious bg-white"
      id={SITE_SECTION_IDS.solution}
    >
      <SectionContainer className="text-center">
        <h2
          className="figma-title-3 mx-auto max-w-4xl text-surface-bg [overflow-wrap:anywhere]"
          id="simulab-title"
        >
          {t("headline")}
        </h2>

        <div className="relative mx-auto mt-14 aspect-[1636/974] w-full max-w-5xl md:mt-16">
          <Image
            alt={t("imageAlt")}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={SITE_ASSETS.simulab.dashboardMockup}
          />
        </div>

        <ul className="mt-16 grid gap-12 text-center sm:gap-12 md:mt-24 md:grid-cols-3 md:gap-12">
          <li className="min-w-0 px-1">
            <h3 className="figma-text-l-bold text-surface-bg">{t("feature1Title")}</h3>
            <p className="mt-3 figma-text-l text-grey-dark">{t("feature1Body")}</p>
          </li>
          <li className="min-w-0 px-1">
            <h3 className="figma-text-l-bold text-surface-bg">{t("feature2Title")}</h3>
            <p className="mt-3 figma-text-l text-grey-dark">{t("feature2Body")}</p>
          </li>
          <li className="min-w-0 px-1">
            <h3 className="figma-text-l-bold text-surface-bg">{t("feature3Title")}</h3>
            <p className="mt-3 figma-text-l text-grey-dark">{t("feature3Body")}</p>
          </li>
        </ul>

        <div className="mt-14 flex justify-center px-1 md:mt-16">
          <LinkButton
            className="w-full max-w-sm min-h-12 px-8 sm:w-auto sm:min-w-[12rem]"
            href={SITE_PATHS.challenge}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-3 md:mt-20">
          <p className="figma-text-l text-grey-dark">{t("closing1")}</p>
          <p className="figma-text-l-bold text-green-600">{t("closing2")}</p>
        </div>
      </SectionContainer>
    </section>
  );
};
