import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

export const SolutionRebuildOpenlabSection = async () => {
  const t = await getTranslations("solutionPage.openlab");

  return (
    <section className="section-block-spacious bg-white">
      <SectionContainer>
        <div className="flex max-w-[53.8125rem] flex-col gap-4">
          <p className="figma-text-l text-grey-dark">{t("eyebrow")}</p>

          <h2 className="figma-title-2 text-surface-bg">{t("headline")}</h2>

          <p className="figma-text-l whitespace-pre-line text-surface-bg">{t("body")}</p>

          <p className="figma-text-l-bold text-surface-bg">{t("bootcampLead")}</p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <LinkButton
              className="h-[45px] px-5 text-base font-medium leading-[1.4]"
              href={SITE_PATHS.contact}
              variant="primary"
            >
              {t("ctaPrimary")}
            </LinkButton>
            <LinkButton
              className="h-[45px] px-5 text-base font-medium leading-[1.4]"
              href={SITE_PATHS.contact}
              variant="outline"
            >
              {t("ctaSecondary")}
            </LinkButton>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
