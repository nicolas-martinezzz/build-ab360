import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

export const SimulabSection = async () => {
  const t = await getTranslations("home.simulab");

  return (
    <section
      aria-labelledby="simulab-title"
      className="section-block bg-white"
      id={SITE_SECTION_IDS.solution}
    >
      <SectionContainer className="text-center">
        <h2
          className="figma-title-3 mx-auto max-w-[49.5rem] text-surface-bg [overflow-wrap:anywhere]"
          id="simulab-title"
        >
          {t.rich("headline", { b: (chunks) => <strong>{chunks}</strong> })}
        </h2>

        <div className="relative mx-auto mt-8 w-full max-w-[51.125rem] overflow-hidden rounded-xl">
          <iframe
            className="h-[20rem] w-full sm:h-[26rem] lg:h-[32rem]"
            loading="lazy"
            src="/simulab-teaser.html"
            title={t("imageAlt")}
          />
        </div>

        <div className="mt-12 flex justify-center px-1">
          <div className="flex flex-col items-center">
            <LinkButton
              className="w-full max-w-sm px-8 sm:w-auto"
              href={SITE_PATHS.solution}
              variant="primary"
            >
              {t("cta")}
            </LinkButton>
            <p className="figma-text-m mt-4 italic text-grey-dark">{t("ctaHint")}</p>
          </div>
        </div>

        <ul className="mt-10 grid gap-8 text-center sm:mt-12 sm:grid-cols-3">
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

        <div className="mx-auto mt-24 max-w-[57.375rem] space-y-0.5">
          <p className="figma-text-l text-grey-dark">{t("closing1")}</p>
          <p className="figma-text-l-bold text-green-600">{t("closing2")}</p>
        </div>
      </SectionContainer>
    </section>
  );
};
