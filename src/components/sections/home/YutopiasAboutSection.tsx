import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

export const YutopiasAboutSection = async () => {
  const t = await getTranslations("home.yutopiasAbout");

  return (
    <section
      aria-labelledby="yutopias-about-title"
      className="bg-surface-bg py-16 text-white sm:py-20 md:py-24"
      id={SITE_SECTION_IDS.about}
    >
      <SectionContainer>
        <div className="grid gap-12 md:grid-cols-2 md:items-start md:gap-14 lg:gap-20">
          <div className="min-w-0">
            <h2
              className="figma-text-l [overflow-wrap:anywhere]"
              id="yutopias-about-title"
            >
              <span className="text-white">{t("headlinePrefix")}</span>{" "}
              {t.rich("headlineBrand", {
                y: (chunks) => <span className="text-green-300">{chunks}</span>,
                s: (chunks) => <span className="text-green-500">{chunks}</span>,
              })}
            </h2>
            <p className="figma-text-l mt-5 max-w-xl text-white/95">
              {t.rich("subline", {
                accent: (chunks) => <span className="font-medium text-green-400">{chunks}</span>,
              })}
            </p>
            <LinkButton
              className="mt-8 min-h-12 w-full focus-visible:ring-offset-surface-bg sm:w-auto sm:min-w-[14rem]"
              href={SITE_PATHS.information}
              variant="primary"
            >
              {t("cta")}
            </LinkButton>
          </div>

          <div className="min-w-0 md:flex md:justify-end">
            <p className="max-w-md whitespace-pre-line border-white/90 text-base italic leading-6 text-white/95 md:border-r md:pr-8 md:text-right">
              {t("philosophy")}
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
