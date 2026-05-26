import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

export const YutopiasAboutSection = async () => {
  const t = await getTranslations("home.yutopiasAbout");

  return (
    <section
      aria-labelledby="yutopias-about-title"
      className="section-block bg-surface-bg text-white md:min-h-[31.875rem]"
      id={SITE_SECTION_IDS.about}
    >
      <SectionContainer>
        <div className="grid gap-12 lg:grid-cols-[1fr_23.5rem] lg:items-start">
          <div className="min-w-0">
            <h2 className="figma-title-3 font-normal [overflow-wrap:anywhere]" id="yutopias-about-title">
              <span className="text-white">{t("headlinePrefix")}</span>{" "}
              {t.rich("headlineBrand", {
                y: (chunks) => <span className="text-green-300">{chunks}</span>,
                s: (chunks) => <span className="text-green-500">{chunks}</span>,
              })}
            </h2>
            <p className="figma-text-l mt-1 max-w-[49.8125rem] text-white/95">
              {t.rich("subline", {
                accent: (chunks) => <span className="font-medium text-green-400">{chunks}</span>,
              })}
            </p>
            <LinkButton
              className="mt-[1.9375rem] w-full focus-visible:ring-offset-surface-bg sm:w-auto"
              href={SITE_PATHS.information}
              variant="primary"
            >
              {t("cta")}
            </LinkButton>
          </div>

          <div className="min-w-0 lg:flex lg:justify-end lg:pt-[0.125rem]">
            <p className="figma-text-m max-w-[23.5rem] whitespace-pre-line border-white/90 italic text-white/95 lg:border-r lg:pr-5 lg:text-right">
              {t("philosophy")}
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
