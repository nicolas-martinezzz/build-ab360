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
      className="bg-white py-16 sm:py-20 md:py-28"
      id={SITE_SECTION_IDS.solution}
    >
      <SectionContainer className="text-center">
        <h2
          className="mx-auto max-w-4xl text-xl font-semibold text-surface-bg [overflow-wrap:anywhere] sm:text-2xl md:text-3xl lg:text-4xl"
          id="simulab-title"
        >
          {t("headline")}
        </h2>

        <div className="relative mx-auto mt-10 max-w-5xl">
          <Image
            alt={t("imageAlt")}
            className="h-auto w-full"
            height={900}
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={SITE_ASSETS.simulab.dashboardMockup}
            width={1400}
          />
        </div>

        <ul className="mt-14 grid gap-10 text-center sm:gap-12 md:mt-16 md:grid-cols-3 md:gap-8">
          <li className="min-w-0 px-1">
            <h3 className="text-base font-bold text-surface-bg sm:text-lg">{t("feature1Title")}</h3>
            <p className="mt-3 text-sm text-grey-dark leading-relaxed sm:text-base">{t("feature1Body")}</p>
          </li>
          <li className="min-w-0 px-1">
            <h3 className="text-base font-bold text-surface-bg sm:text-lg">{t("feature2Title")}</h3>
            <p className="mt-3 text-sm text-grey-dark leading-relaxed sm:text-base">{t("feature2Body")}</p>
          </li>
          <li className="min-w-0 px-1">
            <h3 className="text-base font-bold text-surface-bg sm:text-lg">{t("feature3Title")}</h3>
            <p className="mt-3 text-sm text-grey-dark leading-relaxed sm:text-base">{t("feature3Body")}</p>
          </li>
        </ul>

        <div className="mt-12 flex justify-center px-1 md:mt-14">
          <LinkButton
            className="w-full max-w-sm min-h-12 px-8 sm:w-auto sm:min-w-[12rem]"
            href={SITE_PATHS.challenge}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-3 md:mt-16">
          <p className="text-sm text-grey-dark leading-relaxed sm:text-base">{t("closing1")}</p>
          <p className="text-sm font-bold text-green-600 leading-relaxed sm:text-base">{t("closing2")}</p>
        </div>
      </SectionContainer>
    </section>
  );
};
