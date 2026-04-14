import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

const OpenlabFeatureIcon = () => (
  <svg
    aria-hidden
    className="size-12 shrink-0 text-green-600 sm:size-14"
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
        <blockquote className="border-l-4 border-green-600 pl-4 sm:pl-5">
          <p className="text-base text-green-600 italic leading-relaxed sm:text-lg">
            {t.rich("quote", {
              openlab: (chunks) => <strong className="font-bold not-italic">{chunks}</strong>,
            })}
          </p>
        </blockquote>

        <div className="mt-14 min-w-0 sm:mt-16 md:mt-20">
          <p className="type-eyebrow text-grey-dark">{t("pathLabel")}</p>
          <h2
            className="type-title mt-3 text-surface-bg [overflow-wrap:anywhere]"
            id="openlab-title"
          >
            <span className="block">{t("headlineLine1")}</span>
            <span className="mt-1 block">{t("headlineLine2")}</span>
            <span className="mt-1 block">{t("headlineLine3")}</span>
          </h2>
          <p className="type-body mt-7 max-w-3xl text-surface-bg sm:mt-8">
            {t("description")}
          </p>
          <p className="mt-4 text-base font-bold text-surface-bg sm:text-lg">{t("bootcampLead")}</p>

          <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-4">
            <LinkButton
              className="w-full min-h-12 justify-center sm:w-auto sm:min-w-[14rem]"
              href={SITE_PATHS.contact}
              variant="primary"
            >
              {t("ctaPrimary")}
            </LinkButton>
            <LinkButton
              className="w-full min-h-12 justify-center sm:w-auto sm:min-w-[14rem]"
              href={SITE_PATHS.challenge}
              variant="outline"
            >
              {t("ctaSecondary")}
            </LinkButton>
          </div>
        </div>

        <ul className="mt-16 grid list-none gap-12 p-0 sm:mt-20 md:mt-24 md:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:grid-cols-4">
          {featureKeys.map((key) => (
            <li key={key} className="min-w-0">
              <div className="flex flex-col gap-4">
                <OpenlabFeatureIcon />
                <h3 className="text-lg font-bold text-surface-bg leading-snug">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm text-grey-dark leading-relaxed sm:text-base">{t(`${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-base font-bold text-green-600 sm:mt-20 md:mt-24 sm:text-lg">{t("footerTagline")}</p>
      </SectionContainer>
    </section>
  );
};
