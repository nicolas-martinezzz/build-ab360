import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

const OpenlabFeatureIcon = () => (
  <svg
    aria-hidden
    className="size-11 shrink-0 text-green-600"
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
      className="bg-white py-16 sm:py-20 md:py-28"
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

        <div className="mt-12 min-w-0 sm:mt-14 md:mt-16">
          <p className="text-xs font-medium uppercase tracking-wide text-grey-dark sm:text-sm">{t("pathLabel")}</p>
          <h2
            className="mt-3 text-2xl font-bold text-surface-bg [overflow-wrap:anywhere] sm:text-3xl md:text-4xl"
            id="openlab-title"
          >
            <span className="block">{t("headlineLine1")}</span>
            <span className="mt-1 block">{t("headlineLine2")}</span>
            <span className="mt-1 block">{t("headlineLine3")}</span>
          </h2>
          <p className="mt-5 max-w-3xl text-base text-surface-bg leading-relaxed sm:mt-6 sm:text-lg">
            {t("description")}
          </p>
          <p className="mt-4 text-base font-bold text-surface-bg sm:text-lg">{t("bootcampLead")}</p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
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

        <ul className="mt-14 grid list-none gap-10 p-0 sm:mt-16 md:mt-20 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-4">
          {featureKeys.map((key) => (
            <li key={key} className="min-w-0">
              <div className="flex flex-col gap-4">
                <OpenlabFeatureIcon />
                <h3 className="text-base font-bold text-surface-bg leading-snug sm:text-lg">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm text-grey-dark leading-relaxed sm:text-base">{t(`${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-14 text-base font-bold text-green-600 sm:mt-16 md:mt-20 sm:text-lg">{t("footerTagline")}</p>
      </SectionContainer>
    </section>
  );
};
