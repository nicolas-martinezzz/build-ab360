import { getLocale, getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, getBootcampPathByLocale } from "@/config/routes";

const IconCalendar = () => (
  <svg fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
    <rect height="13.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" width="15" x="1.5" y="3" />
    <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 1.5v3M12 1.5v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

const IconEuro = () => (
  <svg fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11.25 6.375A3 3 0 1 0 11.25 11.625" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    <path d="M5.25 8.25h4.5M5.25 9.75h4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

const IconUsers = () => (
  <svg fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7.5" cy="5.25" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1.5 15.75a6 6 0 0 1 12 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    <path d="M13.5 3.75a3 3 0 0 1 0 6M16.5 15.75a6 6 0 0 0-3-5.196" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

const statIcons = [<IconCalendar key="cal" />, <IconEuro key="eur" />, <IconUsers key="usr" />];

export const SolutionOpenlabSection = async () => {
  const [t, locale] = await Promise.all([
    getTranslations("solutionPage.openlab"),
    getLocale(),
  ]);

  return (
    <section aria-labelledby="solution-openlab-title" className="section-block-spacious bg-white">
      <SectionContainer>

        {/* Main — 2-col at lg */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <h2 className="figma-title-2-bold text-surface-bg" id="solution-openlab-title">
              {t("headline")}
            </h2>
            <div className="flex flex-wrap gap-4">
              {(["stat1", "stat2", "stat3"] as const).map((key, i) => (
                <span key={key} className="figma-text-m flex items-center gap-2 text-surface-bg">
                  <span className="text-green-500">{statIcons[i]}</span>
                  {t(key)}
                </span>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-center gap-6">
            <p className="figma-text-l text-surface-bg">
              {t.rich("body", {
                lasalle: (chunks) => (
                  <a
                    className="underline underline-offset-2 hover:opacity-80"
                    href="https://www.salleurl.edu/es/la-salle-y-la-investigacion"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {chunks}
                  </a>
                ),
                accio: (chunks) => (
                  <a
                    className="underline underline-offset-2 hover:opacity-80"
                    href="https://www.accio.gencat.cat/ca/serveis/innovacio/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <LinkButton href={SITE_PATHS.contact} variant="primary">
                {t("ctaPrimary")}
              </LinkButton>
              <LinkButton href={getBootcampPathByLocale(locale)} variant="text">
                {t("ctaSecondary")}
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Bootcamp card */}
        <div className="mt-10 rounded-[10px] border border-surface-bg/10 bg-surface-bg/5 p-6 md:mt-12 md:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="figma-text-l text-surface-bg">
              {t("bootcampLead").split("Ven al Bootcamp Zero")[0]}
              <strong>{"Ven al Bootcamp Zero."}</strong>
            </p>
            <span className="figma-text-m rounded border border-surface-bg/20 bg-white px-2.5 py-0.5 text-surface-bg">
              {t("bootcampBadge")}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            {(["bootcampStat1", "bootcampStat2", "bootcampStat3"] as const).map((key, i) => (
              <span key={key} className="figma-text-m flex items-center gap-2 text-surface-bg">
                <span className="text-green-500">{statIcons[i]}</span>
                {t(key)}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
            <p className="figma-text-l max-w-[45rem] text-grey-dark">{t("bootcampBody")}</p>
            <div className="flex flex-col items-start gap-3 lg:items-end lg:justify-center">
              <LinkButton href={getBootcampPathByLocale(locale)} variant="outline">
                {t("bootcampCtaPrimary")}
              </LinkButton>
              <LinkButton href={SITE_PATHS.programa} variant="text">
                {t("bootcampCtaSecondary")}
              </LinkButton>
            </div>
          </div>
        </div>

      </SectionContainer>
    </section>
  );
};
