import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

const OpenlabFeatureIcon = () => (
  <svg
    aria-hidden
    className="size-[3.1875rem] shrink-0 text-green-600"
    fill="none"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 16V4h12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    <path d="M44 16V4H32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    <path d="M4 32v12h12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    <path d="M44 32v12H32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    <circle cx="22" cy="22" r="7" stroke="currentColor" strokeWidth="1.75" />
    <path d="M27 27l8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
  </svg>
);

export const OpenlabSection = async () => {
  const t = await getTranslations("home.openlab");

  const featureKeys = ["col1", "col2", "col3", "col4"] as const;

  return (
    <section
      aria-labelledby="openlab-title"
      className="section-block-spacious bg-white"
      id={SITE_SECTION_IDS.program}
    >
      <SectionContainer>
        <blockquote className="border-l-2 border-green-600 pl-5">
          <p className="figma-text-l text-green-600 italic">
            {t.rich("quote", {
              openlab: (chunks) => <strong className="font-bold not-italic">{chunks}</strong>,
            })}
          </p>
        </blockquote>

        <div className="mt-20 min-w-0 md:mt-24">
          <p className="figma-text-l uppercase text-grey-dark">{t("pathLabel")}</p>
          <h2
            className="figma-title-2-bold mt-7 text-surface-bg [overflow-wrap:anywhere]"
            id="openlab-title"
          >
            <span className="block">{t("headlineLine1")}</span>
            <span className="mt-1 block">{t("headlineLine2")}</span>
            <span className="mt-1 block">{t("headlineLine3")}</span>
          </h2>
          <p className="figma-text-l mt-5 max-w-[42.75rem] leading-relaxed text-surface-bg">
            {t("description")}
          </p>
          <p className="mt-[0.5625rem] figma-text-l-bold text-surface-bg">{t("bootcampLead")}</p>

          <div className="mt-[1.1875rem] flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <LinkButton
              className="w-full justify-center sm:w-auto"
              href={SITE_PATHS.contact}
              variant="primary"
            >
              {t("ctaPrimary")}
            </LinkButton>
            <LinkButton
              className="w-full justify-center sm:w-auto"
              href={SITE_PATHS.challenge}
              variant="outline"
            >
              {t("ctaSecondary")}
            </LinkButton>
          </div>
        </div>

        <ul className="mt-[4.25rem] grid list-none gap-10 p-0 md:auto-rows-fr md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4 lg:items-start lg:gap-8">
          {featureKeys.map((key) => (
            <li key={key} className="min-w-0 lg:h-full">
              <div className="flex flex-col gap-2 md:h-full">
                <OpenlabFeatureIcon />
                <h3 className="pt-5 text-[1.18rem] font-bold leading-[1.22] text-surface-bg md:min-h-[4.5rem]">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-[0.96rem] leading-[1.45] text-grey-dark md:min-h-[7rem]">{t(`${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-12 figma-text-l-bold text-green-600">{t("footerTagline")}</p>
      </SectionContainer>
    </section>
  );
};
