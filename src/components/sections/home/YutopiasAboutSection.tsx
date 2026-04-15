import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

export const YutopiasAboutSection = async () => {
  const t = await getTranslations("home.yutopiasAbout");

  return (
    <section
      aria-labelledby="yutopias-about-title"
      className="bg-surface-bg py-16 text-white md:min-h-[31.875rem] md:py-[7.5rem]"
      id={SITE_SECTION_IDS.about}
    >
      <SectionContainer>
        <div className="grid gap-12 md:grid-cols-[49.8125rem_23.5rem] md:items-start md:justify-between md:gap-0">
          <div className="min-w-0">
            <h2 className="text-[1.25rem] font-normal leading-[1.44] [overflow-wrap:anywhere]" id="yutopias-about-title">
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
              className="mt-[1.9375rem] h-[45px] w-full px-5 text-base font-medium leading-[1.4] focus-visible:ring-offset-surface-bg sm:w-auto"
              href={SITE_PATHS.information}
              variant="primary"
            >
              {t("cta")}
            </LinkButton>
          </div>

          <div className="min-w-0 md:flex md:justify-end md:pt-[0.125rem]">
            <p className="max-w-[23.5rem] whitespace-pre-line border-white/90 text-base italic leading-6 text-white/95 md:border-r md:pr-5 md:text-right">
              {t("philosophy")}
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
