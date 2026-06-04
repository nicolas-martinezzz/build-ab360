import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

const OPENLAB_ICONS = [
  // col1 — database
  <svg key="database" aria-hidden className="size-[3.1875rem] shrink-0 text-green-500" fill="none" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 16.6667C35.3553 16.6667 43.75 13.8685 43.75 10.4167C43.75 6.96497 35.3553 4.16675 25 4.16675C14.6447 4.16675 6.25 6.96497 6.25 10.4167C6.25 13.8685 14.6447 16.6667 25 16.6667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.25 10.4167V39.5834C6.25 41.241 8.22544 42.8307 11.7417 44.0028C15.2581 45.1749 20.0272 45.8334 25 45.8334C29.9728 45.8334 34.7419 45.1749 38.2582 44.0028C41.7746 42.8307 43.75 41.241 43.75 39.5834V10.4167" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.25 25C6.25 26.6576 8.22544 28.2473 11.7417 29.4194C15.2581 30.5915 20.0272 31.25 25 31.25C29.9728 31.25 34.7419 30.5915 38.2583 29.4194C41.7746 28.2473 43.75 26.6576 43.75 25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // col2 — sliders-horizontal
  <svg key="sliders" aria-hidden className="size-[3.1875rem] shrink-0 text-green-500" fill="none" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.8333 10.4167H6.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 39.5833H6.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M29.167 6.25V14.5833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M33.333 35.4167V43.7501" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M43.75 25H25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M43.7497 39.5833H33.333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M43.7503 10.4167H29.167" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.667 20.8333V29.1666" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.6667 25H6.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // col3 — leaf
  <svg key="leaf" aria-hidden className="size-[3.1875rem] shrink-0 text-green-500" fill="none" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.9166 41.6668C19.2584 41.6778 15.7296 40.3136 13.0302 37.8447C10.3307 35.3758 8.65778 31.9825 8.34314 28.3378C8.02849 24.6931 9.09512 21.0633 11.3315 18.1683C13.5679 15.2733 16.8106 13.3245 20.4166 12.7084C32.2916 10.4167 35.4166 9.33342 39.5833 4.16675C41.6666 8.33342 43.7499 12.8751 43.7499 20.8334C43.7499 32.2918 33.7916 41.6668 22.9166 41.6668Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.16699 43.75C4.16699 37.5 8.02116 32.5833 14.7503 31.25C19.792 30.25 25.0003 27.0833 27.0837 25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // col4 — circle-check-big
  <svg key="check" aria-hidden className="size-[3.1875rem] shrink-0 text-green-500" fill="none" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M45.4191 20.8334C46.3705 25.5028 45.6925 30.3572 43.4979 34.5872C41.3034 38.8171 37.7251 42.1669 33.3597 44.0778C28.9944 45.9888 24.1058 46.3455 19.5093 45.0884C14.9128 43.8313 10.8861 41.0363 8.1009 37.1697C5.31566 33.3031 3.94017 28.5985 4.2038 23.8405C4.46742 19.0825 6.35424 14.5586 9.5496 11.0234C12.745 7.48812 17.0557 5.15516 21.763 4.41354C26.4702 3.67193 31.2895 4.56648 35.417 6.94802" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.75 22.9166L25 29.1666L45.8333 8.33325" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
] as const;

export const OpenlabSection = async () => {
  const t = await getTranslations("home.openlab");

  const featureKeys = ["col1", "col2", "col3", "col4"] as const;

  return (
    <section
      aria-labelledby="openlab-title"
      className="section-block bg-white"
      id={SITE_SECTION_IDS.program}
    >
      <SectionContainer>
        <div className="min-w-0">
          <p className="type-eyebrow text-grey-dark">{t("pathLabel")}</p>
          <h2
            className="figma-title-2-bold mt-4 text-surface-bg [overflow-wrap:anywhere]"
            id="openlab-title"
          >
            <span className="block">{t("headlineLine1")}</span>
            <span className="block">{t("headlineLine2")}</span>
            <span className="mt-2 block">{t("headlineLine3")}</span>
            <span className="block">{t("headlineLine4")}</span>
          </h2>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5 figma-text-m text-surface-bg">
              <svg aria-hidden className="size-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {t("stat1")}
            </span>
            <span className="inline-flex items-center gap-1.5 figma-text-m text-surface-bg">
              <svg aria-hidden className="size-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {t("stat2")}
            </span>
            <span className="inline-flex items-center gap-1.5 figma-text-m text-surface-bg">
              <svg aria-hidden className="size-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {t("stat3")}
            </span>
          </div>

          <p className="figma-text-l mt-4 max-w-[42.75rem] leading-relaxed text-surface-bg">
            {t("description")}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <LinkButton
              className="w-full justify-center sm:w-auto"
              href={`#${SITE_SECTION_IDS.openlabContact}`}
              variant="primary"
            >
              {t("ctaPrimary")}
            </LinkButton>
            <Link
              className="inline-flex items-center text-surface-bg underline underline-offset-4 transition-opacity hover:opacity-70"
              href={SITE_PATHS.reservaPlaza}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>

        <ul className="mt-14 grid list-none gap-10 p-0 md:auto-rows-fr md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4 lg:items-start lg:gap-8">
          {featureKeys.map((key, i) => (
            <li key={key} className="min-w-0 lg:h-full">
              <div className="flex flex-col gap-2 md:h-full">
                {OPENLAB_ICONS[i]}
                <h3 className="figma-text-l-bold pt-5 text-surface-bg">
                  {t(`${key}.title`)}
                </h3>
                <p className="figma-text-m text-grey-dark">{t(`${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-12 figma-text-l-bold text-green-600">{t("footerTagline")}</p>

        {/* Bootcamp Zero card */}
        <div className="mt-10 rounded-xl border border-grey-light bg-surface-light p-6 sm:p-8 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
            <div className="min-w-0 shrink-0 md:max-w-[14rem]">
              <p className="figma-text-m text-grey-dark">{t("bootcampCard.eyebrow")}</p>
              <p className="figma-text-l-bold mt-1 text-surface-bg">{t("bootcampCard.headline")}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="figma-text-m text-surface-bg">{t("bootcampCard.body")}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-1.5 figma-text-m text-surface-bg">
                  <svg aria-hidden className="size-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  {t("bootcampCard.stat1")}
                </span>
                <span className="inline-flex items-center gap-1.5 figma-text-m text-surface-bg">
                  <svg aria-hidden className="size-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  {t("bootcampCard.stat2")}
                </span>
                <span className="inline-flex items-center gap-1.5 figma-text-m text-surface-bg">
                  <svg aria-hidden className="size-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {t("bootcampCard.stat3")}
                </span>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <LinkButton
                  className="w-full justify-center sm:w-auto"
                  href={SITE_PATHS.reservaPlaza}
                  variant="primary"
                >
                  {t("bootcampCard.ctaPrimary")}
                </LinkButton>
                <Link
                  className="inline-flex items-center text-surface-bg underline underline-offset-4 transition-opacity hover:opacity-70"
                  href={SITE_PATHS.reservaPlaza}
                >
                  {t("bootcampCard.ctaSecondary")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
