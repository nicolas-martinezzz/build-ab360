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
          className="figma-title-3 mx-auto max-w-[49.5rem] text-surface-bg [overflow-wrap:anywhere]"
          id="simulab-title"
        >
          {t("headline")}
        </h2>

        <div className="relative mx-auto mt-11 aspect-[1636/974] w-full max-w-[51.125rem]">
          <Image
            alt={t("imageAlt")}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={SITE_ASSETS.simulab.dashboardMockup}
          />
        </div>

        <ul className="mt-[5.75rem] grid gap-10 text-center sm:grid-cols-3">
          <li className="min-w-0 px-1">
            <h3 className="figma-text-l-bold text-surface-bg">{t("feature1Title")}</h3>
            <p className="mt-1 figma-text-l text-grey-dark">{t("feature1Body")}</p>
          </li>
          <li className="min-w-0 px-1">
            <h3 className="figma-text-l-bold text-surface-bg">{t("feature2Title")}</h3>
            <p className="mt-1 figma-text-l text-grey-dark">{t("feature2Body")}</p>
          </li>
          <li className="min-w-0 px-1">
            <h3 className="figma-text-l-bold text-surface-bg">{t("feature3Title")}</h3>
            <p className="mt-1 figma-text-l text-grey-dark">{t("feature3Body")}</p>
          </li>
        </ul>

        <div className="mt-[2.875rem] flex justify-center px-1">
          <LinkButton
            className="w-full max-w-sm sm:w-auto"
            href={SITE_PATHS.challenge}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </div>

        <div className="mx-auto mt-[6.5rem] max-w-[57.375rem] space-y-0.5">
          <p className="figma-text-l text-grey-dark">{t("closing1")}</p>
          <p className="figma-text-l-bold text-green-600">{t("closing2")}</p>
        </div>
      </SectionContainer>
    </section>
  );
};
